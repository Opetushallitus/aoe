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
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'

const RESTORE_TEST_CLUSTER_PREFIX = 'awsbackup-restore-test'
const VALIDATOR_INSTANCE_PREFIX = 'restore-validator-'

interface BackupStackProps extends StackProps {
  environment: string
  alarmSnsTopic: sns.Topic
  auroraSubnetGroupName: string
  auroraDbPassword: secretsmanager.Secret
  cluster: ecs.ICluster
  utilityAccountId: string
  revision: string
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

    new events.Rule(this, 'RestoreJobStateChangeRule', {
      ruleName: `${props.environment}-aoe-restore-job-state-change`,
      description: 'Log AWS Backup restore job state changes to the log group',
      eventPattern: {
        source: ['aws.backup'],
        detailType: ['Restore Job State Change']
      },
      targets: [new targets.CloudWatchLogGroup(backupEventsLogGroup)]
    })

    const alarmSnsAction = new aws_cloudwatch_actions.SnsAction(props.alarmSnsTopic)
    const backupMetricDimensions = {
      BackupVaultName: backupVault.backupVaultName
    }

    const backupJobFailedAlarm = new cloudwatch.Alarm(this, 'BackupJobFailedAlarm', {
      alarmName: `${props.environment}-aoe-backup-job-failed-alarm`,
      alarmDescription: 'AWS Backup -varmistustyö on epäonnistunut',
      metric: new cloudwatch.Metric({
        metricName: 'NumberOfBackupJobsFailed',
        namespace: 'AWS/Backup',
        dimensionsMap: backupMetricDimensions,
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
        dimensionsMap: backupMetricDimensions,
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
      logGroupName: '/service/aoe-restore-validator',
      retention: logs.RetentionDays.ONE_YEAR
    })

    const validatorFamily = `${props.environment}-aoe-restore-validator`
    const validatorTask = new ecs.FargateTaskDefinition(this, 'RestoreValidatorTask', {
      family: validatorFamily,
      cpu: 256,
      memoryLimitMiB: 512
    })
    const validatorContainer = validatorTask.addContainer('RestoreValidator', {
      containerName: 'aoe-restore-validator',
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryAttributes(this, 'RestoreValidatorRepository', {
          repositoryName: 'aoe-restore-validator',
          repositoryArn: `arn:aws:ecr:${this.region}:${props.utilityAccountId}:repository/aoe-restore-validator`
        }),
        props.revision
      ),
      logging: ecs.LogDrivers.awsLogs({ logGroup: validatorLogGroup, streamPrefix: 'validator' }),
      environment: {
        DB_SECRET_ARN: props.auroraDbPassword.secretArn
      }
    })

    props.auroraDbPassword.grantRead(validatorTask.taskRole)

    const restoreTestClusterArn = this.formatArn({
      service: 'rds',
      resource: 'cluster',
      resourceName: `${RESTORE_TEST_CLUSTER_PREFIX}*`,
      arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME
    })
    const anyClusterArn = this.formatArn({
      service: 'rds',
      resource: 'cluster',
      resourceName: '*',
      arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME
    })
    const validatorInstanceArn = this.formatArn({
      service: 'rds',
      resource: 'db',
      resourceName: `${VALIDATOR_INSTANCE_PREFIX}*`,
      arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME
    })

    validatorTask.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ['rds:ModifyDBCluster', 'rds:EnableHttpEndpoint', 'rds-data:ExecuteStatement'],
        resources: [restoreTestClusterArn]
      })
    )
    validatorTask.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ['rds:CreateDBInstance', 'rds:DeleteDBInstance'],
        resources: [validatorInstanceArn, restoreTestClusterArn]
      })
    )
    validatorTask.addToTaskRolePolicy(
      new iam.PolicyStatement({
        // Listing clusters to find leftover restore-test copies names no identifier, so
        // this cannot be scoped to the restore-test prefix. It is read-only.
        actions: ['rds:DescribeDBClusters'],
        resources: [anyClusterArn]
      })
    )
    validatorTask.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ['rds:DescribeDBInstances'],
        resources: [validatorInstanceArn]
      })
    )
    validatorTask.addToTaskRolePolicy(
      new iam.PolicyStatement({
        // A restore job is not an IAM resource type in AWS Backup, so this cannot be
        // scoped further.
        actions: ['backup:PutRestoreValidationResult'],
        resources: ['*']
      })
    )

    // Only HTTPS leaves the task: every AWS API call, the ECR pull and log shipping use it.
    const validatorSecurityGroup = new ec2.SecurityGroup(this, 'RestoreValidatorSecurityGroup', {
      vpc: props.cluster.vpc,
      description: 'Restore validator task: HTTPS egress only',
      allowAllOutbound: false
    })
    validatorSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'AWS APIs')

    new events.Rule(this, 'RestoreValidationTriggerRule', {
      ruleName: `${props.environment}-aoe-restore-validation-trigger`,
      description: 'Run the restore validator when a restore test completes',
      eventPattern: {
        source: ['aws.backup'],
        detailType: ['Restore Job State Change'],
        detail: {
          status: ['COMPLETED'],
          resourceType: ['Aurora'],
          restoreTestingPlanArn: [restoreTestingPlan.attrRestoreTestingPlanArn]
        }
      },
      targets: [
        new targets.EcsTask({
          cluster: props.cluster,
          taskDefinition: validatorTask,
          launchType: ecs.LaunchType.FARGATE,
          subnetSelection: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
          securityGroups: [validatorSecurityGroup],
          containerOverrides: [
            {
              containerName: validatorContainer.containerName,
              environment: [
                {
                  name: 'RESTORE_JOB_ID',
                  value: events.EventField.fromPath('$.detail.restoreJobId')
                },
                {
                  name: 'CREATED_RESOURCE_ARN',
                  value: events.EventField.fromPath('$.detail.createdResourceArn')
                }
              ]
            }
          ]
        })
      ]
    })

    const stoppedValidatorTask = {
      source: ['aws.ecs'],
      detailType: ['ECS Task State Change'],
      detail: { lastStatus: ['STOPPED'], group: [`family:${validatorFamily}`] }
    }
    const validatorFailedRule = new events.Rule(this, 'RestoreValidatorFailedRule', {
      ruleName: `${props.environment}-aoe-restore-validator-failed`,
      description: 'Restore validator task stopped without exit code 0',
      eventPattern: {
        ...stoppedValidatorTask,
        detail: {
          ...stoppedValidatorTask.detail,
          $or: [
            { containers: { exitCode: [{ 'anything-but': 0 }] } },
            { containers: { exitCode: [{ exists: false }] } }
          ]
        }
      },
      targets: [new targets.CloudWatchLogGroup(backupEventsLogGroup)]
    })
    const validatorSucceededRule = new events.Rule(this, 'RestoreValidatorSucceededRule', {
      ruleName: `${props.environment}-aoe-restore-validator-succeeded`,
      description: 'Restore validator task stopped with exit code 0',
      eventPattern: {
        ...stoppedValidatorTask,
        detail: { ...stoppedValidatorTask.detail, containers: { exitCode: [0] } }
      },
      targets: [new targets.CloudWatchLogGroup(backupEventsLogGroup)]
    })

    const matchedEvents = (rule: events.Rule, period: cdk.Duration) =>
      new cloudwatch.Metric({
        metricName: 'MatchedEvents',
        namespace: 'AWS/Events',
        dimensionsMap: { RuleName: rule.ruleName },
        period,
        statistic: cloudwatch.Stats.SUM
      })

    const restoreJobFailedAlarm = new cloudwatch.Alarm(this, 'RestoreJobFailedAlarm', {
      alarmName: `${props.environment}-aoe-restore-job-failed-alarm`,
      alarmDescription: 'AWS Backup -palautustyö on epäonnistunut',
      metric: new cloudwatch.Metric({
        metricName: 'NumberOfRestoreJobsFailed',
        namespace: 'AWS/Backup',
        dimensionsMap: backupMetricDimensions,
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
        'Palautustestin tarkistus epäonnistui: palautettu data oli virheellistä, tarkistus kaatui tai testikanta jäi poistamatta',
      metric: matchedEvents(validatorFailedRule, cdk.Duration.minutes(15)),
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    })
    validatorFailedAlarm.addAlarmAction(alarmSnsAction)
    validatorFailedAlarm.addOkAction(alarmSnsAction)

    const validationMissingAlarm = new cloudwatch.Alarm(this, 'RestoreValidationMissingAlarm', {
      alarmName: `${props.environment}-aoe-restore-validation-missing-alarm`,
      alarmDescription:
        'Palautustestin tarkistus ei ole onnistunut viimeisen 30 tunnin aikana: tarkistusta ei ole ajettu tai se on epäonnistunut',
      metric: matchedEvents(validatorSucceededRule, cdk.Duration.hours(30)),
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING
    })
    validationMissingAlarm.addAlarmAction(alarmSnsAction)
    validationMissingAlarm.addOkAction(alarmSnsAction)
  }
}
