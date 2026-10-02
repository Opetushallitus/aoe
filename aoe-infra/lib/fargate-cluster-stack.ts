import { Stack, StackProps } from 'aws-cdk-lib'
import { IVpc } from 'aws-cdk-lib/aws-ec2'
import { Key } from 'aws-cdk-lib/aws-kms'
import { Cluster, ExecuteCommandLogging, ICluster, ContainerInsights } from 'aws-cdk-lib/aws-ecs'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'

interface FargateStackProps extends StackProps {
  environment: string
  vpc: IVpc
  logGroupKmsKey: Key
}

export class FargateClusterStack extends Stack {
  readonly fargateCluster: ICluster

  constructor(scope: Construct, id: string, props: FargateStackProps) {
    super(scope, id, props)

    // this.vpc = Vpc.fromLookup(this, "VPC", {
    //   vpcName: `opintopolku-vpc-${props.environmentName}`
    // });

    // add a new log group
    new LogGroup(this, 'EcsExecLogGroup', {
      logGroupName: `${props.environment}-ecs-exec-audit`,
      encryptionKey: props.logGroupKmsKey
    })

    const clusterName = `${props.environment}-ecs-fargate`
    this.fargateCluster = new Cluster(this, 'FargateCluster', {
      clusterName,
      vpc: props.vpc,
      containerInsightsV2: ContainerInsights.ENHANCED,
      executeCommandConfiguration: {
        logging: ExecuteCommandLogging.OVERRIDE,
        logConfiguration: {
          cloudWatchLogGroup: LogGroup.fromLogGroupName(
            this,
            'EcsExecAuditLogGroup',
            `${props.environment}-ecs-exec-audit`
          )
        }
      }
    })

    const ecsEventsLogGroup = new LogGroup(this, 'EcsEventsLogGroup', {
      logGroupName: `/aws/events/ecs/containerinsights/${clusterName}/performance`
    })

    new events.Rule(this, 'EcsEventsRule', {
      ruleName: `${props.environment}-ecs-events`,
      description:
        'Log ECS task, service and deployment events (e.g. stoppedReason) to the log group',
      eventPattern: {
        source: ['aws.ecs']
      },
      targets: [new targets.CloudWatchLogGroup(ecsEventsLogGroup)]
    })
  }
}
