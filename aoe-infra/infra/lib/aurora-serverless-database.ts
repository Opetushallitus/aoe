import { Stack, StackProps, Fn, Duration, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuroraPostgresEngineVersion, DatabaseCluster, DatabaseClusterEngine, ClusterInstance, DBClusterStorageType, SubnetGroup, ParameterGroup, CaCertificate } from 'aws-cdk-lib/aws-rds';
import { HostedZone, CnameRecord, IHostedZone } from 'aws-cdk-lib/aws-route53'
import { IVpc, ISecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

interface AuroraDatabaseProps extends StackProps {
  environment: string;
  auroraVersion: string;
  route53HostedZone: IHostedZone;
  clusterName: string;
  minSizeAcu: number;
  maxSizeAcu: number;
  performanceInsights: boolean;
  domainNames: string[];
  vpc: IVpc,
  securityGroup: ISecurityGroup,
  kmsKey: Key,
  auroraDbPassword: Secret;
  subnetGroup: SubnetGroup;
};

export class AuroraDatabaseStack extends Stack {
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

    //    const aurora_master_username = Secret.fromSecretPartialArn(this, 'aurora_master_username', `arn:aws:secretsmanager:${props.env?.region}:${props.env?.account}:secret:/auroradbs/common/master-user-username`)

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
      credentials: {
        username: 'aoe_db_admin',
        password: props.auroraDbPassword.secretValueFromJson('password')
      }
    })
    for (let i in props.domainNames) {
      new CnameRecord(this, `${props.environment}-cname-${props.domainNames[i].replace('.', '-')}`, {
        domainName: auroraCluster.clusterEndpoint.hostname,
        zone: props.route53HostedZone,
        recordName: `${props.domainNames[i]}.auroradb.${props.route53HostedZone.zoneName}`,
        ttl: Duration.minutes(1)
      })
    }
  }
}
