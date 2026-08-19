import { Stack, StackProps, aws_cloudwatch_actions } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
  BackupPlan,
  BackupPlanRule,
  BackupVault,
  CfnRestoreTestingPlan,
  CfnRestoreTestingSelection
} from 'aws-cdk-lib/aws-backup'
import { Schedule } from 'aws-cdk-lib/aws-events'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as cdk from 'aws-cdk-lib'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as path from 'path'

const RESTORE_TEST_CLUSTER_PREFIX = 'awsbackup-restore-test'
const VALIDATOR_INSTANCE_PREFIX = 'restore-validator-'

interface BackupStackProps extends StackProps {
  environment: string
  alarmSnsTopic: sns.Topic
  auroraSubnetGroupName: string
  auroraDbPassword: secretsmanager.Secret
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
      description: 'Log terminal AWS Backup backup job states to the log group',
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

    const restoreTestingRole = new iam.Role(this, 'RestoreTestingRole', {
      assumedBy: new iam.ServicePrincipal('backup.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSBackupServiceRolePolicyForRestores'
        )
      ]
    })

    const restoreTestingPlan = new CfnRestoreTestingPlan(this, 'RestoreTestingPlan', {
      // Restore testing plan and selection names permit only alphanumerics and
      // underscores, so neither can follow the hyphenated convention used elsewhere in
      // this stack. Note the AWS docs claim the *selection* name allows hyphens; it does
      // not, and the API rejects it with "Invalid restore testing selection name".
      restoreTestingPlanName: `${props.environment}_aoe_restore_testing_plan`,
      scheduleExpression: 'cron(20 11 ? * * *)',
      scheduleExpressionTimezone: 'Europe/Helsinki',
      startWindowHours: 4,
      recoveryPointSelection: {
        algorithm: 'LATEST_WITHIN_WINDOW',
        includeVaults: [backupVault.backupVaultArn],
        recoveryPointTypes: ['SNAPSHOT'],
        selectionWindowDays: 3
      }
    })

    new CfnRestoreTestingSelection(this, 'RestoreTestingSelection', {
      restoreTestingPlanName: restoreTestingPlan.restoreTestingPlanName,
      restoreTestingSelectionName: `${props.environment}_aoe_aurora_selection`,
      protectedResourceType: 'Aurora',
      iamRoleArn: restoreTestingRole.roleArn,
      protectedResourceArns: ['*'],
      validationWindowHours: 1,
      restoreMetadataOverrides: {
        dbSubnetGroupName: props.auroraSubnetGroupName
      }
    })

    const validatorLogGroup = new logs.LogGroup(this, 'RestoreValidatorLogGroup', {
      logGroupName: `/aws/lambda/${props.environment}-aoe-restore-validator`,
      retention: logs.RetentionDays.ONE_YEAR
    })

    // NodejsFunction bundles the AWS SDK from package.json. The runtime-provided SDK is
    // pinned to a minor version that varies by runtime and region, and AWS states that
    // PutRestoreValidationResult is not available through it at all, so relying on the
    // runtime SDK would leave the validation result silently unreported.
    const validator = new NodejsFunction(this, 'RestoreValidator', {
      functionName: `${props.environment}-aoe-restore-validator`,
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: path.join(__dirname, '..', 'lambda', 'restore-validator', 'index.ts'),
      handler: 'handler',
      timeout: cdk.Duration.minutes(15),
      memorySize: 256,
      logGroup: validatorLogGroup,
      retryAttempts: 0,
      bundling: {
        externalModules: []
      },
      environment: {
        DB_SECRET_ARN: props.auroraDbPassword.secretArn
      }
    })

    props.auroraDbPassword.grantRead(validator)

    const restoreTestClusterArn = this.formatArn({
      service: 'rds',
      resource: 'cluster',
      resourceName: `${RESTORE_TEST_CLUSTER_PREFIX}*`,
      arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME
    })
    const validatorInstanceArn = this.formatArn({
      service: 'rds',
      resource: 'db',
      resourceName: `${VALIDATOR_INSTANCE_PREFIX}*`,
      arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME
    })

    validator.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rds:ModifyDBCluster', 'rds:EnableHttpEndpoint', 'rds-data:ExecuteStatement'],
        resources: [restoreTestClusterArn]
      })
    )
    validator.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rds:CreateDBInstance', 'rds:DeleteDBInstance'],
        resources: [validatorInstanceArn, restoreTestClusterArn]
      })
    )
    validator.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rds:DescribeDBClusters'],
        resources: [restoreTestClusterArn]
      })
    )
    validator.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rds:DescribeDBInstances'],
        resources: [validatorInstanceArn]
      })
    )
    validator.addToRolePolicy(
      new iam.PolicyStatement({
        // A restore job is not an IAM resource type in AWS Backup, so this cannot be
        // scoped further.
        actions: ['backup:PutRestoreValidationResult'],
        resources: ['*']
      })
    )

    new events.Rule(this, 'RestoreValidationTriggerRule', {
      ruleName: `${props.environment}-aoe-restore-validation-trigger`,
      description: 'Invoke the restore validator when a restore test completes',
      eventPattern: {
        source: ['aws.backup'],
        detailType: ['Restore Job State Change'],
        detail: {
          status: ['COMPLETED'],
          resourceType: ['Aurora'],
          restoreTestingPlanArn: [restoreTestingPlan.attrRestoreTestingPlanArn]
        }
      },
      targets: [new targets.LambdaFunction(validator)]
    })

    new events.Rule(this, 'RestoreJobStateChangeRule', {
      ruleName: `${props.environment}-aoe-restore-job-state-change`,
      description: 'Log AWS Backup restore job state changes to the log group',
      eventPattern: {
        source: ['aws.backup'],
        detailType: ['Restore Job State Change']
      },
      targets: [new targets.CloudWatchLogGroup(backupEventsLogGroup)]
    })

    const restoreJobFailedAlarm = new cloudwatch.Alarm(this, 'RestoreJobFailedAlarm', {
      alarmName: `${props.environment}-aoe-restore-job-failed-alarm`,
      alarmDescription: 'AWS Backup -palautustyö on epäonnistunut',
      metric: new cloudwatch.Metric({
        metricName: 'NumberOfRestoreJobsFailed',
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
    restoreJobFailedAlarm.addAlarmAction(alarmSnsAction)
    restoreJobFailedAlarm.addOkAction(alarmSnsAction)

    const validatorFailedAlarm = new cloudwatch.Alarm(this, 'RestoreValidatorFailedAlarm', {
      alarmName: `${props.environment}-aoe-restore-validator-failed-alarm`,
      alarmDescription:
        'Palautustestin tarkistus epäonnistui: palautettu tietokanta ei sisältänyt odotettua dataa, tai tarkistus kaatui',
      metric: validator.metricErrors({ period: cdk.Duration.minutes(15) }),
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    })
    validatorFailedAlarm.addAlarmAction(alarmSnsAction)
    validatorFailedAlarm.addOkAction(alarmSnsAction)
  }
}
