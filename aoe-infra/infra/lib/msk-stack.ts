import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { IVpc, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import * as msk from "aws-cdk-lib/aws-msk";
import { Key } from "aws-cdk-lib/aws-kms";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Duration } from "aws-cdk-lib";

interface MskStackProps extends cdk.StackProps {
  volumeSize: number;
  instanceType: string;
  numberOfBrokerNodes: number;
  vpc: IVpc;
  securityGroup: SecurityGroup;
  env: { region: string };
  kmsKey: Key,
  clusterName: string,
  version: string
}

export class MskStack extends cdk.Stack {

  public readonly kafkaCluster: msk.CfnCluster;
  public readonly bootstrapBrokers: string;

  constructor(scope: Construct, id: string, props: MskStackProps) {
    super(scope, id, props);

    this.kafkaCluster = new msk.CfnCluster(this, "AOEKafkaCluster", {

      brokerNodeGroupInfo: {
        securityGroups: [ props.securityGroup.securityGroupId ],
        clientSubnets: props.vpc.privateSubnets.map(subnet => subnet.subnetId),
        instanceType: props.instanceType,
        storageInfo: {
          ebsStorageInfo: {
            volumeSize: props.volumeSize
          }
        }
      },
      clusterName: props.clusterName,
      kafkaVersion: props.version,
      numberOfBrokerNodes: props.numberOfBrokerNodes,
      clientAuthentication: {
        sasl: {
          iam: {
            enabled: true
          }
        }
      },
      encryptionInfo: {
        encryptionInTransit: {
          inCluster: true,
          clientBroker: "TLS",
        },
        encryptionAtRest: {
          dataVolumeKmsKeyId: props.kmsKey.keyId,
        },
      },
    });

    const getBootstrapBrokersLambda = new lambda.Function(this, 'GetBootstrapBrokersLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          const { KafkaClient, GetBootstrapBrokersCommand } = require("@aws-sdk/client-kafka"); // CommonJS import
          const client = new KafkaClient();
          const clusterArn = event.ResourceProperties.ClusterArn;
        
          if (event.RequestType === 'Delete') {
            return { PhysicalResourceId: clusterArn };
          }
        
          try {
            const command = new GetBootstrapBrokersCommand({ ClusterArn: clusterArn });
            const response = await client.send(command);
     
            return {
              PhysicalResourceId: clusterArn,
              Data: {
                BootstrapBrokerStringSaslIam: response.BootstrapBrokerStringSaslIam,
              },
            };
          } catch (error) {
            console.error(error);
            throw new Error('Failed to retrieve bootstrap brokers: ' + error.message);
          }
        };
      `),
      timeout: Duration.minutes(2),
      initialPolicy: [
        new iam.PolicyStatement({
          actions: ['kafka:GetBootstrapBrokers'],
          resources: [this.kafkaCluster.attrArn],
        }),
      ],
    });

    const customResourceProvider = new cr.Provider(this, 'CustomResourceProvider', {
      onEventHandler: getBootstrapBrokersLambda,
    });

    const bootstrapBrokersResource = new cdk.CustomResource(this, 'BootstrapBrokersResource', {
      serviceToken: customResourceProvider.serviceToken,
      properties: {
        ClusterArn: this.kafkaCluster.attrArn,
      },
    });

    this.bootstrapBrokers = bootstrapBrokersResource.getAttString('BootstrapBrokerStringSaslIam')

    new cdk.CfnOutput(this, 'BootstrapServers', {
      value: this.bootstrapBrokers,
    });

  }
}
