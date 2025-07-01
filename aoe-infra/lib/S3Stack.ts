import * as cdk from 'aws-cdk-lib/core'
import { RemovalPolicy } from 'aws-cdk-lib/core'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { BucketAccessControl, ObjectOwnership } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { StackProps } from 'aws-cdk-lib'

interface S3StackProps extends StackProps {
  aoeBucketName: string
  aoePdfBucketName: string
  aoeThumbnailBucketName: string
  environment: string
}

export class S3Stack extends cdk.Stack {
  public readonly aoeBucket: s3.Bucket
  public readonly aoePdfBucket: s3.Bucket
  public readonly aoeThumbnailBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props)

    this.aoeBucket = this.newBucket(props.aoeBucketName, props)
    this.aoePdfBucket = this.newBucket(props.aoePdfBucketName, props)
    this.aoeThumbnailBucket = this.newBucket(props.aoeThumbnailBucketName, props)
  }

  newBucket(bucketName: string, props: S3StackProps): s3.Bucket {
    return new s3.Bucket(this, `${bucketName}Bucket`, {
      bucketName: `${bucketName}-${props.environment}`,
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
