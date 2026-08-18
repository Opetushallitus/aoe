import { BackupClient, PutRestoreValidationResultCommand } from '@aws-sdk/client-backup'
import {
  CreateDBInstanceCommand,
  type DBCluster,
  DeleteDBInstanceCommand,
  DescribeDBClustersCommand,
  DescribeDBInstancesCommand,
  ModifyDBClusterCommand,
  RDSClient
} from '@aws-sdk/client-rds'
import { ExecuteStatementCommand, RDSDataClient } from '@aws-sdk/client-rds-data'
import type { Context, EventBridgeEvent } from 'aws-lambda'

import type { RestoreJobDetail, ValidationOutcome } from './types'
import { asIdentifier, describeError, identifierFromArn, waitFor } from './utils'

const TEST_MIN_ACU = 0.5
const TEST_MAX_ACU = 1
const INSTANCE_CLASS = 'db.serverless'
const ENGINE = 'aurora-postgresql'
const DATABASE_NAME = 'aoe'
const NON_EMPTY_TABLES = ['educationalmaterial', 'record', 'users']
const COUNT_COLUMN = 'count'
const POLL_INTERVAL_MS = 15_000
const CLEANUP_RESERVE_MS = 90_000
const RESTORE_TEST_CLUSTER_PREFIX = 'awsbackup-restore-test'
const VALIDATOR_INSTANCE_PREFIX = 'restore-validator-'

const rds = new RDSClient({})
const rdsData = new RDSDataClient({})
const backup = new BackupClient({})

export const handler = async (
  event: EventBridgeEvent<'Restore Job State Change', RestoreJobDetail>,
  context: Context
): Promise<void> => {
  const { restoreJobId, createdResourceArn, status, resourceType } = event.detail
  console.info('Received restore job event', { restoreJobId, status, resourceType })

  if (!restoreJobId) {
    throw new Error('Event is missing restoreJobId; cannot report a validation result')
  }

  const clusterArn = requireClusterArn(createdResourceArn, status, resourceType)
  const clusterId = requireRestoreTestCluster(identifierFromArn(clusterArn))
  const instanceId = `${VALIDATOR_INSTANCE_PREFIX}${restoreJobId.slice(0, 8)}`
  const deadline = Date.now() + context.getRemainingTimeInMillis() - CLEANUP_RESERVE_MS

  let instanceRequested = false
  let cleanupFailure: string | undefined
  let outcome: ValidationOutcome
  try {
    await waitFor(
      deadline,
      POLL_INTERVAL_MS,
      `cluster ${clusterId} to become available`,
      async () => {
        return (await describeCluster(clusterId))?.Status === 'available'
      }
    )
    await prepareCluster(clusterId)

    instanceRequested = true
    await createInstance(clusterId, instanceId)

    await waitFor(
      deadline,
      POLL_INTERVAL_MS,
      `instance ${instanceId} to become available`,
      async () => {
        const described = await rds.send(
          new DescribeDBInstancesCommand({ DBInstanceIdentifier: instanceId })
        )
        return described.DBInstances?.[0]?.DBInstanceStatus === 'available'
      }
    )
    await waitFor(deadline, POLL_INTERVAL_MS, `the Data API on ${clusterId}`, async () => {
      return (await describeCluster(clusterId))?.HttpEndpointEnabled === true
    })

    outcome = await validate(clusterArn)
  } catch (err) {
    outcome = { passed: false, message: describeError(err), counts: {} }
  } finally {
    if (instanceRequested) {
      cleanupFailure = await deleteInstance(instanceId)
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

  await reportOutcome(restoreJobId, outcome)

  if (!outcome.passed) {
    throw new Error(`Restore validation failed for ${restoreJobId}: ${outcome.message}`)
  }
  console.info('Restore validation passed', { restoreJobId, counts: outcome.counts })
}

function requireClusterArn(
  createdResourceArn: string | undefined,
  status: string,
  resourceType: string
): string {
  if (status !== 'COMPLETED') {
    throw new Error(`Unexpected restore job status: ${status}`)
  }
  if (resourceType !== 'Aurora') {
    throw new Error(`Unexpected restore job resourceType: ${resourceType}`)
  }
  if (!createdResourceArn) {
    throw new Error('Restore job event is missing createdResourceArn')
  }
  return createdResourceArn
}

function requireRestoreTestCluster(clusterId: string): string {
  if (!clusterId.startsWith(RESTORE_TEST_CLUSTER_PREFIX)) {
    throw new Error(
      `Refusing to touch ${clusterId}: only clusters named ${RESTORE_TEST_CLUSTER_PREFIX}* are restore-test copies`
    )
  }
  return clusterId
}

async function describeCluster(clusterId: string): Promise<DBCluster | undefined> {
  const described = await rds.send(
    new DescribeDBClustersCommand({ DBClusterIdentifier: clusterId })
  )
  return described.DBClusters?.[0]
}

async function prepareCluster(clusterId: string): Promise<void> {
  await rds.send(
    new ModifyDBClusterCommand({
      DBClusterIdentifier: clusterId,
      ServerlessV2ScalingConfiguration: {
        MinCapacity: TEST_MIN_ACU,
        MaxCapacity: TEST_MAX_ACU
      },
      EnableHttpEndpoint: true,
      ApplyImmediately: true
    })
  )
}

async function createInstance(clusterId: string, instanceId: string): Promise<void> {
  await rds.send(
    new CreateDBInstanceCommand({
      DBInstanceIdentifier: instanceId,
      DBClusterIdentifier: clusterId,
      DBInstanceClass: INSTANCE_CLASS,
      Engine: ENGINE
    })
  )
}

async function validate(clusterArn: string): Promise<ValidationOutcome> {
  const secretArn = process.env.DB_SECRET_ARN
  if (!secretArn) {
    throw new Error('DB_SECRET_ARN is not set')
  }

  const counts: Record<string, number> = {}
  for (const table of NON_EMPTY_TABLES) {
    counts[table] = await count(
      clusterArn,
      secretArn,
      `SELECT count(*) AS ${COUNT_COLUMN} FROM ${asIdentifier(table)}`
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
    `SELECT count(*) AS ${COUNT_COLUMN} FROM record r
       LEFT JOIN material m ON r.materialid = m.id
      WHERE m.id IS NULL`
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

async function count(clusterArn: string, secretArn: string, sql: string): Promise<number> {
  const result = await rdsData.send(
    new ExecuteStatementCommand({
      resourceArn: clusterArn,
      secretArn,
      database: DATABASE_NAME,
      sql,
      formatRecordsAs: 'JSON'
    })
  )

  const rows: unknown = JSON.parse(result.formattedRecords ?? '[]')
  const first: unknown = Array.isArray(rows) ? rows[0] : undefined
  if (typeof first === 'object' && first !== null && COUNT_COLUMN in first) {
    const value = first[COUNT_COLUMN]
    if (typeof value === 'number') {
      return value
    }
  }
  throw new Error(`Query did not return a numeric ${COUNT_COLUMN}: ${sql}`)
}

async function deleteInstance(instanceId: string): Promise<string | undefined> {
  try {
    await rds.send(
      new DeleteDBInstanceCommand({
        DBInstanceIdentifier: instanceId,
        SkipFinalSnapshot: true
      })
    )
    return undefined
  } catch (err) {
    const message = describeError(err)
    console.error(`Failed to delete ${instanceId}`, message)
    return message
  }
}

async function reportOutcome(restoreJobId: string, outcome: ValidationOutcome): Promise<void> {
  await backup.send(
    new PutRestoreValidationResultCommand({
      RestoreJobId: restoreJobId,
      ValidationStatus: outcome.passed ? 'SUCCESSFUL' : 'FAILED',
      ValidationStatusMessage: outcome.message.slice(0, 1024)
    })
  )
}
