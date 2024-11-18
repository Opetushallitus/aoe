// Create a new cdk stack for cloudfront
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
// import * as route53 from 'aws-cdk-lib/aws-route53';
// import * as targets from 'aws-cdk-lib/aws-route53-targets';


interface CloudfrontStackProps extends StackProps {
//    domain: string
//    environment: string,
    alb: elbv2.ILoadBalancerV2
    // bucket: s3.Bucket,
}

export class CloudfrontStack extends Stack {
  readonly distribution: cloudfront.Distribution;
  constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
    super(scope, id, props);


// // new certificate
    // const certificate = new acm.Certificate(this, 'Certificate', {
    // domainName: props.domain,
    // validation: acm.CertificateValidation.fromDns(),
    // });

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(props.alb),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    })


    // this.distribution.addBehavior('/static/*', s3origin, { viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS});

    // route53 alias record for cloudfront
    // new route53.ARecord(this, 'AliasRecord', {
    //     zone: route53.HostedZone.fromLookup(this, 'Domain', { domainName: props.domain }),
    //     target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    //     });

    // Add s3 bucket as a new origin for the CloudFront distribution
    // this.distribution.addBehavior('/static/*', new origins.S3Origin(props.bucket ),{
    //   viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    // })
  }
}