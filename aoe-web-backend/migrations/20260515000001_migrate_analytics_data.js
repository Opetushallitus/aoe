const BATCH_SIZE = 1000

/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  if (process.env.DATA_ANALYTICS_MIGRATION_TO_POSTGRES_ENABLED !== 'true') {
    console.log('DATA_ANALYTICS_MIGRATION_TO_POSTGRES_ENABLED not true, skipping DocumentDB data migration')
    return
  }

  const { MongoClient } = require('mongodb')

  const host = process.env.MONGODB_PRIMARY_HOST
  const port = process.env.MONGODB_PRIMARY_PORT
  const database = process.env.MONGODB_PRIMARY_DATABASE
  const username = process.env.MONGODB_PRIMARY_USERNAME
  const password = process.env.MONGODB_PRIMARY_PASSWORD
  const enableSsl = process.env.MONGODB_PRIMARY_ENABLE_SSL === 'true'

  if (!port || !database || !username || !password) {
    throw new Error('MONGODB_PRIMARY_PORT, MONGODB_PRIMARY_DATABASE, MONGODB_PRIMARY_USERNAME and MONGODB_PRIMARY_PASSWORD must all be set')
  }

  const uri = `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
  const client = new MongoClient(uri, {
    tls: enableSsl,
    tlsAllowInvalidHostnames: enableSsl
  })

  try {
    await client.connect()
    const docDb = client.db(database)

    await migrateMaterialActivity(knex, docDb)
    await migrateSearchRequests(knex, docDb)
    await verifyMigration(knex, docDb)
  } finally {
    await client.close()
  }
}

/** @param {import('knex').Knex} knex @param {import('mongodb').Db} docDb */
const migrateMaterialActivity = async (knex, docDb) => {
  console.log('Migrating material_activity...')
  const cursor = docDb.collection('material_activity').find({})
  let batch = []
  let total = 0

  while (await cursor.hasNext()) {
    const doc = await cursor.next()
    batch.push({
      sessionid: doc.sessionId ?? null,
      timestamp: doc.timestamp,
      edumaterialid: doc.eduMaterialId ?? null,
      interaction: doc.interaction ?? null,
      metadatacreated: doc.metadata?.created ?? null,
      metadataupdated: doc.metadata?.updated ?? null,
      metadataorganizations: doc.metadata?.organizations ?? null,
      metadataeducationallevels: doc.metadata?.educationalLevels ?? null,
      metadataeducationalsubjects: doc.metadata?.educationalSubjects ?? null
    })

    if (batch.length === BATCH_SIZE) {
      await knex.batchInsert('analyticsmaterialactivity', batch)
      total += batch.length
      console.log(`  material_activity: inserted ${total} rows`)
      batch = []
    }
  }

  if (batch.length > 0) {
    await knex.batchInsert('analyticsmaterialactivity', batch)
    total += batch.length
  }

  console.log(`  material_activity done: ${total} rows`)
}

/** @param {import('knex').Knex} knex @param {import('mongodb').Db} docDb */
const migrateSearchRequests = async (knex, docDb) => {
  console.log('Migrating search_requests...')
  const cursor = docDb.collection('search_requests').find({})
  let batch = []
  let total = 0

  while (await cursor.hasNext()) {
    const doc = await cursor.next()
    batch.push({
      sessionid: doc.sessionId ?? null,
      timestamp: doc.timestamp,
      keywords: doc.keywords ?? null,
      filterseducationallevels: doc.filters?.educationalLevels ?? null,
      filterseducationalsubjects: doc.filters?.educationalSubjects ?? null,
      filterslearningresourcetypes: doc.filters?.learningResourceTypes ?? null
    })

    if (batch.length === BATCH_SIZE) {
      await knex.batchInsert('analyticssearchrequest', batch)
      total += batch.length
      console.log(`  search_requests: inserted ${total} rows`)
      batch = []
    }
  }

  if (batch.length > 0) {
    await knex.batchInsert('analyticssearchrequest', batch)
    total += batch.length
  }

  console.log(`  search_requests done: ${total} rows`)
}

/** @param {import('knex').Knex} knex @param {import('mongodb').Db} docDb */
const verifyMigration = async (knex, docDb) => {
  console.log('Verifying migration...')

  const mongoActivityCount = await docDb.collection('material_activity').countDocuments()
  const mongoSearchCount = await docDb.collection('search_requests').countDocuments()
  const [{ count: pgActivityCount }] = await knex('analyticsmaterialactivity').count('* as count')
  const [{ count: pgSearchCount }] = await knex('analyticssearchrequest').count('* as count')

  if (Number(pgActivityCount) !== mongoActivityCount) {
    throw new Error(
      `material_activity count mismatch: MongoDB ${mongoActivityCount}, PostgreSQL ${pgActivityCount}`
    )
  }
  if (Number(pgSearchCount) !== mongoSearchCount) {
    throw new Error(
      `search_requests count mismatch: MongoDB ${mongoSearchCount}, PostgreSQL ${pgSearchCount}`
    )
  }

  console.log(`  material_activity: ${mongoActivityCount} rows verified`)
  console.log(`  search_requests: ${mongoSearchCount} rows verified`)
}

exports.down = () => Promise.resolve()
