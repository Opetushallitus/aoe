import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as iam from 'aws-cdk-lib/aws-iam'
import { StackProps } from "aws-cdk-lib";

interface CommonStackProps extends StackProps {
  environment: string
}

export class GithubActionsStack extends cdk.Stack {
  public githubActionsRole: iam.Role

  constructor(scope: Construct, id: string, props: CommonStackProps) {
    super(scope, id, props)

    const githubOidcProvider = new iam.OpenIdConnectProvider(this, `GithubOidcProvider`, {
      url: 'https://token.actions.githubusercontent.com',
      thumbprints: [
        '6938fd4d98bab03faadb97b34396831e3780aea1',
        '1c58a3a8518e8759bf075b76b750d4f2df264fcd'
      ],
      clientIds: ['sts.amazonaws.com'],
    });

    this.githubActionsRole = new iam.Role(this, `AoeGithubActionsUser`, {
      assumedBy: new iam.WebIdentityPrincipal(
        githubOidcProvider.openIdConnectProviderArn,
        {
          StringLike: {
            'token.actions.githubusercontent.com:sub': 'repo:Opetushallitus/aoe:*',
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
        },
      ),
      roleName: `aoe-github-actions-deployment-role-${props.environment}`,
    });

    const cdkPolicyStatement = new iam.PolicyStatement({
      actions: [ 'sts:AssumeRole', 'iam:PassRole'],
      resources: [
        "arn:aws:iam::*:role/cdk-hnb659fds-deploy-role-*",
        "arn:aws:iam::*:role/cdk-hnb659fds-file-publishing-*",
        "arn:aws:iam::*:role/cdk-hnb659fds-image-publishing-*",
        "arn:aws:iam::*:role/cdk-hnb659fds-lookup-*",
        "arn:aws:iam::*:role/cdk-hnb659fds-cfn-exec-*"
      ]
    })
    this.githubActionsRole.addToPolicy(cdkPolicyStatement)

  }
}
