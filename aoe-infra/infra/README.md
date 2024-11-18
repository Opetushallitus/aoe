# AOE AWS infrastructure

Infrastructure for aoe.fi - project

## Getting started

If you wish to run the CDK - commands from your local machine, install the global depencencies: `nodejs 20, npm, npx` and install the project dependencies with `npm install` in the `/infra` - directory.

## AWS vault

When deploying to the target environment from your local machine, use `aws-vault exec <target-aws-profile>` and then proceed with cdk - commands.


## Useful commands

* `npx cdk deploy -c environment=<dev/qa/prod/utility> --all`  deploy all stacks to the target environment
* `npx cdk destroy -c environment=<dev/qa/prod/utility> --all`  destroy all stacks to the target environment (note: you need to empty S3 - buckets etc. manually)
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

First, add a new Security Group and Security Group rules to the `security-groups.ts`, add the service/environment specific database configuration into `environments/<environment>.json` then create a new stack instance of `rds-database.ts` in the `/bin/infra.ts`