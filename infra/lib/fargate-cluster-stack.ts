import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';
import { IKey, Key } from 'aws-cdk-lib/aws-kms';
import { Cluster, ExecuteCommandLogging, ICluster } from 'aws-cdk-lib/aws-ecs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface FargateStackProps extends StackProps {
  environment: string,
  vpc: IVpc,
  logGroupKmsKey: Key
}

export class FargateClusterStack extends Stack {
  readonly fargateCluster: ICluster;

  constructor(scope: Construct, id: string, props: FargateStackProps) {
    super(scope, id, props);

    // this.vpc = Vpc.fromLookup(this, "VPC", {
    //   vpcName: `opintopolku-vpc-${props.environmentName}`
    // });

    // add a new log group
    const EcsExecLogGroup = new LogGroup(this, "EcsExecLogGroup", {
      logGroupName: `${props.environment}-ecs-exec-audit`,
      encryptionKey: props.logGroupKmsKey,
    });

    this.fargateCluster = new Cluster(this, "FargateCluster", {
      clusterName: `${props.environment}-ecs-fargate`,
      vpc: props.vpc,
      executeCommandConfiguration: {
        logging: ExecuteCommandLogging.OVERRIDE,
        logConfiguration: {
          cloudWatchLogGroup: LogGroup.fromLogGroupName(
            this,
            "EcsExecAuditLogGroup",
            `${props.environment}-ecs-exec-audit`)
        }
      }
    });
  }
}