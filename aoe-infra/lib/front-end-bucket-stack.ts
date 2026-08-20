import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'

interface FrontendBucketStackProps extends StackProps {
  environment: string
}

export class FrontendBucketStack extends Stack {
  readonly bucket: s3.Bucket
  constructor(scope: Construct, id: string, props: FrontendBucketStackProps) {
    super(scope, id, props)

    this.bucket = new s3.Bucket(this, 'FrontEndBucket', {
      bucketName: `aoe-static-content-${props.environment}`,
      enforceSSL: true
    })
  }
}
