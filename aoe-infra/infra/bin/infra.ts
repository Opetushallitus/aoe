#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as utility from '../environments/utility.json';
import * as dev from '../environments/dev.json';
import * as qa from '../environments/qa.json';
import * as prod from '../environments/prod.json';
import { VpcStack } from '../lib/vpc-stack';
import { SecurityGroupStack } from '../lib/security-groups'
import { AuroraCommonStack } from '../lib/aurora-serverless-common'
import { AuroraDatabaseStack } from '../lib/aurora-serverless-database';
import { AlbStack } from '../lib/alb-stack';
import { CloudfrontStack } from '../lib/cloudfront-stack';
import { KmsStack } from '../lib/kms-stack';
import { FargateClusterStack } from '../lib/fargate-cluster-stack';
import { EcsServiceStack } from '../lib/ecs-service';
import { FrontendBucketStack } from '../lib/front-end-bucket-stack';
import { FrontendStaticContentDeploymentStack } from '../lib/front-end-content-deployment-stack';
import { EcrStack } from '../lib/ecr-stack';
import { UtilityStack } from '../lib/utility-stack';
import { ElasticacheServerlessStack } from '../lib/redis-stack';
import { CpuArchitecture } from 'aws-cdk-lib/aws-ecs';
import { BastionStack } from '../lib/bastion-stack';
import { SecretManagerStack } from '../lib/secrets-manager-stack'
import { OpenSearchServerlessStack } from "../lib/opensearch-stack";
import { HostedZoneStack } from '../lib/hosted-zone-stack'
import { S3Stack } from "../lib/s3Stack";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as iam from "aws-cdk-lib/aws-iam";
import { NamespaceStack } from "../lib/NamespaceStack"
import { EfsStack } from "../lib/efs-stack";

const app = new cdk.App();

// Load up configuration for the environment
const environmentName: string = app.node.tryGetContext("environment");
const utilityAccountId: string = app.node.tryGetContext("UTILITY_ACCOUNT_ID")
let environmentConfig: any;
if (environmentName == 'utility') {
  environmentConfig = utility;
}
else if (environmentName == 'dev') {
  environmentConfig = dev;
}
else if (environmentName == 'qa') {
  environmentConfig = qa;
}
else if (environmentName == 'prod') {
  environmentConfig = prod;
}
else {
  console.error("You must define a valid environment name in CDK context! Valid environment names are dev, qa, prod and utility");
  process.exit(1);
}


// dev, qa & prod account resources..
if (environmentName == 'dev' || environmentName == 'qa' || environmentName == 'prod') {

  // Remember to update KMS key removal policy
  const Kms = new KmsStack(app, 'KmsStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-kms`,
    environment: environmentName
  })

  const Secrets = new SecretManagerStack(app, 'SecretManagerStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-secrets`,
    kmsKey: Kms.secretsManagerKey,
  })

  const Network = new VpcStack(app, 'VpcStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-vpc`,
    vpc_cidr: environmentConfig.aws.vpc_cidr,
    availability_zones: environmentConfig.aws.availability_zones
  })

  const HostedZones = new HostedZoneStack(app, 'HostedZoneStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-hosted-zone`,
    domain: environmentConfig.aws.domain,
    vpc: Network.vpc
  })

  const SecurityGroups = new SecurityGroupStack(app, 'SecurityGroupStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-security-groups`,
    vpc: Network.vpc,
  })

  const BastionHost = new BastionStack(app, 'BastionStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-bastion`,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.bastionSecurityGroup,
    kmsKey: Kms.ebsKmsKey,
    environment: environmentName
  })

  const AuroraCommons = new AuroraCommonStack(app, 'AuroraCommonStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-aurora-common`,
    vpc: Network.vpc,
  })

  const WebBackendAurora = new AuroraDatabaseStack(app, 'WebBackendAuroraStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-web-backend-aurora`,
    auroraVersion: environmentConfig.aurora_databases.web_backend.version,
    environment: environmentName,
    clusterName: "web-backend",
    vpc: Network.vpc,
    securityGroup: SecurityGroups.webBackendAuroraSecurityGroup,
    performanceInsights: environmentConfig.aurora_databases.web_backend.performance_insights,
    minSizeAcu: environmentConfig.aurora_databases.web_backend.min_acu,
    maxSizeAcu: environmentConfig.aurora_databases.web_backend.max_acu,
    domainNames: environmentConfig.aurora_databases.web_backend.domain_names,
    route53HostedZone: HostedZones.privateHostedZone,
    kmsKey: Kms.rdsKmsKey,
    auroraDbPassword: Secrets.webBackendAuroraPassword,
    subnetGroup: AuroraCommons.auroraSubnetGroup,
  })

  const OpenSearch = new OpenSearchServerlessStack(app, 'AOEOpenSearch', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-open-search`,
    collectionName: environmentConfig.open_search.collectionName,
    description: environmentConfig.open_search.collectionDescription,
    securityGroupIds: [SecurityGroups.openSearchSecurityGroup.securityGroupId],
    vpc: Network.vpc,
    kmsKey: Kms.openSearchKmsKey,
    standbyReplicas: environmentConfig.open_search.standbyReplicas
  });

  const SemanticApisRedis = new ElasticacheServerlessStack(app, 'SemanticApisRedis', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-semantic-apis-redis`,
    elasticacheName: "semantic-apis",
    consumingServiceName: "semantic-apis",
    secret: Secrets.semanticApisPassword,
    vpc: Network.vpc,
    securityGroupId: SecurityGroups.semanticApisRedisSecurityGroup.securityGroupId,
    redisKmsKeyId: Kms.redisKmsKey.keyId,
    secretsManagerKmsKeyId: Kms.secretsManagerKey,
    redisMajorVersion: environmentConfig.redis_serverless.semantic_apis.redis_major_version,
    storageMin: environmentConfig.redis_serverless.semantic_apis.storage_min,
    storageMax: environmentConfig.redis_serverless.semantic_apis.storage_max,
    minEcpuPerSecond: environmentConfig.redis_serverless.semantic_apis.min_ecpu_per_second,
    maxEcpuPerSecond: environmentConfig.redis_serverless.semantic_apis.max_ecpu_per_second
  })

  const Alb = new AlbStack(app, 'AlbStack', {
    env: { region: "eu-west-1" },
    crossRegionReferences: true,
    stackName: `${environmentName}-alb`,
    vpc: Network.vpc,
    securityGroupId: SecurityGroups.albSecurityGroup.securityGroupId,
  })

  // Remember to add correct domain
  const Cloudfront = new CloudfrontStack(app, 'CloudFrontStack', {
    env: { region: "eu-west-1" },
    //    crossRegionReferences: true,
    stackName: `${environmentName}-cloudfront`,
    //    environment: environmentName,
    alb: Alb.alb,
    // domain: environmentConfig.aws.domain,
  })


  const FrontEndBucket = new FrontendBucketStack(app, 'FrontEndBucketStack', {
    env: { region: "eu-west-1" },
    //  crossRegionReferences: true,
    stackName: `${environmentName}-frontend-bucket`,
    environment: environmentName,
    cloudFrontDistribution: Cloudfront.distribution,
  })

  const s3BucketStack = new S3Stack(app, 'S3BucketStack', {
    env: { region: "eu-west-1" },
    environment: environmentName,
    aoeBucketName: environmentConfig.S3.aoeBucketName,
    aoePdfBucketName: environmentConfig.S3.aoePdfBucketName,
    aoeThumbnailBucketName: environmentConfig.S3.aoeThumbnailBucketName
  })

  const namespace = new NamespaceStack(app, 'NameSpaceStack', Network.vpc, {
      env: { region: "eu-west-1" }
  })

  const FrontEndBucketDeployment = new FrontendStaticContentDeploymentStack(app, 'FrontEndContentDeploymentStack', {
    env: { region: "eu-west-1" },
    crossRegionReferences: true,
    stackName: `${environmentName}-frontend-deployment`,
    environment: environmentName,
    bucket: FrontEndBucket.bucket,
    cloudFrontDistribution: Cloudfront.distribution,
  })

  const FargateCluster = new FargateClusterStack(app, 'FargateClusterStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-fargate-cluster`,
    environment: environmentName,
    vpc: Network.vpc,
    logGroupKmsKey: Kms.cloudwatchLogsKmsKey
  })

  const buckets = s3BucketStack.allBuckets()
  const s3PolicyStatement = new PolicyStatement({
    actions: ['s3:ListBucket', 's3:PutObject', 's3:GetObject', 's3:DeleteObject'],
    resources: buckets.flatMap((bucket) => [bucket.bucketArn, `${bucket.bucketArn}/*`])
  })

  const efs = new EfsStack(app, 'AOEefsStack', {
    env: { region: 'eu-west-1' },
    vpc: Network.vpc,
    securityGroup: SecurityGroups.efsSecurityGroup,
    accessPointPath: '/data'
  })

  const StreamingAppService = new EcsServiceStack(app, 'StreamingEcsService', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-streaming-app-service`,
    serviceName: 'streaming-app',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.streamingServiceSecurityGroup,
    imageTag: environmentConfig.services.streaming.image_tag,
    allowEcsExec: environmentConfig.services.streaming.allow_ecs_exec,
    taskCpu: environmentConfig.services.streaming.cpu_limit,
    taskMemory: environmentConfig.services.streaming.memory_limit,
    minimumCount: environmentConfig.services.streaming.min_count,
    maximumCount: environmentConfig.services.streaming.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: environmentConfig.services.streaming.env_vars,
    parameter_store_secrets: [],
    secrets_manager_secrets: [],
    utilityAccountId: utilityAccountId,
    alb: Alb.alb,
    listener: Alb.albListener,
    listenerPathPatterns: ["/stream/api/v1*"],
    healthCheckPath: "/",
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 101,
    iAmPolicyStatements: [s3PolicyStatement],
    privateDnsNamespace: namespace.privateDnsNamespace
  })

  const DataServices = new EcsServiceStack(app, 'DataServicesEcsService', {
    env: {region: "eu-west-1"},
    stackName: `${environmentName}-data-services`,
    serviceName: 'data-services',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.dataServicesSecurityGroup,
    imageTag: environmentConfig.services.data_services.image_tag,
    allowEcsExec: environmentConfig.services.data_services.allow_ecs_exec,
    taskCpu: environmentConfig.services.data_services.cpu_limit,
    taskMemory: environmentConfig.services.data_services.memory_limit,
    minimumCount: environmentConfig.services.data_services.min_count,
    maximumCount: environmentConfig.services.data_services.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: environmentConfig.services.data_services.env_vars,
    parameter_store_secrets: [],
    secrets_manager_secrets: [],
    utilityAccountId: utilityAccountId,
    alb: Alb.alb,
    listener: Alb.albListener,
    listenerPathPatterns: [ "/rest/oaipmh*" ],
    healthCheckPath: "/rest/health",
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 103,
    privateDnsNamespace: namespace.privateDnsNamespace
  })

  const aossPolicyStatement = new iam.PolicyStatement({
    actions: [
      'aoss:CreateIndex',
      'aoss:DeleteIndex',
      'aoss:UpdateIndex',
      'aoss:DescribeIndex',
      'aoss:ReadDocument',
      'aoss:WriteDocument',
      'aoss:DescribeCollectionItems',
      'aoss:UpdateCollectionItems',
      'aoss:DeleteCollectionItems',
      'aoss:CreateCollectionItems',
      'aoss:APIAccessAll'
    ],
    resources: [OpenSearch.collectionArn]
  });
  const efsPolicyStatement = new iam.PolicyStatement({
    actions: [
      'elasticfilesystem:DescribeFileSystems',
      'elasticfilesystem:ClientWrite',
      'elasticfilesystem:ClientMount',
      'elasticfilesystem:DescribeMountTargets'
    ],
    resources: [efs.fileSystem.fileSystemArn]
  });

  const WebBackendService = new EcsServiceStack(app, 'WebBackendEcsService', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-web-backend-service`,
    serviceName: 'web-backend',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.webBackendsServiceSecurityGroup,
    imageTag: environmentConfig.services.web_backend.image_tag,
    allowEcsExec: environmentConfig.services.web_backend.allow_ecs_exec,
    taskCpu: environmentConfig.services.web_backend.cpu_limit,
    taskMemory: environmentConfig.services.web_backend.memory_limit,
    minimumCount: environmentConfig.services.web_backend.min_count,
    maximumCount: environmentConfig.services.web_backend.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: environmentConfig.services.web_backend.env_vars,
    parameter_store_secrets: [],
    secrets_manager_secrets: [
      Secrets.secrets.REDIS_PASS,
      Secrets.secrets.PG_PASS,
      Secrets.secrets.SESSION_SECRET,
      Secrets.secrets.CLIENT_SECRET,
      Secrets.secrets.JWT_SECRET,
      Secrets.secrets.PID_API_KEY,
    ],
    utilityAccountId: utilityAccountId,
    alb: Alb.alb,
    listener: Alb.albListener,
    listenerPathPatterns: ["/api/v1*", "/api/v2*", "/h5p/*", "/embed/*"],
    healthCheckPath: "/",
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 102,
    iAmPolicyStatements: [ aossPolicyStatement, s3PolicyStatement,
      efsPolicyStatement
    ],
    privateDnsNamespace: namespace.privateDnsNamespace,
    efs: {
      volume: {
        name: "data",
        efsVolumeConfiguration: {
          fileSystemId: efs.fileSystemId,
          transitEncryption: 'ENABLED',
          authorizationConfig:{
            accessPointId: efs.accessPoint.accessPointId,
            iam: 'ENABLED'
          }
        }
      },
      mountPoint: {
        sourceVolume: 'data',
        containerPath: '/mnt/data',
        readOnly: false,
      }
    }

  })

  const SemanticApisService = new EcsServiceStack(app, 'SemanticApisEcsService', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-semantic-apis-service`,
    serviceName: 'semantic-apis',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.semanticApisServiceSecurityGroup,
    imageTag: environmentConfig.services.semantic_apis.image_tag,
    allowEcsExec: environmentConfig.services.semantic_apis.allow_ecs_exec,
    taskCpu: environmentConfig.services.semantic_apis.cpu_limit,
    taskMemory: environmentConfig.services.semantic_apis.memory_limit,
    minimumCount: environmentConfig.services.semantic_apis.min_count,
    maximumCount: environmentConfig.services.semantic_apis.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: environmentConfig.services.semantic_apis.env_vars,
    parameter_store_secrets: [
    ],
    secrets_manager_secrets: [
      Secrets.secrets.REDIS_PASS,
    ],
    utilityAccountId: utilityAccountId,
    alb: Alb.alb,
    listener: Alb.albListener,
    listenerPathPatterns: ["/ref/api/v1*"],
    healthCheckPath: "/health",
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 100,
    privateDnsNamespace: namespace.privateDnsNamespace
  })

}
else if (environmentName == 'utility') {

  const Utility = new UtilityStack(app, 'UtilityStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-utility`,
  })
  const FrontendEcr = new EcrStack(app, 'FrontendEcrStack', {
    env: { region: "eu-west-1" },
    stackName: 'aoe-web-frontend-ecr',
    serviceName: 'aoe-web-frontend',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  const BackendEcr = new EcrStack(app, 'BackendEcrStack', {
    env: { region: "eu-west-1" },
    stackName: 'aoe-web-backend-ecr',
    serviceName: 'aoe-web-backend',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  const SemanticApisEcr = new EcrStack(app, 'SemanticApisEcrStack', {
    env: { region: "eu-west-1" },
    stackName: 'aoe-semantic-apis-ecr',
    serviceName: 'aoe-semantic-apis',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  const StreamingAppEcr = new EcrStack(app, 'StreamingAppEcrStack', {
    env: { region: "eu-west-1" },
    stackName: 'aoe-streaming-app-ecr',
    serviceName: 'aoe-streaming-app',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  const DataServicesEcr = new EcrStack(app, 'DataServicesEcrStack', {
    env: { region: "eu-west-1" },
    stackName: 'aoe-data-services-ecr',
    serviceName: 'aoe-data-services',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  const DataAnalyticsEcr = new EcrStack(app, 'DataAnalyticsEcrStack', {
    env: { region: "eu-west-1" },
    stackName: 'aoe-data-analytics-ecr',
    serviceName: 'aoe-data-analytics',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
}
