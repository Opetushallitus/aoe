# Database Backups

Two independent layers, both defined in `aoe-infra`. They recover different things and neither replaces the other.

**Native Aurora automated backups** (`lib/aurora-serverless-database.ts`) give point-in-time recovery: 30 days in prod, 7 in dev and qa, window pinned to `01:00-02:00` UTC. These are managed by RDS, are **deleted when the cluster is deleted**, and never leave the account or region.

**AWS Backup vault** (`lib/backup-stack.ts`) holds snapshots with a lifecycle independent of the cluster. Daily rule at 22:00 UTC retained 35 days in prod / 7 elsewhere, plus a monthly rule on the 1st retained 7 years. These are `awsbackup`-type snapshots, which **survive deletion of the cluster** — that is the whole point of this layer.

No cross-region or cross-account copies. Everything stays in `eu-west-1` in the environment's own account.

## Restoring

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

## Aurora backup gotchas

- `BackupSizeInBytes` and `AllocatedStorage` are **always 0** for Aurora cluster snapshots, including known-good ones. Aurora does not populate them. It is not a sign of an empty snapshot.
- Snapshot **type** determines durability: `automated` (`rds:...`) dies with the cluster; `manual` and `awsbackup` persist.
- Aurora cannot tier to cold storage, so `moveToColdStorageAfter` is silently ignored. The 7-year monthly tier is billed at warm rates.
- `rdsKmsKey` is `RemovalPolicy.RETAIN`: it encrypts every snapshot, and deleting it would eventually make all of them unreadable. Do not change this without understanding that.
- AWS Backup needs no KMS key-policy grant. CDK's default `kms:*` AccountRootPrincipal statement delegates to IAM, and the selection role's `AWSBackupServiceRolePolicyForBackup` carries `kms:CreateGrant`, which is what RDS snapshot encryption actually uses.
- `ModifyDBCluster`'s `EnableHttpEndpoint` applies **only to Aurora Serverless v1**. A restored cluster is `provisioned` engine mode, so the call succeeds and returns `HttpEndpointEnabled: false` — no error, just a no-op. Serverless v2 and provisioned clusters need the separate [`EnableHttpEndpoint`](https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_EnableHttpEndpoint.html) operation, which is what the validator calls.
- `EnableHttpEndpoint` returns `HttpEndpointEnabled: true` before the endpoint actually serves traffic, and `DescribeDBClusters` agrees with it. There is no field that reports readiness, so the only way to wait is to keep issuing a trivial query until `ExecuteStatement` stops throwing `HttpEndpointNotEnabledException` ("HttpEndpoint is being enabled").

## Restore verification

A restore testing plan (`lib/backup-stack.ts`) restores the latest snapshot daily at 11:20 Europe/Helsinki and keeps it for a 1-hour validation window. `selectionWindowDays` is 3, so one missed backup night is tolerated but a longer outage stops the test running rather than re-testing stale snapshots.

`aoe-infra/restore-validator/` then runs as a Fargate task (the trigger rule starts it when the restore job completes; a Lambda's 15-minute limit was too short for creating and deleting the instance). The image is built and pushed like the services' (`aoe-restore-validator` repo in the utility account, pulled by revision). The task attaches a `db.serverless` instance, queries the restored database over the **RDS Data API**, deletes the instance, and reports the result to AWS Backup. It checks that `educationalmaterial`, `record` and `users` are non-empty and that no `record` row references a missing `material`. It exits 0 only when validation passed, cleanup succeeded and no leftovers were found.

Deleting the instance is not optional — AWS Backup cleans up by deleting the cluster, and that fails while an instance is attached. AWS Backup does not retry a failed deletion, so the validator also lists `awsbackup-restore-test*` clusters other than its own (ignoring `deleting`); any it finds are leftovers from an earlier run, and it exits 1 until they are removed by hand. The validation deadline is 35 minutes and the cleanup deadline 50 minutes after container start. Result reporting and leftover scanning share one further minute, leaving 9 minutes for event delivery, Fargate provisioning and the image pull within the 1-hour validation window. Each API request is aborted at its deadline, and the caller stops waiting even if SDK middleware does not settle on cancellation. Cleanup uses its own deadline so a validation timeout still allows the instance to be deleted.

Its IAM is deliberately scoped by resource pattern (`cluster:awsbackup-restore-test*`, `db:restore-validator-*`) so that even a bug cannot modify or delete a real database. The one exception is `rds:DescribeDBClusters` on all clusters, which is read-only and needed to find leftovers. The task's security group allows only HTTPS egress.

## Alarms

All to `Monitor.topic`. Note that its PagerDuty subscription is filtered on an `AlarmName` field existing in the message body, so **only CloudWatch alarms page** — a raw EventBridge or SNS notification reaches Slack only.

- `*-aoe-backup-job-failed-alarm` — a backup job failed
- `*-aoe-backup-job-missing-alarm` — no backup completed in 25 h, which catches a plan that silently stopped running and so produces no failures
- `*-aoe-restore-job-failed-alarm` — a restore test failed
- `*-aoe-restore-validator-failed-alarm` — the validator task stopped without exit code 0: invalid restored data, failed cleanup, a leftover restore-test cluster, the task crashed, or it was provisioned but its container never started (e.g. image pull failed). If EventBridge cannot start the task at all, no task stops, so only the validation-missing alarm catches it
- `*-aoe-restore-validation-missing-alarm` — no validator task succeeded in 30 h, which catches a trigger rule or restore test that silently stopped running

Backup job history is also written to `/aws/events/<env>/aoe-backup-jobs` with one-year retention, because `ListBackupJobs` only returns the last 30 days.
