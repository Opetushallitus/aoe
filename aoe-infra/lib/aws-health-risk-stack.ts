import * as cdk from 'aws-cdk-lib'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions'
import * as events from 'aws-cdk-lib/aws-events'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'
import {
  PAGERDUTY_EVENT_URL_SECRET_NAME,
  PAGERDUTY_HEALTH_EVENT_URL_SECRET_NAME
} from './secrets-manager-stack'

// The OPH organization's SCP denies every other region. us-east-1 receives global events such as
// exposed access keys; their us-west-2 copies are backups, which the rule drops anyway.
export const HEALTH_RISK_REGIONS = ['eu-central-1', 'eu-north-1', 'eu-west-1', 'us-east-1']

interface AwsHealthRiskStackProps extends cdk.StackProps {
  environment: string
}

// Both URLs are resolved by CloudFormation from this region's replica of the secret, so synth and
// diff need neither secret, and neither URL ends up in the template.
function secretUrl(secretName: string): string {
  return cdk.SecretValue.secretsManager(secretName).unsafeUnwrap()
}

export class AwsHealthRiskStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsHealthRiskStackProps) {
    super(scope, id, props)

    const name = `${props.environment}-aoe-aws-health-risk`
    const ruleArn = this.formatArn({ service: 'events', resource: 'rule', resourceName: name })
    const topic = new sns.Topic(this, 'HealthEvents', { topicName: name })
    const failureTopic = new sns.Topic(this, 'DeliveryFailures', { topicName: `${name}-failures` })
    const failurePublishGrant = failureTopic.grantPublish(
      new iam.ServicePrincipal('cloudwatch.amazonaws.com', {
        conditions: { StringEquals: { 'aws:SourceAccount': this.account } }
      })
    )
    const failureSubscription = failureTopic.addSubscription(
      new subscriptions.UrlSubscription(secretUrl(PAGERDUTY_EVENT_URL_SECRET_NAME), {
        protocol: sns.SubscriptionProtocol.HTTPS,
        filterPolicyWithMessageBody: {
          AlarmName: sns.FilterOrPolicy.filter(sns.SubscriptionFilter.existsFilter())
        }
      })
    )

    const metrics: Record<string, cloudwatch.Metric> = {}
    const queues: Record<string, sqs.Queue> = {}
    const queuePolicies: iam.AddToResourcePolicyResult[] = []
    for (const hop of ['eventbridge', 'sns']) {
      const queue = new sqs.Queue(this, `${hop}Dlq`, {
        queueName: `${name}-${hop}-dlq`,
        retentionPeriod: cdk.Duration.days(14),
        encryption: sqs.QueueEncryption.SQS_MANAGED
      })
      queuePolicies.push(
        queue.addToResourcePolicy(
          new iam.PolicyStatement({
            principals: [
              new iam.ServicePrincipal(
                hop === 'eventbridge' ? 'events.amazonaws.com' : 'sns.amazonaws.com'
              )
            ],
            actions: ['sqs:SendMessage'],
            resources: [queue.queueArn],
            conditions: {
              ArnEquals: { 'aws:SourceArn': hop === 'eventbridge' ? ruleArn : topic.topicArn }
            }
          })
        )
      )
      queues[hop] = queue
      metrics[`${hop}-dlq`] = queue.metricApproximateNumberOfMessagesVisible({
        period: cdk.Duration.minutes(1),
        statistic: 'Maximum'
      })
    }

    const subscription = new sns.CfnSubscription(this, 'PagerDutyHealth', {
      topicArn: topic.topicArn,
      protocol: 'https',
      endpoint: secretUrl(PAGERDUTY_HEALTH_EVENT_URL_SECRET_NAME),
      rawMessageDelivery: false,
      redrivePolicy: { deadLetterTargetArn: queues.sns.queueArn },
      deliveryPolicy: {
        healthyRetryPolicy: {
          minDelayTarget: 1,
          maxDelayTarget: 60,
          numRetries: 50,
          numNoDelayRetries: 3,
          numMinDelayRetries: 2,
          numMaxDelayRetries: 35,
          backoffFunction: 'exponential'
        }
      }
    })
    subscription.node.addDependency(...queuePolicies.map((policy) => policy.policyDependable!))

    const topicPolicy = new sns.TopicPolicy(this, 'HealthEventsPolicy', { topics: [topic] })
    topicPolicy.document.addStatements(
      new iam.PolicyStatement({
        principals: [new iam.ServicePrincipal('events.amazonaws.com')],
        actions: ['sns:Publish'],
        resources: [topic.topicArn],
        conditions: { ArnEquals: { 'aws:SourceArn': ruleArn } }
      })
    )

    for (const metricName of ['FailedInvocations', 'InvocationsFailedToBeSentToDlq']) {
      metrics[`eventbridge-${metricName}`] = new cloudwatch.Metric({
        namespace: 'AWS/Events',
        metricName,
        dimensionsMap: { RuleName: name },
        period: cdk.Duration.minutes(1),
        statistic: 'Sum'
      })
    }
    for (const metricName of [
      'NumberOfNotificationsFailed',
      'NumberOfNotificationsFailedToRedriveToDlq'
    ]) {
      metrics[`sns-${metricName}`] = topic.metric(metricName, {
        period: cdk.Duration.minutes(1),
        statistic: 'Sum'
      })
    }

    const alarms = Object.entries(metrics).map(([key, metric]) => {
      const alarm = new cloudwatch.Alarm(this, `${key}Alarm`, {
        alarmName: `${name}-${key}`,
        alarmDescription: `AWS Health RISK delivery to PagerDuty failed in ${this.region}. Failed events are retained in the ${name}-*-dlq queues for 14 days.`,
        metric,
        threshold: 0,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
      })
      const action = new actions.SnsAction(failureTopic)
      alarm.addAlarmAction(action)
      alarm.addOkAction(action)
      alarm.node.addDependency(failureSubscription)
      failurePublishGrant.applyBefore(alarm)
      return alarm
    })

    const rule = new events.CfnRule(this, 'HealthRiskRule', {
      name,
      description: 'All AWS Health RISK events, forwarded to PagerDuty',
      state: 'ENABLED',
      eventPattern: {
        source: ['aws.health'],
        detail: {
          service: ['RISK'],
          // Backup copies would page twice: the Health integration does not deduplicate them.
          $or: [{ backupEvent: ['false'] }, { backupEvent: [{ exists: false }] }]
        }
      },
      targets: [
        {
          id: 'health-risk-sns',
          arn: topic.topicArn,
          retryPolicy: { maximumEventAgeInSeconds: 86400, maximumRetryAttempts: 185 },
          deadLetterConfig: { arn: queues.eventbridge.queueArn }
        }
      ]
    })
    rule.node.addDependency(topicPolicy, subscription, ...alarms)
  }
}
