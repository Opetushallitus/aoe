import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import { existsSync } from 'fs'
import * as path from 'path'

interface FrontendStackProps extends StackProps {
  bucket: s3.IBucket
  cloudFrontDistribution: cloudfront.Distribution
}

const UNHASHED_PATHS = ['index.html', 'i18n/*', 'robots.txt', 'assets/*']
const NOT_PUBLISHED = ['prerendered-routes.json', '3rdpartylicenses.txt']

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props)

    const distPath = path.join(__dirname, '../../aoe-web-frontend/dist')
    if (!existsSync(distPath)) {
      throw new Error(
        `No frontend build at ${distPath}. deploy-scripts/deploy.sh builds it before running cdk; ` +
          'build it by hand if you are invoking cdk directly.'
      )
    }

    const hashedAssets = new s3deploy.BucketDeployment(this, 'HashedAssets', {
      sources: [s3deploy.Source.asset(distPath, { exclude: NOT_PUBLISHED })],
      destinationBucket: props.bucket,
      exclude: UNHASHED_PATHS,
      prune: false,
      memoryLimit: 512,
      cacheControl: [
        s3deploy.CacheControl.setPublic(),
        s3deploy.CacheControl.maxAge(Duration.days(365)),
        s3deploy.CacheControl.immutable()
      ]
    })

    const entryPoints = new s3deploy.BucketDeployment(this, 'EntryPoints', {
      sources: [s3deploy.Source.asset(distPath, { exclude: NOT_PUBLISHED })],
      destinationBucket: props.bucket,
      exclude: ['*'],
      include: UNHASHED_PATHS,
      prune: false,
      memoryLimit: 512,
      cacheControl: [s3deploy.CacheControl.noCache()],
      distribution: props.cloudFrontDistribution,
      distributionPaths: ['/*']
    })
    entryPoints.node.addDependency(hashedAssets)
  }
}
