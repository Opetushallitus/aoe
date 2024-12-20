import * as _ from "lodash"
import { Stack, StackProps, Duration, CfnOutput, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from "constructs"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { ICluster, ContainerImage, AwsLogDriver, Secret, FargatePlatformVersion, CpuArchitecture, OperatingSystemFamily, UlimitName, FargateService, TaskDefinition, Compatibility } from "aws-cdk-lib/aws-ecs"
import { IVpc, ISecurityGroup } from "aws-cdk-lib/aws-ec2"
import { ApplicationListenerRule, ApplicationProtocol, ApplicationTargetGroup, IApplicationListener, IApplicationLoadBalancer, ListenerCondition, TargetGroupLoadBalancingAlgorithmType } from "aws-cdk-lib/aws-elasticloadbalancingv2"
import { Repository } from "aws-cdk-lib/aws-ecr"
import { AdjustmentType } from "aws-cdk-lib/aws-autoscaling"
import * as ssm from "aws-cdk-lib/aws-ssm"
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager"
import * as iam from "aws-cdk-lib/aws-iam";
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
import { PrivateDnsNamespace } from "aws-cdk-lib/aws-servicediscovery";
import { Volume } from "aws-cdk-lib/aws-ecs/lib/base/task-definition";
import { MountPoint } from "aws-cdk-lib/aws-ecs/lib/container-definition";
import { SecretEntry } from "./secrets-manager-stack";


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
  alb: IApplicationLoadBalancer
  albPriority: number
  healthCheckPath: string
  imageTag: string
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
}

export class EcsServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    super(scope, id, props)

    const ImageRepository = Repository.fromRepositoryAttributes(
      this,
      "EcrRepository", {
      repositoryName: `aoe-${props.serviceName}`,
      repositoryArn: `arn:aws:ecr:${Stack.of(this).region}:${props.utilityAccountId}:repository/aoe-${props.serviceName}`
    })


    const ServiceLogGroup = new LogGroup(this, "LogGroup", {
      logGroupName: `/service/${props.serviceName}`,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const secrets = {
      // SSM Parameter Store secure strings
      ...props.parameter_store_secrets.reduce((secretsAcc, secretName) => {
        const ssmParameter = ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          `${_.upperFirst(_.camelCase(secretName))}Parameter`,
          {
            version: 0,
            parameterName: `/service/${props.serviceName}/${secretName}`,
          }
        );
        return Object.assign(secretsAcc, {
          [secretName]: Secret.fromSsmParameter(ssmParameter),
        });
      }, {}),
      ...(props.secrets_manager_secrets || []).reduce((secretsAcc, se) => {

        const secret = secretsmanager.Secret.fromSecretNameV2(
          this,
          `${_.upperFirst(_.camelCase(se.path))}Secret`,
          se.path
        );

        return Object.assign(secretsAcc, {
          [se.envVarName]: Secret.fromSecretsManager(secret, se.secretKey),
        });
      }, {})
    };

    const taskDefinition = new TaskDefinition(this, `${props.serviceName}`, {
      cpu: props.taskCpu,
      memoryMiB: props.taskMemory,
      compatibility: Compatibility.FARGATE,
      runtimePlatform: {
        cpuArchitecture: props.cpuArchitecture,
        operatingSystemFamily: OperatingSystemFamily.LINUX
      }
    })

    if (props.iAmPolicyStatements && Array.isArray(props.iAmPolicyStatements)) {
      props.iAmPolicyStatements.forEach(statement => {
        taskDefinition.addToTaskRolePolicy(statement);
      });
    }

    const container = taskDefinition.addContainer(`${props.serviceName}`, {

      image: ContainerImage.fromEcrRepository(
        ImageRepository,
        props.imageTag
      ),
      logging: new AwsLogDriver({
        logGroup: ServiceLogGroup,
        streamPrefix: `${props.serviceName}`,
      }),
      portMappings: [{ containerPort: 8080 }],
      containerName: `${props.serviceName}`,
      secrets: secrets,
      environment: props.env_vars,
      ulimits: [
        {
          name: UlimitName.NOFILE,
          softLimit: 63536,
          hardLimit: 63536
        }
      ]
    })

    if (props.efs) {
      taskDefinition.addVolume(props.efs.volume);
      container.addMountPoints(props.efs.mountPoint);
    }

    const ecsService = new FargateService(
      this,
      "EcsFargateService",
      {
        cluster: props.cluster,
        minHealthyPercent: 100,
        taskDefinition,
        platformVersion: FargatePlatformVersion.LATEST,
        healthCheckGracePeriod: Duration.seconds(props.healthCheckGracePeriod),
        enableExecuteCommand: props.allowEcsExec,
        circuitBreaker: { rollback: true },
        securityGroups: [props.securityGroup],
        cloudMapOptions: {
          name: props.serviceName,
          cloudMapNamespace: props.privateDnsNamespace,
          dnsRecordType: servicediscovery.DnsRecordType.A,
          dnsTtl: Duration.seconds(15),
        },
      }
    )

    new ApplicationListenerRule(this, 'serviceDefaultRule', {
      listener: props.listener,
      priority: props.albPriority,
      conditions: [
        ListenerCondition.pathPatterns(props.listenerPathPatterns)
      ],
      targetGroups: [new ApplicationTargetGroup(this, `${props.serviceName}TargetGroup`, {
        targets: [ecsService],
        vpc: props.vpc,
        healthCheck: {
          path: `${props.healthCheckPath}`,
          interval: Duration.seconds(props.healthCheckInterval),
          healthyThresholdCount: 2,
          timeout: Duration.seconds(props.healthCheckTimeout)
        },
        port: 8080,
        protocol: ApplicationProtocol.HTTP,
        deregistrationDelay: Duration.seconds(5),
        loadBalancingAlgorithmType: TargetGroupLoadBalancingAlgorithmType.LEAST_OUTSTANDING_REQUESTS
      })]
    })

    const scalingTarget = ecsService.autoScaleTaskCount({
      minCapacity: props.minimumCount,
      maxCapacity: props.maximumCount,
    })

    scalingTarget.scaleOnMetric("CpuStepAutoscaling", {
      metric: ecsService.metricCpuUtilization(),
      scalingSteps: [
        { upper: 5, change: -2 },
        { upper: 15, change: -1 },
        { lower: 45, change: +1 },
        { lower: 85, change: +2 }
      ],
      adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: Duration.minutes(3),
    })

    new CfnOutput(this, 'ServiceDiscoveryName', {
      value: `${props.serviceName}.${props.privateDnsNamespace.namespaceName}`,
    });
  }
}
