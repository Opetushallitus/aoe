import { ImageTagMutabilityExclusionFilter, Repository, TagMutability } from 'aws-cdk-lib/aws-ecr'
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib'
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
      imageTagMutabilityExclusionFilters: [ImageTagMutabilityExclusionFilter.wildcard('green-*')]
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
