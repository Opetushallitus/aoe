# AOE AWS infrastructure

Infrastructure for aoe.fi project, managed with AWS CDK.

## Getting started

Install project dependencies with `npm install` in the `aoe-infra/` directory.

## Authentication

```bash
aws sso login --sso-session oph-federation
```

Then use `--profile <target-account-aws-profile>` with CDK commands.

Example: `npx cdk deploy -c environment=dev WebBackendAuroraStack --profile aoe-dev`

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
- `npm test` compile and run infrastructure template tests (also run by `01-build.sh`)

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

### AWS Health RISK events → PagerDuty

Dev, qa and prod each get a collector in the four regions the OPH organization's SCP
allows (`eu-central-1`, `eu-north-1`, `eu-west-1`, `us-east-1`, listed in
`lib/aws-health-risk-stack.ts`). This includes `us-east-1`, where AWS publishes global
events such as exposed access keys. If the SCP starts allowing another region, add it
to the list; the utility account is not covered here.

Each collector sends the complete EventBridge event through a dedicated SNS topic
to PagerDuty's **AWS Health** integration on the account's existing PagerDuty service.
It matches every `aws.health` event with `detail.service: RISK`, regardless of event
code or category. AWS backup copies (`detail.backupEvent: "true"`) are excluded:
the Health integration does not deduplicate deliveries, so those copies would page
twice. Event updates can still open new incidents, and backup-copy filtering means
there is no global-event failover if EventBridge in `us-east-1` is unavailable.

Both delivery hops have 14-day encrypted dead-letter queues and retries. Six alarms
per region cover queued failures, failed deliveries and failures to write to DLQs.
They use a separate SNS topic subscribed to the existing **CloudWatch** integration;
they do not send raw Health events to `Monitor.topic`, whose PagerDuty subscription
only accepts messages containing `AlarmName`.

#### One-time rollout (before the next CI deployment)

Both URLs are CloudFormation dynamic references, resolved in each collector's own
region, so synth, diff and CI need neither secret, and the GitHub deployment role
needs no access to them. `/pagerduty/event_url` is replicated by `SecretManagerStack`;
`/pagerduty/health_event_url` is created and replicated by hand. Repeat for `dev`,
`qa` and `prod`, using an SSO administrator session:

1. Add an **AWS Health** integration to the account's PagerDuty service. This is
   managed in `rcs-common/services/pagerduty/configuration/` using
   `aws_health_risk_destinations` (EU vendor ID `PZGYQKH`). Copy its Integration URL,
   not an Events v2 routing key and not the existing CloudWatch URL.
2. Store the URL as a **plain string**, with the default AWS-managed Secrets Manager
   key, in `/pagerduty/health_event_url` in **eu-west-1**, and replicate it to the
   other collector regions. Replicas follow later changes to the value.

   ```bash
   ENV=dev # then qa and prod
   export AWS_PROFILE="aoe-$ENV" AWS_REGION=eu-west-1
   read -rs -p 'PagerDuty AWS Health integration URL: ' PAGERDUTY_HEALTH_EVENT_URL; echo
   aws secretsmanager create-secret --name /pagerduty/health_event_url \
     --secret-string "$PAGERDUTY_HEALTH_EVENT_URL"
   aws secretsmanager replicate-secret-to-regions --secret-id /pagerduty/health_event_url \
     --add-replica-regions Region=eu-central-1 Region=eu-north-1 Region=us-east-1
   ```

3. Bootstrap CDK in all collector regions if not already bootstrapped. `--app=`
   keeps `cdk bootstrap` from synthesizing this app, which needs an environment:

   ```bash
   # From aoe-infra/
   ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
   for region in eu-central-1 eu-north-1 eu-west-1 us-east-1; do
     npx cdk --app= bootstrap "aws://$ACCOUNT/$region"
   done
   ```

4. Build the frontend first (`npm --prefix ../aoe-web-frontend run build`, with its
   dependencies installed), since the CDK app also loads the frontend stack. Then
   deploy the replicas and the collectors:

   ```bash
   npx cdk deploy -c environment="$ENV" -c revision="$(git rev-parse HEAD)" \
     --exclusively SecretManagerStack 'AwsHealthRisk-*'
   ```

   PagerDuty must confirm both HTTPS subscriptions in each region. Check their
   confirmed status after deployment. A real test notification will page on-call;
   coordinate it before publishing to a collector's SNS topic.

Normal deployments then deploy the regional collectors with `--all`. A missing
secret or replica fails the deployment rather than silently disabling security
alerts, so do not merge before the secret and its replicas exist in all three
accounts. As with `MonitorStack`, CloudFormation resolves a URL only when its
subscription changes: after changing a secret in eu-west-1, change or recreate the
subscriptions that use it (in every collector region, and `MonitorStack`'s for
`/pagerduty/event_url`), deploy, and check they are *Confirmed*.

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
