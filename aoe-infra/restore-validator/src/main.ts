import { BackupClient, PutRestoreValidationResultCommand } from '@aws-sdk/client-backup'
import {
  CreateDBInstanceCommand,
  type DBCluster,
  DBInstanceAlreadyExistsFault,
  DBInstanceNotFoundFault,
  DeleteDBInstanceCommand,
  DescribeDBClustersCommand,
  DescribeDBInstancesCommand,
  EnableHttpEndpointCommand,
  InvalidResourceStateFault,
  ModifyDBClusterCommand,
  paginateDescribeDBClusters,
  RDSClient
} from '@aws-sdk/client-rds'
import {
  ExecuteStatementCommand,
  HttpEndpointNotEnabledException,
  RDSDataClient
} from '@aws-sdk/client-rds-data'
import { z } from 'zod'

import { logger } from './logger'
import { asIdentifier, describeError, identifierFromArn, runWithDeadline, waitFor } from './utils'

const TEST_MIN_ACU = 0.5
const TEST_MAX_ACU = 1
const INSTANCE_CLASS = 'db.serverless'
const ENGINE = 'aurora-postgresql'
const DATABASE_NAME = 'aoe'
const NON_EMPTY_TABLES = ['educationalmaterial', 'record', 'users']
const POLL_INTERVAL_MS = 15_000
// Together these must stay inside the restore test's validationWindowHours (1 h): AWS
// Backup deletes the restored cluster when the window ends, and that fails while the
// validator's instance is still attached. They count from container start, so the slack
// also has to absorb event delivery, Fargate provisioning and the image pull.
const VALIDATION_BUDGET_MS = 35 * 60_000
const CLEANUP_BUDGET_MS = 15 * 60_000
const POST_VALIDATION_BUDGET_MS = 60_000
const RESTORE_TEST_CLUSTER_PREFIX = 'awsbackup-restore-test'
const VALIDATOR_INSTANCE_PREFIX = 'restore-validator-'

interface ValidationOutcome {
  passed: boolean
  message: string
  counts: Record<string, number>
}

const rds = new RDSClient({})
const rdsData = new RDSDataClient({})
const backup = new BackupClient({})

const env = z.object({
  RESTORE_JOB_ID: z.string().min(1),
  CREATED_RESOURCE_ARN: z.string().min(1)
})
const countRows = z.array(z.object({ count: z.number() })).min(1)

async function validateRestore(restoreJobId: string, clusterArn: string): Promise<void> {
  const clusterId = requireRestoreTestCluster(identifierFromArn(clusterArn))
  const instanceId = `${VALIDATOR_INSTANCE_PREFIX}${restoreJobId.slice(0, 8)}`
  const deadline = Date.now() + VALIDATION_BUDGET_MS
  const cleanupDeadline = deadline + CLEANUP_BUDGET_MS

  let instanceCreated = false
  let cleanupFailure: string | undefined
  let outcome: ValidationOutcome
  try {
    await waitFor(
      deadline,
      POLL_INTERVAL_MS,
      `cluster ${clusterId} to become available`,
      async () => {
        return (await describeCluster(clusterId, deadline))?.Status === 'available'
      }
    )
    await prepareCluster(clusterId, deadline)

    await createInstance(clusterId, instanceId, deadline)
    instanceCreated = true

    await waitFor(
      deadline,
      POLL_INTERVAL_MS,
      `instance ${instanceId} to become available`,
      async () => {
        const described = await runWithDeadline(deadline, (abortSignal) =>
          rds.send(new DescribeDBInstancesCommand({ DBInstanceIdentifier: instanceId }), {
            abortSignal
          })
        )
        return described.DBInstances?.[0]?.DBInstanceStatus === 'available'
      }
    )
    await waitFor(
      deadline,
      POLL_INTERVAL_MS,
      `the Data API to be enabled on ${clusterId}`,
      async () => {
        return await enableDataApi(clusterArn, deadline)
      }
    )

    outcome = await validate(clusterArn, deadline)
  } catch (err) {
    if (err instanceof DBInstanceAlreadyExistsFault) {
      // Another task owns this instance and its validation result. Leave both alone.
      throw err
    }
    outcome = { passed: false, message: describeError(err), counts: {} }
  } finally {
    if (instanceCreated) {
      cleanupFailure = await deleteInstance(instanceId, cleanupDeadline)
    }
  }

  // A cleanup failure leaves an instance attached to the restored cluster, which stops
  // AWS Backup deleting the cluster. That must not be reported as a passing validation.
  if (cleanupFailure) {
    outcome = {
      passed: false,
      message: `${outcome.message} | cleanup failed: ${cleanupFailure}`,
      counts: outcome.counts
    }
  }

  const postValidationDeadline = Date.now() + POST_VALIDATION_BUDGET_MS
  await reportOutcome(restoreJobId, outcome, postValidationDeadline)

  // AWS Backup does not retry a failed cluster deletion, so any other restore-test cluster
  // is left over from an earlier run. Today's restore is reported on its own merits above.
  const leftovers = await findLeftoverClusters(clusterId, postValidationDeadline)

  if (!outcome.passed) {
    throw new Error(`Restore validation failed for ${restoreJobId}: ${outcome.message}`)
  }
  if (leftovers.length > 0) {
    throw new Error(`Leftover restore-test clusters need manual removal: ${leftovers.join(', ')}`)
  }
  logger.info('Restore validation passed', { restoreJobId, counts: outcome.counts })
}

function requireRestoreTestCluster(clusterId: string): string {
  if (!clusterId.startsWith(RESTORE_TEST_CLUSTER_PREFIX)) {
    throw new Error(
      `Refusing to touch ${clusterId}: only clusters named ${RESTORE_TEST_CLUSTER_PREFIX}* are restore-test copies`
    )
  }
  return clusterId
}

async function describeCluster(
  clusterId: string,
  deadline: number
): Promise<DBCluster | undefined> {
  const described = await runWithDeadline(deadline, (abortSignal) =>
    rds.send(new DescribeDBClustersCommand({ DBClusterIdentifier: clusterId }), { abortSignal })
  )
  return described.DBClusters?.[0]
}

async function findLeftoverClusters(ownClusterId: string, deadline: number): Promise<string[]> {
  return await runWithDeadline(deadline, async (abortSignal) => {
    const leftovers: string[] = []
    for await (const page of paginateDescribeDBClusters({ client: rds }, {}, { abortSignal })) {
      for (const cluster of page.DBClusters ?? []) {
        const id = cluster.DBClusterIdentifier
        if (
          id?.startsWith(RESTORE_TEST_CLUSTER_PREFIX) &&
          id !== ownClusterId &&
          cluster.Status !== 'deleting'
        ) {
          leftovers.push(id)
        }
      }
    }
    return leftovers
  })
}

async function prepareCluster(clusterId: string, deadline: number): Promise<void> {
  await runWithDeadline(deadline, (abortSignal) =>
    rds.send(
      new ModifyDBClusterCommand({
        DBClusterIdentifier: clusterId,
        ServerlessV2ScalingConfiguration: {
          MinCapacity: TEST_MIN_ACU,
          MaxCapacity: TEST_MAX_ACU
        },
        ApplyImmediately: true
      }),
      { abortSignal }
    )
  )
}

// ModifyDBCluster's EnableHttpEndpoint applies only to Aurora Serverless v1; on a
// provisioned cluster it returns success with HttpEndpointEnabled still false. Serverless
// v2 and provisioned clusters need this separate operation, which rejects calls made while
// the cluster is busy, so it is retried until it takes.
async function enableDataApi(clusterArn: string, deadline: number): Promise<boolean> {
  try {
    const { HttpEndpointEnabled } = await runWithDeadline(deadline, (abortSignal) =>
      rds.send(new EnableHttpEndpointCommand({ ResourceArn: clusterArn }), { abortSignal })
    )
    return HttpEndpointEnabled === true
  } catch (err) {
    if (err instanceof InvalidResourceStateFault) {
      return false
    }
    throw err
  }
}

async function createInstance(
  clusterId: string,
  instanceId: string,
  deadline: number
): Promise<void> {
  await runWithDeadline(deadline, (abortSignal) =>
    rds.send(
      new CreateDBInstanceCommand({
        DBInstanceIdentifier: instanceId,
        DBClusterIdentifier: clusterId,
        DBInstanceClass: INSTANCE_CLASS,
        Engine: ENGINE
      }),
      { abortSignal }
    )
  )
}

async function validate(clusterArn: string, deadline: number): Promise<ValidationOutcome> {
  const secretArn = process.env.DB_SECRET_ARN
  if (!secretArn) {
    throw new Error('DB_SECRET_ARN is not set')
  }

  // EnableHttpEndpoint reports the endpoint as enabled well before it accepts queries, so
  // readiness can only be established by querying until the endpoint stops rejecting.
  await waitFor(deadline, POLL_INTERVAL_MS, 'the Data API to answer queries', async () => {
    try {
      await count(clusterArn, secretArn, `SELECT 1 AS count`, deadline)
      return true
    } catch (err) {
      if (err instanceof HttpEndpointNotEnabledException) {
        return false
      }
      throw err
    }
  })

  const counts: Record<string, number> = {}
  for (const table of NON_EMPTY_TABLES) {
    counts[table] = await count(
      clusterArn,
      secretArn,
      `SELECT count(*) AS count FROM ${asIdentifier(table)}`,
      deadline
    )
  }

  const empty = Object.entries(counts)
    .filter(([, rows]) => rows === 0)
    .map(([table]) => table)
  if (empty.length > 0) {
    return { passed: false, message: `Tables are empty: ${empty.join(', ')}`, counts }
  }

  const orphanedRecords = await count(
    clusterArn,
    secretArn,
    `SELECT count(*) AS count FROM record r
       LEFT JOIN material m ON r.materialid = m.id
      WHERE m.id IS NULL`,
    deadline
  )
  if (orphanedRecords > 0) {
    return {
      passed: false,
      message: `${orphanedRecords} record rows reference a missing material`,
      counts
    }
  }

  return { passed: true, message: `Row counts: ${JSON.stringify(counts)}`, counts }
}

async function count(
  clusterArn: string,
  secretArn: string,
  sql: string,
  deadline: number
): Promise<number> {
  const result = await runWithDeadline(deadline, (abortSignal) =>
    rdsData.send(
      new ExecuteStatementCommand({
        resourceArn: clusterArn,
        secretArn,
        database: DATABASE_NAME,
        sql,
        formatRecordsAs: 'JSON'
      }),
      { abortSignal }
    )
  )

  const parsed = countRows.safeParse(JSON.parse(result.formattedRecords ?? '[]'))
  if (!parsed.success) {
    throw new Error(`Query did not return a numeric count: ${sql}`)
  }
  return parsed.data[0].count
}

async function deleteAndWait(
  deadline: number,
  intervalMs: number,
  description: string,
  requestDeletion: () => Promise<void>,
  isDeleted: () => Promise<boolean>
): Promise<void> {
  await requestDeletion()
  await waitFor(deadline, intervalMs, description, isDeleted)
}

async function deleteInstance(instanceId: string, deadline: number): Promise<string | undefined> {
  async function requestInstanceDeletion(): Promise<void> {
    try {
      await runWithDeadline(deadline, (abortSignal) =>
        rds.send(
          new DeleteDBInstanceCommand({
            DBInstanceIdentifier: instanceId,
            SkipFinalSnapshot: true
          }),
          { abortSignal }
        )
      )
    } catch (err) {
      if (!(err instanceof DBInstanceNotFoundFault)) {
        throw err
      }
    }
  }

  async function isInstanceDeleted(): Promise<boolean> {
    try {
      const described = await runWithDeadline(deadline, (abortSignal) =>
        rds.send(new DescribeDBInstancesCommand({ DBInstanceIdentifier: instanceId }), {
          abortSignal
        })
      )
      return described.DBInstances?.length === 0
    } catch (err) {
      if (err instanceof DBInstanceNotFoundFault) {
        return true
      }
      throw err
    }
  }

  try {
    await deleteAndWait(
      deadline,
      POLL_INTERVAL_MS,
      `instance ${instanceId} to be deleted`,
      requestInstanceDeletion,
      isInstanceDeleted
    )
    return undefined
  } catch (err) {
    const message = describeError(err)
    logger.error(`Failed to delete ${instanceId}`, { reason: message })
    return message
  }
}

async function reportOutcome(
  restoreJobId: string,
  outcome: ValidationOutcome,
  deadline: number
): Promise<void> {
  await runWithDeadline(deadline, (abortSignal) =>
    backup.send(
      new PutRestoreValidationResultCommand({
        RestoreJobId: restoreJobId,
        ValidationStatus: outcome.passed ? 'SUCCESSFUL' : 'FAILED',
        ValidationStatusMessage: outcome.message.slice(0, 1024)
      }),
      { abortSignal }
    )
  )
}

async function main(): Promise<void> {
  const { RESTORE_JOB_ID, CREATED_RESOURCE_ARN } = env.parse(process.env)
  await validateRestore(RESTORE_JOB_ID, CREATED_RESOURCE_ARN)
}

void main()
