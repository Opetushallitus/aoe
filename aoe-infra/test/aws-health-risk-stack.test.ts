import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import * as cdk from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import * as kms from 'aws-cdk-lib/aws-kms'
import { AwsHealthRiskStack, HEALTH_RISK_REGIONS } from '../lib/aws-health-risk-stack'
import { SecretManagerStack } from '../lib/secrets-manager-stack'

const endpoints = {
  health: '{{resolve:secretsmanager:/pagerduty/health_event_url:SecretString:::}}',
  cloudwatch: '{{resolve:secretsmanager:/pagerduty/event_url:SecretString:::}}'
}

for (const environment of ['dev', 'qa', 'prod']) {
  test(`${environment}: every SCP-allowed region forwards RISK events with both delivery hops protected`, () => {
    assert(HEALTH_RISK_REGIONS.includes('us-east-1'))
    for (const region of HEALTH_RISK_REGIONS) {
      const app = new cdk.App()
      const name = `${environment}-aoe-aws-health-risk`
      const ruleArn = {
        'Fn::Join': [
          '',
          ['arn:', { Ref: 'AWS::Partition' }, `:events:${region}:111111111111:rule/${name}`]
        ]
      }
      const template = Template.fromStack(
        new AwsHealthRiskStack(app, region, {
          env: { account: '111111111111', region },
          environment
        })
      )
      const queueIds = Object.fromEntries(
        Object.entries(template.findResources('AWS::SQS::Queue')).map(([id, queue]) => [
          queue.Properties.QueueName,
          id
        ])
      )
      const topicIds = Object.fromEntries(
        Object.entries(template.findResources('AWS::SNS::Topic')).map(([id, topic]) => [
          topic.Properties.TopicName,
          id
        ])
      )
      template.resourceCountIs('AWS::Events::Rule', 1)
      template.hasResourceProperties('AWS::Events::Rule', {
        State: 'ENABLED',
        EventPattern: {
          source: ['aws.health'],
          detail: {
            service: ['RISK'],
            $or: [{ backupEvent: ['false'] }, { backupEvent: [{ exists: false }] }]
          }
        },
        Targets: [
          Match.objectLike({
            RetryPolicy: { MaximumEventAgeInSeconds: 86400, MaximumRetryAttempts: 185 },
            Arn: { Ref: topicIds[name] },
            DeadLetterConfig: {
              Arn: { 'Fn::GetAtt': [queueIds[`${name}-eventbridge-dlq`], 'Arn'] }
            },
            Input: Match.absent(),
            InputPath: Match.absent(),
            InputTransformer: Match.absent()
          })
        ]
      })
      template.resourceCountIs('AWS::SQS::Queue', 2)
      for (const hop of ['eventbridge', 'sns']) {
        template.hasResourceProperties('AWS::SQS::Queue', {
          QueueName: `${name}-${hop}-dlq`,
          MessageRetentionPeriod: 1209600,
          SqsManagedSseEnabled: true
        })
      }
      template.hasResourceProperties('AWS::SNS::Subscription', {
        Endpoint: endpoints.health,
        TopicArn: { Ref: topicIds[name] },
        Protocol: 'https',
        RawMessageDelivery: false,
        FilterPolicy: Match.absent(),
        RedrivePolicy: {
          deadLetterTargetArn: { 'Fn::GetAtt': [queueIds[`${name}-sns-dlq`], 'Arn'] }
        },
        DeliveryPolicy: {
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
      template.hasResourceProperties('AWS::SNS::Subscription', {
        Endpoint: endpoints.cloudwatch,
        TopicArn: { Ref: topicIds[`${name}-failures`] },
        FilterPolicyScope: 'MessageBody',
        FilterPolicy: { AlarmName: [{ exists: true }] }
      })
      template.hasResourceProperties('AWS::SNS::TopicPolicy', {
        PolicyDocument: {
          Statement: [
            Match.objectLike({
              Action: 'sns:Publish',
              Principal: { Service: 'events.amazonaws.com' },
              Condition: { ArnEquals: { 'aws:SourceArn': ruleArn } }
            })
          ],
          Version: '2012-10-17'
        }
      })
      template.hasResourceProperties('AWS::SNS::TopicPolicy', {
        Topics: [{ Ref: topicIds[`${name}-failures`] }],
        PolicyDocument: {
          Statement: [
            Match.objectLike({
              Action: 'sns:Publish',
              Principal: { Service: 'cloudwatch.amazonaws.com' },
              Condition: { StringEquals: { 'aws:SourceAccount': '111111111111' } }
            })
          ],
          Version: '2012-10-17'
        }
      })
      for (const service of ['events.amazonaws.com', 'sns.amazonaws.com']) {
        const sourceArn = service === 'events.amazonaws.com' ? ruleArn : { Ref: topicIds[name] }
        template.hasResourceProperties('AWS::SQS::QueuePolicy', {
          PolicyDocument: {
            Statement: [
              Match.objectLike({
                Action: 'sqs:SendMessage',
                Principal: { Service: service },
                Condition: { ArnEquals: { 'aws:SourceArn': sourceArn } }
              })
            ],
            Version: '2012-10-17'
          }
        })
      }
      template.resourceCountIs('AWS::CloudWatch::Alarm', 6)
      for (const alarm of Object.values(template.findResources('AWS::CloudWatch::Alarm'))) {
        assert.equal(alarm.Properties.Threshold, 0)
        assert.equal(alarm.Properties.TreatMissingData, 'notBreaching')
        assert.deepEqual(alarm.Properties.AlarmActions, alarm.Properties.OKActions)
        assert.deepEqual(alarm.Properties.AlarmActions, [{ Ref: topicIds[`${name}-failures`] }])
      }
    }
  })
}

test('the CloudWatch integration URL is replicated to every other collector region', () => {
  const app = new cdk.App()
  const stack = new SecretManagerStack(app, 'Secrets', {
    env: { account: '111111111111', region: 'eu-west-1' },
    kmsKey: kms.Key.fromKeyArn(
      new cdk.Stack(app, 'Kms'),
      'Key',
      'arn:aws:kms:eu-west-1:111111111111:key/test'
    ),
    pagerdutyEventUrlReplicaRegions: HEALTH_RISK_REGIONS
  })
  Template.fromStack(stack).hasResourceProperties('AWS::SecretsManager::Secret', {
    Name: '/pagerduty/event_url',
    ReplicaRegions: [{ Region: 'eu-central-1' }, { Region: 'eu-north-1' }, { Region: 'us-east-1' }]
  })
})
