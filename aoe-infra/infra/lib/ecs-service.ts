import * as _ from "lodash"
import { Stack, StackProps, Duration, Fn, CfnOutput, SecretValue, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from "constructs"
import { LogGroup } from "aws-cdk-lib/aws-logs"
import { ICluster, ContainerImage, AwsLogDriver, Secret, FargatePlatformVersion, CpuArchitecture, OperatingSystemFamily, UlimitName, FargateService, TaskDefinition, Compatibility } from "aws-cdk-lib/aws-ecs"
import { IVpc, ISecurityGroup } from "aws-cdk-lib/aws-ec2"
import { ApplicationListenerRule, ApplicationProtocol, ApplicationTargetGroup, IApplicationListener, IApplicationLoadBalancer, ListenerCondition, TargetGroupLoadBalancingAlgorithmType } from "aws-cdk-lib/aws-elasticloadbalancingv2"
import { Repository } from "aws-cdk-lib/aws-ecr"
import { StringParameter } from "aws-cdk-lib/aws-ssm"
import { AdjustmentType } from "aws-cdk-lib/aws-autoscaling"
import * as ssm from "aws-cdk-lib/aws-ssm"
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager"


interface EcsServiceStackProps extends StackProps {
  environment: string
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
  secrets_manager_secrets: any
//  parameter_store_parameters: string[]
  cpuArchitecture: CpuArchitecture
  minimumCount: number
  maximumCount: number
  healthCheckGracePeriod: number
  healthCheckInterval: number
  healthCheckTimeout: number
  securityGroup: ISecurityGroup
}

export class EcsServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    super(scope, id, props)
    // if (this.node.tryGetContext("ImageTag") == undefined) {
    //   console.error("You must define an ImageTag (ga-xxx), latest will not exist")
    //   process.exit(1)
    // }

    // const utilityAccountId = ssm.StringParameter.fromSecureStringParameterAttributes(
    //   this,
    //   'UtilityAccountIdParameter',
    //   {
    //    version: 0,
    //    parameterName: `/aoe/utility_account_id`,
    //   })

  //  const utilityAccountId = SecretValue.ssmSecure('/aoe/utility_account_id').unsafeUnwrap()


    const ImageRepository = Repository.fromRepositoryAttributes(
      this,
      "EcrRepository", {
      repositoryName: `aoe-${props.serviceName}`,
      repositoryArn: `arn:aws:ecr:${Stack.of(this).region}:${props.utilityAccountId}:repository/aoe-${props.serviceName}`
    })


    const ServiceLogGroup = new LogGroup( this, "LogGroup", {
      logGroupName: `/service/${props.serviceName}`,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    // const secretsManagerSecrets = apikey: ecs.Secret.fromSecretsManager(secret),

    // const parameterStoreSecrets = props.parameter_store_secrets.reduce(
    //   (secrets, secretName) =>
    //     Object.assign(secrets, {
    //       [secretName]: Secret.fromSsmParameter(
    //         StringParameter.fromSecureStringParameterAttributes(
    //           this,
    //           `${_.upperFirst(_.camelCase(secretName))}Parameter`,
    //           {
    //             version: 0,
    //             parameterName: `/service/${props.serviceName}/${secretName}`,
    //           }
    //         )
    //       ),
    //     }),
    //   {}
    // ),

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
      ...props.secrets_manager_secrets.reduce((secretsAcc, secretName) => {
        const secret = secretsmanager.Secret.fromSecretNameV2(
         this,
         `${_.upperFirst(_.camelCase(secretName))}Secret`,
         `/service/${props.serviceName}/${secretName}`
        );
        return Object.assign(secretsAcc, {
         [secretName]: Secret.fromSecretsManager(secret, "secretkey"),
        });
       }, {}),
      };


    //  const env_vars = {
    //   // SSM Parameter Store plain text parameters
    //   ...props.parameter_store_parameters.reduce((parameterAcc, parameterName) => {
    //   //  const ssmParameter = ssm.StringParameter.fromStringParameterAttributes(
    //   //   this,
    //   //   `${_.upperFirst(_.camelCase(parameterName))}Parameter`,
    //   //   {
    //   //    version: 0,
    //   //    parameterName: `/service/${props.serviceName}/${parameterName}`,
    //   //   }
    //   //  );
    //    return Object.assign(parameterAcc, {
    //     [parameterName]: ssm.StringParameter.valueForStringParameter(
    //       this, `/service/${props.serviceName}/${parameterName}`),
    //    });
    //   }, {}),
    // };


    const taskDefinition = new TaskDefinition(this, `${props.serviceName}`, {
      cpu: props.taskCpu,
      memoryMiB: props.taskMemory,
      compatibility: Compatibility.FARGATE,
      runtimePlatform: {
        cpuArchitecture:props.cpuArchitecture,
        operatingSystemFamily: OperatingSystemFamily.LINUX
      },
    })
    taskDefinition.addContainer(`${props.serviceName}`, {
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
    const ecsService = new FargateService(
      this,
      "EcsFargateService",
      {
        cluster: props.cluster,
        minHealthyPercent: 100,
        taskDefinition,
        platformVersion: FargatePlatformVersion.LATEST,
        healthCheckGracePeriod: Duration.seconds(props.healthCheckGracePeriod),
        enableExecuteCommand: props.allowEcsExec? true: false,
        circuitBreaker: { rollback: true },
        securityGroups: [props.securityGroup]
      }
    )

    new ApplicationListenerRule(this, 'serviceDefaultRule', {
      listener: props.listener,
      priority: props.albPriority,
      conditions: [
        ListenerCondition.pathPatterns(props.listenerPathPatterns)
      ],
      targetGroups: [ new ApplicationTargetGroup(this, `${props.serviceName}TargetGroup`, {
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
  }
}