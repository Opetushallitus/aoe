import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { IKey } from "aws-cdk-lib/aws-kms";

interface SecretManagerStackProps extends cdk.StackProps {
    kmsKey: IKey;
}

// Stack for secrets generated on the fly (mostly resources that don't support Parameter Store)

export class SecretManagerStack extends cdk.Stack {
    public readonly semanticApisPassword: secretsmanager.Secret;
    constructor(scope: Construct, id: string, props: SecretManagerStackProps) {
      super(scope, id, props);

      this.semanticApisPassword = new secretsmanager.Secret(this, 'secret', {
        secretName: '/service/semantic-apis/REDIS_PASS',
        generateSecretString: {
            secretStringTemplate: JSON.stringify({ }),
            generateStringKey: 'secretkey',
            passwordLength: 16,
            excludeCharacters: '@%*()_+=`~{}|[]\\:";\'?,./'
        },
    });
    }
}



