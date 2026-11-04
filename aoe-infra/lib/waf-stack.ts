import * as cdk from 'aws-cdk-lib'
import * as wafv2 from 'aws-cdk-lib/aws-wafv2'
import { Construct } from 'constructs'

interface WafStackProps extends cdk.StackProps {
  environment: string
  // 'count' only records matches; switch to 'block' once false positives are handled.
  mode: 'count' | 'block'
  // Bucket in eu-west-1, so no logs are stored in us-east-1.
  logBucketName: string
}

// Requests per IP per 5 minutes. Tune from the count-mode metrics before blocking.
const RATE_LIMIT = 3000
const OAI_PMH_RATE_LIMIT = 10000

const OAI_PMH_PATH_PREFIXES = ['/meta/oaipmh', '/meta/v2/oaipmh']

const MANAGED_RULE_GROUPS = [
  'AWSManagedRulesAmazonIpReputationList',
  'AWSManagedRulesKnownBadInputsRuleSet',
  'AWSManagedRulesCommonRuleSet'
]

// CloudFront web ACLs are global (enforced at the edge) but must be created in us-east-1.
export class WafStack extends cdk.Stack {
  readonly webAclArn: string
  constructor(scope: Construct, id: string, props: WafStackProps) {
    super(scope, id, props)

    const block = props.mode === 'block'
    const visibilityConfig = (metricName: string) => ({
      metricName,
      cloudWatchMetricsEnabled: true,
      sampledRequestsEnabled: true
    })

    const oaiPmhPath: wafv2.CfnWebACL.StatementProperty = {
      orStatement: {
        statements: OAI_PMH_PATH_PREFIXES.map((prefix) => ({
          byteMatchStatement: {
            fieldToMatch: { uriPath: {} },
            positionalConstraint: 'STARTS_WITH',
            searchString: prefix,
            textTransformations: [{ priority: 0, type: 'NONE' }]
          }
        }))
      }
    }

    const rateRule = (
      name: string,
      priority: number,
      limit: number,
      scopeDownStatement: wafv2.CfnWebACL.StatementProperty
    ): wafv2.CfnWebACL.RuleProperty => ({
      name,
      priority,
      action: block ? { block: {} } : { count: {} },
      statement: { rateBasedStatement: { aggregateKeyType: 'IP', limit, scopeDownStatement } },
      visibilityConfig: visibilityConfig(name)
    })

    const webAcl = new wafv2.CfnWebACL(this, 'WebAcl', {
      name: `aoe-${props.environment}`,
      scope: 'CLOUDFRONT',
      defaultAction: { allow: {} },
      visibilityConfig: visibilityConfig(`aoe-${props.environment}`),
      rules: [
        rateRule('RateLimit', 0, RATE_LIMIT, { notStatement: { statement: oaiPmhPath } }),
        rateRule('OaiPmhRateLimit', 1, OAI_PMH_RATE_LIMIT, oaiPmhPath),
        ...MANAGED_RULE_GROUPS.map((name, i) => ({
          name,
          priority: 10 + i,
          overrideAction: block ? { none: {} } : { count: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name,
              // Uploads exceed this rule's fixed 8 KB. Its matches are EXCLUDED_AS_COUNT, which the log filter
              // drops; multer's FILE_SIZE_LIMIT enforces the real maximum.
              ...(name === 'AWSManagedRulesCommonRuleSet' && {
                ruleActionOverrides: [{ name: 'SizeRestrictions_BODY', actionToUse: { count: {} } }]
              })
            }
          },
          visibilityConfig: visibilityConfig(name)
        }))
      ]
    })

    new wafv2.CfnLoggingConfiguration(this, 'WafLogging', {
      resourceArn: webAcl.attrArn,
      logDestinationConfigs: [`arn:aws:s3:::${props.logBucketName}`],
      // Counted false positives come from logged-in users; keep their sessions out of the logs.
      redactedFields: [
        { singleHeader: { Name: 'authorization' } },
        { singleHeader: { Name: 'cookie' } }
      ],
      // Only requests a rule matched; logging every allowed request would cost more than WAF itself.
      // loggingFilter is untyped, so CDK passes it through and the keys must be PascalCase.
      loggingFilter: {
        DefaultBehavior: 'DROP',
        Filters: [
          {
            Behavior: 'KEEP',
            Requirement: 'MEETS_ANY',
            Conditions: ['BLOCK', 'COUNT'].map((Action) => ({
              ActionCondition: { Action }
            }))
          }
        ]
      }
    })

    this.webAclArn = webAcl.attrArn
  }
}
