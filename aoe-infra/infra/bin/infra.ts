#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as utility from '../environments/utility.json';
import * as dev from '../environments/dev.json';
import * as qa from '../environments/qa.json';
import * as prod from '../environments/prod.json';
import { VpcStack } from '../lib/vpc-stack';
import { SecurityGroupStack } from '../lib/security-groups'
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
import {  ElasticacheServerlessStack } from '../lib/redis-stack';
import { SubnetGroupsStack } from '../lib/subnet-groups'
import { CpuArchitecture } from 'aws-cdk-lib/aws-ecs';
import { BastionStack } from '../lib/bastion-stack';
import { SecretManagerStack } from '../lib/secrets-manager-stack'

const app = new cdk.App();

// Load up configuration for the environment
const environmentName: string = app.node.tryGetContext("environment");
const utilityAccountId: string = app.node.tryGetContext("UTILITY_ACCOUNT_ID")
let environmentConfig: any;
if (environmentName == 'utility') 
{
  environmentConfig = utility;
} 
else if (environmentName == 'dev') 
{
  environmentConfig = dev;
} 
else if (environmentName == 'qa') 
{
  environmentConfig = qa;
} 
else if (environmentName == 'prod') 
{
  environmentConfig = prod;
} 
else 
{
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

  const SubnetGroups = new SubnetGroupsStack(app, 'SubnetGroupsStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-subnet-groups`,
    environment: environmentName,
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

/* 
  const TestAuroraStack = new AuroraDatabaseStack(app, 'TestAuroraStack', {
    env: { region: "eu-west-1" },
    stackName: `${environmentName}-test-aurora`,
    auroraVersion: "11.1",
    environment: environmentName,
    clusterName: "test-aurora",
    vpc: Network.vpc,
    securityGroup: SecurityGroups.testAuroraSecurityGroup,
    performanceInsights: environmentConfig.aws.performance_insights,
    minSizeAcu: environmentConfig.aws.min_acu,
    maxSizeAcu: environmentConfig.aws.max_acu,
    domainNames: environmentConfig.aws.domain_names,
    route53HostedZone: environmentConfig.aws.route53_hosted_zone,
    kmsKey: Kms.rdsKmsKey,
  })
*/

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
    // env_vars: {
    //   LOG_LEVEL: "debug",
    //   PORT_LISTEN: "8080",
    //   REDIS_HOST: "asdasd",
    //   REDIS_PORT: "6379",
    //   REDIS_USERNAME: "app",
    //   REDIS_EXPIRE_TIME: "86400",
    //   EXTERNAL_API_CALLERID_OID: "1.2.246.562.10.2013112012294919827487",
    //   EXTERNAL_API_CALLERID_SERVICE: "aoe",
    //   EXTERNAL_API_OPINTOPOLKU_KOODISTOT: "https://virkailija.opintopolku.fi/koodisto-service/rest/json",
    //   EXTERNAL_API_FINTO_ASIASANAT: "http://api.finto.fi/rest/v1",
    //   EXTERNAL_API_SUOMI_KOODISTOT: "https://koodistot.suomi.fi/codelist-api/api/v1/coderegistries",
    //   EXTERNAL_API_OPINTOPOLKU_ORGANISAATIOT: "https://virkailija.opintopolku.fi/organisaatio-service/rest",
    //   EXTERNAL_API_OPINTOPOLKU_EPERUSTEET: "https://virkailija.opintopolku.fi/eperusteet-service/api"
    // },
    env_vars: environmentConfig.services.semantic_apis.env_vars,
    parameter_store_secrets: [ 
    ],
    secrets_manager_secrets: [ 
      "REDIS_PASS",
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
//    domain: environmentConfig.aws.domain,
  })

// utility account resources.. 
} 
else if (environmentName == 'utility') 
{

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