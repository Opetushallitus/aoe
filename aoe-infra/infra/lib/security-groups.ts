import * as cdk from 'aws-cdk-lib/core';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

/*
Security Groups for resources are defined here.
Security Groups defined in a centralized manner like this won't generate
an "order of creation" - dependency between the services / databases, 
but adds a little operational complexity (when creating a new 
service / database, Security Groups and  SG rules must first be defined here)
*/

interface SecurityGroupStackProps extends StackProps {
    vpc: ec2.IVpc
}

export class SecurityGroupStack extends cdk.Stack {
  public readonly semanticApisServiceSecurityGroup: ec2.SecurityGroup;
  public readonly albSecurityGroup: ec2.SecurityGroup;
  public readonly testAuroraSecurityGroup: ec2.SecurityGroup;
  public readonly semanticApisRedisSecurityGroup: ec2.SecurityGroup;
  public readonly bastionSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityGroupStackProps) {
    super(scope, id, props);

// Security Groups
    this.bastionSecurityGroup = new ec2.SecurityGroup(this, 'BastionSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    this.albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    this.semanticApisServiceSecurityGroup = new ec2.SecurityGroup(this, 'SemanticApisServiceSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    this.testAuroraSecurityGroup = new ec2.SecurityGroup(this, 'AuroraTestSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    this.semanticApisRedisSecurityGroup = new ec2.SecurityGroup(this, 'SemanticApisRedisSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
    });

// Security Group rules

    this.semanticApisRedisSecurityGroup.addIngressRule(
      this.semanticApisServiceSecurityGroup,
      ec2.Port.tcp(6379)
    );
    this.semanticApisRedisSecurityGroup.addIngressRule(
      this.bastionSecurityGroup,
      ec2.Port.tcp(6379)
    );
    this.semanticApisServiceSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(8080)
    );
    this.semanticApisServiceSecurityGroup.addIngressRule(
      this.bastionSecurityGroup,
      ec2.Port.tcp(8080)
    );
    // allow port 80 to alb albSecuritygroup from Internet
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80)
    );
    
// Output all security group IDs so that they can be consumed from ECS service/RDS stacks
  new CfnOutput(this, 'albSecurityGroupId', { value: this.albSecurityGroup.securityGroupId });
  new CfnOutput(this, 'semanticApisServiceSecurityGroup', { value: this.semanticApisServiceSecurityGroup.securityGroupId });
  new CfnOutput(this, 'testAuroraSecurityGroup2Id', { value: this.testAuroraSecurityGroup.securityGroupId });
  }

}