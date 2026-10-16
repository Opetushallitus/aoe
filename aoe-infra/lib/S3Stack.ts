import * as cdk from 'aws-cdk-lib/core'
import { RemovalPolicy } from 'aws-cdk-lib/core'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { BucketAccessControl, ObjectOwnership } from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import { StackProps } from 'aws-cdk-lib'

interface S3StackProps extends StackProps {
  aoeBucketName: string
  aoePdfBucketName: string
  aoeThumbnailBucketName: string
  uploadedMaterialsBucketName: string
  cloudFrontDistribution: cloudfront.IDistribution
  environment: string
}

export function environmentBucketName(bucketName: string, environment: string): string {
  return `${bucketName}-${environment}`
}

export class S3Stack extends cdk.Stack {
  public readonly aoeBucket: s3.Bucket
  public readonly aoePdfBucket: s3.Bucket
  public readonly aoeThumbnailBucket: s3.Bucket
  public readonly uploadedMaterialsBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props)

    this.aoeBucket = this.newBucket(props.aoeBucketName, props)
    this.aoePdfBucket = this.newBucket(props.aoePdfBucketName, props)
    this.aoeThumbnailBucket = this.newBucket(props.aoeThumbnailBucketName, props)
    this.uploadedMaterialsBucket = this.newBucket(props.uploadedMaterialsBucketName, props)

    this.uploadedMaterialsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [this.uploadedMaterialsBucket.arnForObjects('*')],
        conditions: {
          StringEquals: { 'AWS:SourceArn': props.cloudFrontDistribution.distributionArn },
          StringNotEqualsIfExists: {
            's3:ExistingObjectTag/GuardDutyMalwareScanStatus': 'THREATS_FOUND'
          }
        }
      })
    )

    this.uploadedMaterialsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:DeleteBucket'],
        resources: [this.uploadedMaterialsBucket.bucketArn]
      })
    )
  }

  newBucket(bucketName: string, props: S3StackProps): s3.Bucket {
    return new s3.Bucket(this, `${bucketName}Bucket`, {
      bucketName: environmentBucketName(bucketName, props.environment),
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true, // Required for taking backups
      objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED, // Required for restoring backups
      lifecycleRules: [
        {
          id: 'ExpireOldVersions',
          noncurrentVersionExpiration: cdk.Duration.days(30) // Retain old versions for 30 days
        }
      ],
      removalPolicy: RemovalPolicy.RETAIN
    })
  }

  allBuckets(): s3.Bucket[] {
    return Object.values(this).flatMap((v) => (v instanceof s3.Bucket ? v : []))
  }
}
