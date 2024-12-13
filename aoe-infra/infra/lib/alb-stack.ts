// Create a new cdk stack with a public ALB and a security group for it. Add a https listener with http redirect rule to https. Create outputs for alb and listener.
import * as cdk from 'aws-cdk-lib'; 
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as log from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as globalaccelerator from 'aws-cdk-lib/aws-globalaccelerator';
import * as ga_endpoints from 'aws-cdk-lib/aws-globalaccelerator-endpoints';
import { Construct } from 'constructs';

interface AlbStackProps extends cdk.StackProps {
    vpc: ec2.IVpc,
    securityGroupId: string,
    domain: string
//    domain: string
}

export class AlbStack extends cdk.Stack {
    readonly alb: elbv2.ApplicationLoadBalancer;
    readonly albListener: elbv2.ApplicationListener;
    readonly certificate: acm.ICertificate;
    constructor(scope: Construct, id: string, props: AlbStackProps) {
      super(scope, id, props);

// New internet-facing application load balancer, import vpc from the VpcStack
    this.alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
    vpc: props.vpc,
    vpcSubnets: {
        onePerAz: true,
        subnetType: ec2.SubnetType.PUBLIC
      },
    internetFacing: true,
    http2Enabled: true,
    securityGroup: ec2.SecurityGroup.fromSecurityGroupId(
        this,
        "ImmutableSecurityGroup",
        props.securityGroupId,
        { mutable: false }
      )
    });
// Use this when an actual domain is available for ACM certs
//    new alb listener
    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName: props.domain,
      validation: acm.CertificateValidation.fromDns(),
      });

    this.albListener = this.alb.addListener('alb-listener', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      open: false,
      certificates: [this.certificate],
      sslPolicy: elbv2.SslPolicy.TLS12,
    });


    // create ALB default target group
    const albDefaultTargetGroup = new elbv2.ApplicationTargetGroup(this, 'alb-target-group', {
        vpc: props.vpc,
        port: 80,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetType: elbv2.TargetType.IP,
        healthCheck: {
          healthyThresholdCount: 5,
          interval: cdk.Duration.seconds(30),
          path: '/',
          protocol: elbv2.Protocol.HTTP,
          timeout: cdk.Duration.seconds(5),
          unhealthyThresholdCount: 2
        },
      });

    this.albListener.addTargetGroups('dummyTargetGroup', {
      targetGroups: [albDefaultTargetGroup]
    });

  }
}