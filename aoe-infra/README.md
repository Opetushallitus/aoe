# AOE AWS infrastructure

Infrastructure for aoe.fi - project

## Getting started

If you wish to run the CDK - commands from your local machine, install the global depencencies: `nodejs 20, npm, npx` and install the project dependencies with `npm install` in the `/infra` - directory.

## AWS vault

When deploying to the target environment from your local machine, use `aws-vault exec <target-aws-profile>` and then proceed with cdk - commands. AWS vault targets the destination account explicitly.

Alternatively, you can use aws cli v2:

`aws sso login --sso-session oph-org-sso` where `oph-org-sso` profile must match the profile configured in your `~/.aws/config`

With aws sso login spell above, you must define `--profile <target-account-aws-profile>`

Example: `npx cdk deploy -c environment=dev DataAnalyticsAuroraStack --profile aoe-dev`


## cdk command examples for deploying the project stacks

* `npx cdk deploy -c environment=<dev/qa/prod/utility> --all`  deploy all stacks to the target environment
* `npx cdk destroy -c environment=<dev/qa/prod/utility> --all`  destroy all stacks to the target environment (note: you need to empty S3 - buckets etc. manually)
* `npx npx cdk deploy -c environment=dev WebBackendAuroraStack` deploy only WebBackendAuroraStack (and any change in it's dependencies)
* `npx npx cdk destroy -c environment=dev WebBackendAuroraStack` destroy only WebBackendAuroraStack (and any change in it's dependencies)

## Generic cdk commands
* `npx cdk diff`    compare deployed stack with current state
* `npx npm run build`   compile typescript to js
* `npx npm run watch`   watch for changes and compile
* `npx npm run test`    perform the jest unit tests
* `npx cdk synth`   emits the synthesized CloudFormation template

## Environment variables

Environment variables have been split into two places;

* `environments/<environment>.json` contains environment specific non-sensitive configuration
* AWS Parameter Store contains variables with sensitive information. Parameters in the parameter store are expected to be prefixed with `/<environment>/<serviceName>/`

## Subnetting

Project uses a /16 network which has been split into /18 per VPC (=per environment), which in turn is designed to be split into 16x /22 networks with 1022 IP - addresses available per subnet.

## Adding a new service

First, add a new Security Group and Security Group rules to the `security-groups.ts`, add the service/environment specific configuration into `environments/<environment>.json` then create a new stack instance of `ecs-service.ts` in the `/bin/infra.ts`

## Adding a new database

Then, 
- add a new Security Group and Security Group rules to the `security-groups.ts`, 
- add a new secret in the `secrets-manager-stack.ts`
- add the service/environment specific database configuration into `environments/<environment>.json` 
- create a new stack instance of `aurora-serverless-database.ts` in the `/bin/infra.ts`

Aurora stack creation only creates database master user with a password stored in the AWS Secrets Manager (`/auroradbs/<DBNAME>/master-user-password`). Application user must be created (and granted) separately.

### Database dump for transfer

Following options are recommended for dumping the database:

    pg_dump -Fc --clean -U aoe_db_admin -d aoe > transfer.dump

### Database restore in AWS
j
Secrets are stored in AWS Secrets Manager. Database restore to empty RDS-environment is done in following way:

Connect to database `postgres` from bastion:

    psql -U aoe_db_admin -W -h <rds instance>.amazonaws.com postgres

Create database and users:

    CREATE DATABASE aoe ENCODING 'utf-8';
    CREATE ROLE reporter WITH PASSWORD '<reporter password>';
    CREATE ROLE aoe_admin  WITH PASSWORD '<aoe_admin password>';

From bastion, run restore:

    pg_restore -U aoe_db_admin -W -h <rds instance>.rds.amazonaws.com --no-owner --role=aoe_db_admin -d aoe < transfer.dump

Connect to database `aoe` from bastion:

    psql -U aoe_db_admin -W -h <rds instance>.amazonaws.com aoe

Grant access:

    ALTER ROLE reporter WITH LOGIN;
    ALTER ROLE aoe_admin WITH LOGIN;
    GRANT ALL PRIVILEGES ON DATABASE aoe TO aoe_admin;
    GRANT ALL PRIVILEGES ON SCHEMA public TO aoe_admin;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aoe_admin;
    GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO aoe_admin;
    GRANT CONNECT ON DATABASE aoe TO reporter;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporter;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO reporter;

Exit `psql`.

