# AOE AWS infrastructure

Infrastructure for aoe.fi project, managed with AWS CDK.

## Getting started

Install project dependencies with `npm install` in the `aoe-infra/` directory.

## Authentication

```bash
aws sso login --sso-session oph-federation
```

Then use `--profile <target-account-aws-profile>` with CDK commands.

Example: `npx cdk deploy -c environment=dev DataAnalyticsAuroraStack --profile aoe-dev`

## CDK commands

Deploy/destroy stacks:

- `npx cdk deploy -c environment=<dev/qa/prod/utility> --all` deploy all stacks
- `npx cdk destroy -c environment=<dev/qa/prod/utility> --all` destroy all stacks (empty S3 buckets manually first)
- `npx cdk deploy -c environment=dev WebBackendAuroraStack` deploy a single stack

Other commands:

- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emit synthesized CloudFormation template
- `npm run build` compile TypeScript
- `npm run watch` watch for changes and compile

## Environment variables

- `environments/<environment>.json` contains environment-specific non-sensitive configuration
- AWS Parameter Store contains sensitive variables, prefixed with `/<environment>/<serviceName>/`

## Subnetting

Project uses a /16 network split into /18 per VPC (per environment), further split into 16x /22 subnets with 1022 IP addresses each.

## Adding a new service

1. Add Security Group and rules in `security-groups.ts`
2. Add service/environment config in `environments/<environment>.json`
3. Create a new stack instance of `ecs-service.ts` in `/bin/infra.ts`

## Adding a new database

1. Add Security Group and rules in `security-groups.ts`
2. Add a new secret in `secrets-manager-stack.ts`
3. Add database config in `environments/<environment>.json`
4. Create a new stack instance of `aurora-serverless-database.ts` in `/bin/infra.ts`

Aurora stack creation only creates the master user with a password stored in AWS Secrets Manager (`/auroradbs/<DBNAME>/master-user-password`). Application users must be created and granted separately.

## Configuring Monitoring

Alerts use SNS Topic, AWS ChatBot and Slack:

1. Create plain text parameters `/monitor/slack_channel_id` and `/monitor/slack_workspace_id` in AWS Parameter Store
2. Invite AWS ChatBot to the Slack channel
3. In the AWS account's ChatBot service, configure a new Slack client and authorize
4. Create the Monitor stack with the Slack channel name
5. Use the exported SNS topic for sending alerts

## Database dump for transfer

```bash
pg_dump -Fc --clean -U aoe_db_admin -d aoe > transfer.dump
```

## Database restore in AWS

Secrets are stored in AWS Secrets Manager.

Connect to database from bastion:

    psql -U aoe_db_admin -W -h <rds instance>.amazonaws.com postgres

If you need to drop an existing database:

    DROP DATABASE aoe WITH (FORCE);

Create database and users:

    CREATE DATABASE aoe ENCODING 'utf-8';
    CREATE ROLE reporter WITH PASSWORD '<reporter password>';
    CREATE ROLE aoe_admin  WITH PASSWORD '<aoe_admin password>';

Restore from bastion:

    pg_restore -U aoe_db_admin -W -h <rds instance>.rds.amazonaws.com -d aoe < transfer.dump

Connect to the `aoe` database and grant access:

    psql -U aoe_db_admin -W -h <rds instance>.amazonaws.com aoe

    ALTER ROLE reporter WITH LOGIN;
    ALTER ROLE aoe_admin WITH LOGIN;
    GRANT ALL PRIVILEGES ON DATABASE aoe TO aoe_admin;
    GRANT ALL PRIVILEGES ON SCHEMA public TO aoe_admin;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aoe_admin;
    GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO aoe_admin;
    GRANT CONNECT ON DATABASE aoe TO reporter;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporter;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO reporter;
