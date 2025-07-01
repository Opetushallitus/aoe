import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ses from 'aws-cdk-lib/aws-ses'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import * as cdk from 'aws-cdk-lib'
import { EmailIdentity } from 'aws-cdk-lib/aws-ses'

interface sesProps extends StackProps {
  hostedZone: HostedZone
}

export class SesStack extends Stack {
  public emailIdentity: EmailIdentity

  constructor(scope: Construct, id: string, props: sesProps) {
    super(scope, id, props)
    this.emailIdentity = new ses.EmailIdentity(this, 'EmailIdentity', {
      identity: ses.Identity.publicHostedZone(props.hostedZone)
    })

    new cdk.CfnOutput(this, 'EmailIdentityArn', {
      value: this.emailIdentity.emailIdentityArn,
      description: 'The ARN of the SES Email Identity'
    })
  }
}
