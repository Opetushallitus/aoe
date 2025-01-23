import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuroraPostgresEngineVersion, DatabaseCluster, DatabaseClusterEngine, ClusterInstance, DBClusterStorageType, SubnetGroup, ParameterGroup, CaCertificate, Endpoint } from 'aws-cdk-lib/aws-rds';
import { IVpc, ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import * as cdk from 'aws-cdk-lib'

interface AuroraDatabaseProps extends StackProps {
  environment: string;
  auroraVersion: string;
  clusterName: string;
  minSizeAcu: number;
  maxSizeAcu: number;
  performanceInsights: boolean;
  vpc: IVpc,
  securityGroup: ISecurityGroup,
  kmsKey: Key,
  auroraDbPassword: Secret;
  subnetGroup: SubnetGroup;
}

export class AuroraDatabaseStack extends Stack {
  public readonly endPoint: Endpoint;
  constructor(scope: Construct, id: string, props: AuroraDatabaseProps) {
    super(scope, id, props);

    const parameterGroup = new ParameterGroup(this, 'parameterGroup', {
      engine: DatabaseClusterEngine.auroraPostgres({ version: AuroraPostgresEngineVersion.of(props.auroraVersion, props.auroraVersion.split('.')[0]) }),
      parameters: {
        'shared_preload_libraries': 'pg_stat_statements,pg_hint_plan,auto_explain,pg_cron',
        'auto_explain.log_analyze': '1',
        'auto_explain.log_buffers': '1',
        'auto_explain.log_format': 'text',
        'auto_explain.log_min_duration': '5000',
        'auto_explain.log_nested_statements': '1',
        'auto_explain.log_timing': '1',
        'auto_explain.log_verbose': '1',
        'log_min_duration_statement': '5000',
        'log_statement': 'ddl',
        'log_temp_files': '1',
        'max_locks_per_transaction': '150',
        'cron.database_name': props.clusterName,
        'max_connections': '500'
      }
    })

    const auroraCluster = new DatabaseCluster(this, `${props.environment}-${props.clusterName}`, {
      vpc: props.vpc,
      engine: DatabaseClusterEngine.auroraPostgres({ version: AuroraPostgresEngineVersion.of(props.auroraVersion, props.auroraVersion.split('.')[0]) }),
      writer: ClusterInstance.serverlessV2('writer', {
        enablePerformanceInsights: props.performanceInsights,
        caCertificate: CaCertificate.RDS_CA_RSA4096_G1
      }),
      readers: props.environment === 'prod' ? [
        ClusterInstance.serverlessV2('reader', {
          enablePerformanceInsights: props.performanceInsights,
          caCertificate: CaCertificate.RDS_CA_RSA4096_G1,
          scaleWithWriter: true
        }),
      ] : [],
      clusterIdentifier: `${props.environment}-${props.clusterName}`,
      serverlessV2MinCapacity: props.minSizeAcu,
      serverlessV2MaxCapacity: props.maxSizeAcu,
      parameterGroup,
      storageType: DBClusterStorageType.AURORA,
      iamAuthentication: true,
      storageEncrypted: true,
      storageEncryptionKey: props.kmsKey,
      deletionProtection: true,
      securityGroups: [props.securityGroup],
      subnetGroup: props.subnetGroup,
      backup: {
        retention : props.environment === 'prod' ? cdk.Duration.days(30) : cdk.Duration.days(7)
      },
      credentials: {
        username: 'aoe_db_admin',
        password: props.auroraDbPassword.secretValueFromJson('password')
      }
    })

    this.endPoint = auroraCluster.clusterEndpoint
  }
}
