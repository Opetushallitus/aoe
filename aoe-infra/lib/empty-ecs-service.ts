import * as lodash from 'lodash'
import * as cdk from 'aws-cdk-lib'
import {
  aws_cloudwatch_actions,
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import {
  AwsLogDriver,
  Compatibility,
  ContainerImage,
  CpuArchitecture,
  FargatePlatformVersion,
  FargateService,
  ICluster,
  OperatingSystemFamily,
  Secret,
  TaskDefinition,
  UlimitName
} from 'aws-cdk-lib/aws-ecs'
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {
  ApplicationListenerRule,
  ApplicationProtocol,
  ApplicationTargetGroup,
  IApplicationListener,
  ListenerCondition,
  TargetGroupLoadBalancingAlgorithmType
} from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import { Repository } from 'aws-cdk-lib/aws-ecr'
import { AdjustmentType } from 'aws-cdk-lib/aws-autoscaling'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery'
import { PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import { Unit } from 'aws-cdk-lib/aws-cloudwatch'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as logsDestinations from 'aws-cdk-lib/aws-logs-destinations'
import * as path from 'node:path'
import { Volume } from 'aws-cdk-lib/aws-ecs/lib/base/task-definition'
import { MountPoint } from 'aws-cdk-lib/aws-ecs/lib/container-definition'
import { SecretEntry } from './secrets-manager-stack'

interface EcsServiceStackProps extends StackProps {
  environment: string
  // Allow any in this case, since we don't want to explicitely type json data
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  env_vars: any
  cluster: ICluster
  vpc: IVpc
  taskCpu: string
  taskMemory: string
  utilityAccountId: string
  serviceName: string
  listener: IApplicationListener
  listenerPathPatterns: string[]
  albPriority: number
  healthCheckPath: string
  revision: string
  allowEcsExec: boolean
  parameter_store_secrets: string[]
  secrets_manager_secrets: SecretEntry[]
  cpuArchitecture: CpuArchitecture
  minimumCount: number
  maximumCount: number
  healthCheckGracePeriod: number
  healthCheckInterval: number
  healthCheckTimeout: number
  securityGroup: ISecurityGroup
  iAmPolicyStatements?: iam.PolicyStatement[]
  privateDnsNamespace: PrivateDnsNamespace
  efs?: {
    mountPoint: MountPoint
    volume: Volume
  }
  alarmSnsTopic: sns.Topic
  errorLogForwarding?: {
    enabled: boolean
  }
}

export class EmptyEcsServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    super(scope, id, props)
  }
}
