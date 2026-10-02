# CLAUDE.md

## Project Overview

AOE (Avoimet Oppimateriaalit - Library of Open Educational Resources) is a microservices-based web application for managing and distributing educational resources. The monorepo contains Node.js/TypeScript services (aoe-web-backend, aoe-web-frontend) and AWS CDK infrastructure (aoe-infra).

## Local Development

`./start-local-env.sh` starts the stack at https://demo.aoe.fi/. Linting, Playwright tests and mock OIDC credentials: [docs/local-development.md](docs/local-development.md).

## AWS Environments

- **dev**: Account 339713180834, profile `aoe-dev`
- **qa**: Account 058264216444, profile `aoe-qa`
- **prod**: Account 381492241240, profile `aoe-prod`

All use AWS SSO via `oph-federation` session in `eu-west-1`.

### CDK Deployment

```bash
cd aoe-infra
aws sso login --sso-session oph-federation
npx cdk deploy -c environment=dev --all --profile aoe-dev
```

## Database Migrations

PostgreSQL base schema: `docker/init-scripts/aoe-init.sql`. Schema changes use Knex migrations in `aoe-web-backend/migrations/`.

## Database Backups

Native Aurora PITR plus an AWS Backup vault with daily restore verification and alarms. Restore steps, gotchas and the validator: [docs/database-backups.md](docs/database-backups.md).

## Infrastructure

ECS Fargate, Aurora, ElastiCache, OpenSearch; frontend is static files behind CloudFront. See [docs/infrastructure.md](docs/infrastructure.md).

## AWS SDK v3 (S3) — always free the socket

Always consume or destroy `GetObjectCommand.Body` and cancel the S3 request on client disconnect. See [docs/aws-sdk-s3.md](docs/aws-sdk-s3.md).

## code style
- Use Zod to validate incoming requests and database query results

