import {
  ImageTagMutabilityExclusionFilter,
  Repository,
  TagMutability,
  TagStatus
} from 'aws-cdk-lib/aws-ecr'
import { Duration, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import * as accounts from './accounts.json'

interface EcrStackProps extends StackProps {
  serviceName: string
  githubActionsDeploymentRole: iam.Role
}

export class EcrStack extends Stack {
  public readonly repository: Repository

  constructor(scope: Construct, id: string, props: EcrStackProps) {
    super(scope, id, props)

    this.repository = new Repository(this, 'Repository', {
      repositoryName: `${props.serviceName}`,
      removalPolicy: RemovalPolicy.DESTROY,
      imageTagMutability: TagMutability.IMMUTABLE_WITH_EXCLUSION,
      imageTagMutabilityExclusionFilters: [ImageTagMutabilityExclusionFilter.wildcard('green-*')],
      lifecycleRules: [
        ...['dev', 'qa', 'prod'].map((environment, index) => ({
          rulePriority: index + 1,
          description: `Keep the image ${environment} runs`,
          tagPatternList: [`green-${environment}`],
          maxImageCount: 1
        })),
        {
          rulePriority: 4,
          description: 'Expire other images 14 days after push',
          tagStatus: TagStatus.ANY,
          maxImageAge: Duration.days(14)
        }
      ]
    })

    this.repository.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.AnyPrincipal()],
        actions: [
          'ecr:BatchCheckLayerAvailability',
          'ecr:BatchGetImage',
          'ecr:DescribeImages',
          'ecr:DescribeRepositories',
          'ecr:GetDownloadUrlForLayer'
        ],
        conditions: {
          'ForAnyValue:StringLike': {
            'aws:PrincipalOrgPaths': ['o-cj0uasj87s/*/ou-itpx-p2iprdmt/*']
          }
        }
      })
    )
    this.repository.grantPush(props.githubActionsDeploymentRole)
    for (const account of [accounts.dev, accounts.qa, accounts.prod]) {
      this.repository.grant(
        new iam.AccountPrincipal(account.id),
        'ecr:DescribeImages',
        'ecr:BatchGetImage',
        'ecr:PutImage'
      )
    }
  }
}
