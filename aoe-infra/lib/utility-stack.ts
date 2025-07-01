import * as iam from 'aws-cdk-lib/aws-iam'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class UtilityStack extends cdk.Stack {
  public readonly githubActionsDeploymentRole: iam.Role
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Github Actions OIDC role
    const githubOidcProvider = new iam.OpenIdConnectProvider(this, `OvaraUtilityGithubOidcProvider`, {
      url: 'https://token.actions.githubusercontent.com',
      thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1', '1c58a3a8518e8759bf075b76b750d4f2df264fcd'],
      clientIds: ['sts.amazonaws.com']
    })

    this.githubActionsDeploymentRole = new iam.Role(this, `AoeUtilityGithubActionsUser`, {
      assumedBy: new iam.WebIdentityPrincipal(githubOidcProvider.openIdConnectProviderArn, {
        StringLike: {
          'token.actions.githubusercontent.com:sub': 'repo:Opetushallitus/aoe:*',
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
        }
      }),
      roleName: 'aoe-utility-github-actions-deployment-role'
    })
  }
}
