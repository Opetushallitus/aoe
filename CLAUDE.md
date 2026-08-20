# CLAUDE.md

## Project Overview

AOE (Avoimet Oppimateriaalit - Library of Open Educational Resources) is a microservices-based web application for managing and distributing educational resources. The monorepo contains Node.js/TypeScript services (aoe-web-backend, aoe-web-frontend, aoe-streaming-app) and AWS CDK infrastructure (aoe-infra).

## Local Development

Start the entire stack:
```bash
./start-local-env.sh
```

This generates a self-signed cert for NGINX and starts all services via Docker Compose in a tmux session.

Access at: https://demo.aoe.fi/ (requires host file entry)

Mock OIDC credentials:
- aoeuser/password123
- tuomas.jukola/password123

### Linting

```bash
./scripts/fix-lint.sh         # Fix lint across all services with Biome
```

### Playwright Tests

```bash
./run-tests.sh                # Run from repo root
```

#### Creating materials in tests

Use `taytaJaTallennaUusiMateriaali(nimi, opts)` to create a material — don't hand-walk the wizard. Pass what the test needs through `opts`, and add a new `opts` field if a case isn't covered. Only walk the steps manually when the test *is* about the walk itself (per-step a11y scans, keyboard-only completion, or stopping mid-flow).

#### `pressSequentially()` vs `fill()`

Some Angular inputs use `(keyup)` handlers for logic (e.g. debounced lookups). Playwright's `fill()` doesn't fire keyboard events, so these handlers won't trigger. **Use `pressSequentially()` instead of `fill()`** for inputs with `(keyup)`, `(keydown)`, or `(keypress)` bindings.

Known affected inputs:
- `#materialId` in `admin/remove-material/` — `(keyup)="getMaterialInfo($event)"`
- `#materialId` in `admin/change-material-owner/` — `(keyup)="getMaterialInfo($event)"`

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

Two independent layers, both defined in `aoe-infra`. They recover different things and neither replaces the other.

**Native Aurora automated backups** (`lib/aurora-serverless-database.ts`) give point-in-time recovery: 30 days in prod, 7 in dev and qa, window pinned to `01:00-02:00` UTC. These are managed by RDS, are **deleted when the cluster is deleted**, and never leave the account or region.

**AWS Backup vault** (`lib/backup-stack.ts`) holds snapshots with a lifecycle independent of the cluster. Daily rule at 22:00 UTC retained 35 days in prod / 7 elsewhere, plus a monthly rule on the 1st retained 7 years. These are `awsbackup`-type snapshots, which **survive deletion of the cluster** — that is the whole point of this layer.

No cross-region or cross-account copies. Everything stays in `eu-west-1` in the environment's own account.

### Restoring

An Aurora restore does **not** create a DB instance — you get a cluster with no endpoint and must attach a writer yourself:

```bash
# 1. Find a recovery point
aws backup list-recovery-points-by-backup-vault --profile aoe-dev --region eu-west-1 \
  --backup-vault-name dev-aoe-backup-vault

# 2. Restore it (or use the console, which is easier for the metadata)
#    dbSubnetGroupName must be overridden — there is no default VPC path.

# 3. Attach a writer, or the cluster is unusable
aws rds create-db-instance --profile aoe-dev --region eu-west-1 \
  --db-instance-identifier <name> --db-cluster-identifier <restored-cluster> \
  --db-instance-class db.serverless --engine aurora-postgresql
```

### Aurora backup gotchas

- `BackupSizeInBytes` and `AllocatedStorage` are **always 0** for Aurora cluster snapshots, including known-good ones. Aurora does not populate them. It is not a sign of an empty snapshot.
- Snapshot **type** determines durability: `automated` (`rds:...`) dies with the cluster; `manual` and `awsbackup` persist.
- Aurora cannot tier to cold storage, so `moveToColdStorageAfter` is silently ignored. The 7-year monthly tier is billed at warm rates.
- `rdsKmsKey` is `RemovalPolicy.RETAIN`: it encrypts every snapshot, and deleting it would eventually make all of them unreadable. Do not change this without understanding that.
- AWS Backup needs no KMS key-policy grant. CDK's default `kms:*` AccountRootPrincipal statement delegates to IAM, and the selection role's `AWSBackupServiceRolePolicyForBackup` carries `kms:CreateGrant`, which is what RDS snapshot encryption actually uses.
- `ModifyDBCluster`'s `EnableHttpEndpoint` applies **only to Aurora Serverless v1**. A restored cluster is `provisioned` engine mode, so the call succeeds and returns `HttpEndpointEnabled: false` — no error, just a no-op. Serverless v2 and provisioned clusters need the separate [`EnableHttpEndpoint`](https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_EnableHttpEndpoint.html) operation, which is what the validator calls.

### Restore verification

A restore testing plan (`lib/backup-stack.ts`) restores the latest snapshot daily at 11:20 Europe/Helsinki and keeps it for a 1-hour validation window. `selectionWindowDays` is 3, so one missed backup night is tolerated but a longer outage stops the test running rather than re-testing stale snapshots.

`lambda/restore-validator/` then attaches a `db.serverless` instance, queries the restored database over the **RDS Data API**, deletes the instance, and reports the result to AWS Backup. It checks that `educationalmaterial`, `record` and `users` are non-empty and that no `record` row references a missing `material`.

Deleting the instance is not optional — AWS Backup cleans up by deleting the cluster, and that fails while an instance is attached. The validator is bounded by a deadline from `getRemainingTimeInMillis()` so it always leaves time to clean up.

Its IAM is deliberately scoped by resource pattern (`cluster:awsbackup-restore-test*`, `db:restore-validator-*`) so that even a bug cannot modify or delete a real database.

### Alarms

All to `Monitor.topic`. Note that its PagerDuty subscription is filtered on an `AlarmName` field existing in the message body, so **only CloudWatch alarms page** — a raw EventBridge or SNS notification reaches Slack only.

- `*-aoe-backup-job-failed-alarm` — a backup job failed
- `*-aoe-backup-job-missing-alarm` — no backup completed in 25 h, which catches a plan that silently stopped running and so produces no failures
- `*-aoe-restore-job-failed-alarm` — a restore test failed
- `*-aoe-restore-validator-failed-alarm` — the restored data was not valid, or the validator itself broke

Backup job history is also written to `/aws/events/<env>/aoe-backup-jobs` with one-year retention, because `ListBackupJobs` only returns the last 30 days.

## Infrastructure

- Production: AWS ECS Fargate, Aurora (PostgreSQL), ElastiCache (Redis), OpenSearch
- The frontend is not on ECS: it is static files in `aoe-frontend-<env>`, served by CloudFront's default behavior over Origin Access Control, with an explicit behavior forwarding each backend path to the ALB. See `docs/ecs-services-overview.md`.
- Sensitive config in AWS Parameter Store (`/<environment>/<serviceName>/`), database secrets in Secrets Manager
- Local: Docker Compose with LocalStack for S3, mock OIDC server — locally and in CI the frontend still runs in a container, so CloudFront routing is only exercised in a deployed environment

## AWS SDK v3 (S3) — always free the socket

`GetObjectCommand.Body` is a stream (v2 buffered it) and the pool defaults to `maxSockets: 50`.
An unconsumed `Body` holds its socket; 50 leaks wedge the pool (`socket usage at capacity=50 ... enqueued`).
Unlike v2, destroying the stream is not enough on its own and a client disconnect does not cancel the request — cancellation is decoupled from the stream.
Reference: `downloadFromStorage()` in `aoe-web-backend/src/query/fileHandling.ts` (AOE-115).

- Always fully consume or destroy the `Body` so its socket is released, even on error or early exit.
- Wire the client disconnect to cancel the S3 request itself, not just tear down the stream — this also releases requests still queued waiting for a socket.
- Treat a client-cancel error as benign, not a server error (no 500, no alarm).

## code style
- Use Zod to validate incoming requests and database query results