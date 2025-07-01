// Create a CDK stack that creates RDS subnet groups
import { IVpc, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib'
import * as ElastiCache from 'aws-cdk-lib/aws-elasticache'
import * as rds from 'aws-cdk-lib/aws-rds'

interface SubnetGroupsStackProps extends StackProps {
  vpc: IVpc
  environment: string
}

export class SubnetGroupsStack extends Stack {
  public readonly auroraSubnetGroup: rds.SubnetGroup
  public readonly elastiCacheSubnetGroup: ElastiCache.CfnSubnetGroup
  constructor(scope: Construct, id: string, props: SubnetGroupsStackProps) {
    super(scope, id, props)

    // Subnet group for Aurora instnaces
    // const auroraSubnetIds : string[] = [];
    // for (const subnet of props.vpc.isolatedSubnets) {
    //   auroraSubnetIds.push(subnet.subnetId);
    // }

    // this.auroraSubnetGroup = new rds.CfnDBSubnetGroup(this, "AuroraSubnetGroup", {
    //   dbSubnetGroupDescription: "Aurora Subnet Group CDK",
    //   dbSubnetGroupName: "aurora-subnet-group",
    //   subnetIds: auroraSubnetIds,
    // });
    // ///

    this.auroraSubnetGroup = new rds.SubnetGroup(this, 'AuroraSubnetGroup', {
      description: 'Subnet Group for Aurora databases',
      vpc: props.vpc,

      // the properties below are optional
      removalPolicy: RemovalPolicy.DESTROY,
      subnetGroupName: `${props.environment}SubnetGroup`,
      vpcSubnets: {
        availabilityZones: ['availabilityZones'],
        onePerAz: false,
        subnets: props.vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_ISOLATED
        }).subnets
      }
    })
    ///

    // Subnet group for ElastiCache instances
    // const elastiCacheSubnetIds  : string[] = [];
    // const elastiCacheSubnetGroupName = "ElastiCacheSubnetGroup";
    // for (const subnet of props.vpc.isolatedSubnets) {
    // elastiCacheSubnetIds.push(subnet.subnetId);
    // }

    // this.elastiCacheSubnetGroup = new ElastiCache.CfnSubnetGroup(
    // this,
    // elastiCacheSubnetGroupName.toLowerCase(),
    // {
    //     description: "ElastiCache Subnet Group",
    //     cacheSubnetGroupName: elastiCacheSubnetGroupName.toLowerCase(),
    //     subnetIds: elastiCacheSubnetIds,
    // }
    // );
  }
}
