// Create a new cdk stack for cloudfront
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { readFileSync } from 'fs'

interface CloudfrontStackProps extends StackProps {
  domain: string
  publicHostedZone: route53.IHostedZone
  environment: string
  alb: elbv2.ILoadBalancerV2
  certificate: acm.ICertificate
  requireTestAuth: boolean
}

const BACKEND_PATH_PATTERNS = [
  '/api/*',
  '/h5p/*',
  '/embed/material/*',
  '/embed/download/*',
  '/embed/pdf/*',
  '/content/*',
  '/ref/api/v1*',
  '/meta/oaipmh*',
  '/meta/v2/oaipmh*',
  '/stream/api/v1*'
]

const BACKEND_PREFIXES_MARKER = 'const BACKEND_PREFIXES = []'

export class CloudfrontStack extends Stack {
  readonly distribution: cloudfront.Distribution
  readonly frontendBucket: s3.Bucket
  constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
    super(scope, id, props)

    this.frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `aoe-frontend-${props.environment}`,
      accessControl: s3.BucketAccessControl.PRIVATE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN
    })

    const kvStore = props.requireTestAuth
      ? new cloudfront.KeyValueStore(this, 'KeyValueStore', { keyValueStoreName: 'authStore' })
      : undefined

    const viewerRequestAssociation = {
      function: new cloudfront.Function(this, 'RequestFunction', {
        functionName: 'ViewerRequest',
        runtime: cloudfront.FunctionRuntime.JS_2_0,
        code: cloudfront.FunctionCode.fromInline(this.renderViewerRequestCode()),
        keyValueStore: kvStore
      }),
      eventType: cloudfront.FunctionEventType.VIEWER_REQUEST
    }

    const cookieResponseAssociations = props.requireTestAuth
      ? [
          {
            function: new cloudfront.Function(this, 'ResponseFunction', {
              functionName: 'BasicAuthCookie',
              runtime: cloudfront.FunctionRuntime.JS_2_0,
              code: cloudfront.FunctionCode.fromFile({
                filePath: './resources/functions/cookie-response.js'
              }),
              keyValueStore: kvStore
            }),
            eventType: cloudfront.FunctionEventType.VIEWER_RESPONSE
          }
        ]
      : []

    const spaBehavior: cloudfront.BehaviorOptions = {
      origin: origins.S3BucketOrigin.withOriginAccessControl(this.frontendBucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      functionAssociations: [viewerRequestAssociation, ...cookieResponseAssociations]
    }

    const albBehavior: cloudfront.BehaviorOptions = {
      origin: new origins.LoadBalancerV2Origin(props.alb, {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY
      }),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      functionAssociations: props.requireTestAuth ? [viewerRequestAssociation] : undefined
    }

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: [props.domain],
      certificate: props.certificate,
      defaultRootObject: 'index.html',
      defaultBehavior: spaBehavior,
      additionalBehaviors: Object.fromEntries(
        BACKEND_PATH_PATTERNS.map((pattern) => [pattern, albBehavior])
      )
    })

    // route53 alias record for cloudfront
    new route53.ARecord(this, 'AliasRecord', {
      zone: props.publicHostedZone,
      recordName: props.domain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution))
    })
  }

  private renderViewerRequestCode(): string {
    const source = readFileSync('./resources/functions/viewer-request.js', 'utf8')
    if (!source.includes(BACKEND_PREFIXES_MARKER)) {
      throw new Error(
        `viewer-request.js no longer contains "${BACKEND_PREFIXES_MARKER}", so the backend paths ` +
          'cannot be injected and every backend request would be rewritten to /index.html.'
      )
    }
    const prefixes = BACKEND_PATH_PATTERNS.map((pattern) => pattern.replace(/\*$/, ''))
    return source.replace(
      BACKEND_PREFIXES_MARKER,
      `const BACKEND_PREFIXES = ${JSON.stringify(prefixes)}`
    )
  }
}
