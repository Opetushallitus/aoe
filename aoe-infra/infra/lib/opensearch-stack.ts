import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ops from 'aws-cdk-lib/aws-opensearchserverless';
import { Key } from "aws-cdk-lib/aws-kms";

interface OpenSearchServerlessStackProps extends cdk.StackProps {
    collectionName: string;
    description: string;
    vpc: ec2.IVpc;
    securityGroupIds: string[];
    kmsKey: Key;
}

export class OpenSearchServerlessStack extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props: OpenSearchServerlessStackProps) {
        super(scope, id, props);

        const vpce = new ops.CfnVpcEndpoint(this, 'VpcEndPoint,', {
            name: 'AOEOpenSearchEndpoint',
            subnetIds: props.vpc.isolatedSubnets.map(x => x.subnetId),
            vpcId: props.vpc.vpcId,
            securityGroupIds: props.securityGroupIds,
        });

        const collection = new ops.CfnCollection(this, 'AOECollection', {
            name: props.collectionName,
            description: props.description,
            type: 'SEARCH',
            standbyReplicas: 'DISABLED'
        });

        const encryptionPolicy = new ops.CfnSecurityPolicy(this, 'EncryptionPolicy', {
            name: 'aoe-serverless-encryption-policy',
            type: 'encryption',
            policy: JSON.stringify({
                Rules: [
                    {
                        ResourceType: 'collection',
                        Resource: [collection.attrArn],
                        AWSOwnedKey: false,
                        KmsKeyArn: props.kmsKey.keyArn,
                    },
                ],
            }),
        });

        const networkPolicy = new ops.CfnSecurityPolicy(this, 'NetworkPolicy', {
            name: 'aoe-serverless-network-policy',
            type: 'network',
            policy: JSON.stringify({
                Rules: [
                    {
                        ResourceType: 'collection',
                        Resource: [collection.attrArn],
                        Description: 'Allow access from VPC only',
                        SourceVPCEs: [
                            `vpce-${props.vpc.vpcId}`,
                        ],
                    },
                ],
                "AllowFromPublic": false
            }),
        });

        const dataAccessPolicy = new ops.CfnAccessPolicy(this, 'DataAccessPolicy', {
            name: `${props.collectionName}-dap`,
            description: `Data access policy for: ${props.collectionName}`,
            type: "data",

            policy: JSON.stringify({
                Principal: [],
                Rules: [

                    {
                        ResourceType: 'collection',
                        Resource: [collection.attrArn],
                        "Permission": [
                            "aoss:CreateCollectionItems",
                            "aoss:UpdateCollectionItems",
                            "aoss:DescribeCollectionItems"
                        ]
                    },
                    {
                        ResourceType: 'index',
                        Resource: [
                            `index/${props.collectionName}/*`,
                        ],
                        Permission: [
                            'aoss:*'
                        ]
                    }
                ]
            })

        })


        collection.addDependency(encryptionPolicy);
        collection.addDependency(networkPolicy);
        // collection.addDependency(dataAccessPolicy);

        new cdk.CfnOutput(this, 'CollectionArn', {
            value: collection.attrArn,
        });
        new cdk.CfnOutput(this, 'CollectionEndpoint', {
            value: collection.attrCollectionEndpoint,
        });
    }
}