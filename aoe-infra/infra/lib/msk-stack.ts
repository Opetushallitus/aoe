import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { IVpc, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import * as msk from "aws-cdk-lib/aws-msk";
import { Key } from "aws-cdk-lib/aws-kms";

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

  public kafkaCluster: msk.CfnCluster;

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

  }
}