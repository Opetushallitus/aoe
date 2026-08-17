import { Stack, StackProps, aws_cloudwatch_actions } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BackupPlan, BackupPlanRule, BackupVault } from 'aws-cdk-lib/aws-backup'
import { Schedule } from 'aws-cdk-lib/aws-events'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as cdk from 'aws-cdk-lib'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as sns from 'aws-cdk-lib/aws-sns'

interface BackupStackProps extends StackProps {
  environment: string
  alarmSnsTopic: sns.Topic
}

export class BackupStack extends Stack {
  public readonly backupPlan: BackupPlan

  constructor(scope: Construct, id: string, props: BackupStackProps) {
    super(scope, id, props)

    const isProd = props.environment === 'prod'

    const backupVault = new BackupVault(this, 'BackupVault', {
      backupVaultName: `${props.environment}-aoe-backup-vault`,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    })

    this.backupPlan = new BackupPlan(this, 'BackupPlan', {
      backupPlanName: `${props.environment}-aoe-backup-plan`,
      backupVault,
      backupPlanRules: [
        new BackupPlanRule({
          ruleName: 'Daily',
          scheduleExpression: Schedule.cron({ hour: '22', minute: '0' }),
          startWindow: cdk.Duration.hours(2),
          deleteAfter: cdk.Duration.days(isProd ? 35 : 7)
        }),
        new BackupPlanRule({
          ruleName: 'Monthly7Year',
          scheduleExpression: Schedule.cron({ day: '1', hour: '20', minute: '0' }),
          startWindow: cdk.Duration.hours(2),
          deleteAfter: cdk.Duration.days(365 * 7)
        })
      ]
    })

    const backupEventsLogGroup = new logs.LogGroup(this, 'BackupEventsLogGroup', {
      logGroupName: `/aws/events/${props.environment}/aoe-backup-jobs`,
      retention: logs.RetentionDays.ONE_YEAR
    })

    new events.Rule(this, 'BackupJobStateChangeRule', {
      ruleName: `${props.environment}-aoe-backup-job-state-change`,
      description: 'Kirjaa AWS Backup -varmistustöiden lopputilat lokiryhmään',
      eventPattern: {
        source: ['aws.backup'],
        detailType: ['Backup Job State Change'],
        detail: {
          state: ['COMPLETED', 'FAILED', 'EXPIRED', 'ABORTED']
        }
      },
      targets: [new targets.CloudWatchLogGroup(backupEventsLogGroup)]
    })

    const alarmSnsAction = new aws_cloudwatch_actions.SnsAction(props.alarmSnsTopic)

    const backupJobFailedAlarm = new cloudwatch.Alarm(this, 'BackupJobFailedAlarm', {
      alarmName: `${props.environment}-aoe-backup-job-failed-alarm`,
      alarmDescription: 'AWS Backup -varmistustyö on epäonnistunut',
      metric: new cloudwatch.Metric({
        metricName: 'NumberOfBackupJobsFailed',
        namespace: 'AWS/Backup',
        period: cdk.Duration.minutes(15),
        statistic: cloudwatch.Stats.SUM
      }),
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    })
    backupJobFailedAlarm.addAlarmAction(alarmSnsAction)
    backupJobFailedAlarm.addOkAction(alarmSnsAction)

    const backupJobMissingAlarm = new cloudwatch.Alarm(this, 'BackupJobMissingAlarm', {
      alarmName: `${props.environment}-aoe-backup-job-missing-alarm`,
      alarmDescription:
        'AWS Backup ei ole tehnyt yhtään onnistunutta varmistusta viimeisen 25 tunnin aikana',
      metric: new cloudwatch.Metric({
        metricName: 'NumberOfBackupJobsCompleted',
        namespace: 'AWS/Backup',
        period: cdk.Duration.hours(25),
        statistic: cloudwatch.Stats.SUM
      }),
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING
    })
    backupJobMissingAlarm.addAlarmAction(alarmSnsAction)
    backupJobMissingAlarm.addOkAction(alarmSnsAction)
  }
}
