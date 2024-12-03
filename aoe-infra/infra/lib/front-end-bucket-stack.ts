import * as cdk from 'aws-cdk-lib/core'
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketAccessControl, ObjectOwnership } from 'aws-cdk-lib/aws-s3'
import { RemovalPolicy } from 'aws-cdk-lib/core'


interface FrontendBucketStackProps extends StackProps {
    environment: string,
    cloudFrontDistribution: cloudfront.Distribution,
}

export class FrontendBucketStack extends Stack {
    readonly bucket: s3.Bucket;
    constructor(scope: Construct, id: string, props: FrontendBucketStackProps) {
        super(scope, id, props);

        // FrontEnd S3 bucket - OAI does not support KMS - encryption
        this.bucket = new s3.Bucket(this, 'FrontEndBucket', {
            bucketName: `aoe-static-content-${props.environment}`,
            enforceSSL: true,
            accessControl: BucketAccessControl.PRIVATE,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            versioned: true, // Required for taking backups
            objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED, // Required for restoring backups
            lifecycleRules: [
                {
                    id: 'ExpireOldVersions',
                    noncurrentVersionExpiration: cdk.Duration.days(30), // Retain old versions for 30 days
                }
            ],
            removalPolicy: RemovalPolicy.RETAIN
        });

        // CloudFront OAI, Origin & behaviour
        const s3oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
        const s3origin = new origins.S3Origin(this.bucket, { originAccessIdentity: s3oai });

        props.cloudFrontDistribution.addBehavior('/static/*', s3origin, {
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        });
    }
} 
