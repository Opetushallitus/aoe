/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  if (process.env.REFERENCE_DATA_MIGRATION_FROM_REDIS_ENABLED !== 'true') {
    console.log(
      'REFERENCE_DATA_MIGRATION_FROM_REDIS_ENABLED not true, skipping Redis reference data migration'
    )
    return
  }

  const { isDeepStrictEqual } = require('node:util')
  const { createClient } = require('redis')
  const { z } = require('zod')
  const { langSchema, referenceDataItemSchemas } = require('../dist/models/referenceData.js')

  const protocol = process.env.REDIS_USE_TLS === 'true' ? 'rediss' : 'redis'
  const client = createClient({
    url: `${protocol}://${process.env.REDIS_USERNAME}:${encodeURIComponent(process.env.REDIS_PASS)}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    socket: { reconnectStrategy: false }
  })
  await client.connect()

  try {
    let copied = 0

    for (const category of Object.keys(referenceDataItemSchemas)) {
      for (const lang of langSchema.options) {
        const text = await client.get(`${category}.${lang}`)

        if (text === null) {
          continue
        }

        const stored = JSON.parse(text)
        const parsed = referenceDataItemSchemas[category].array().safeParse(stored)

        if (!parsed.success) {
          throw new Error(
            `Redis ${category}.${lang} does not match its schema: ${z.prettifyError(parsed.error)}`
          )
        }

        await knex('reference_data').insert({ category, lang, value: JSON.stringify(parsed.data) })
        const copy = await knex('reference_data').where({ category, lang }).first('value')

        if (!isDeepStrictEqual(copy.value, stored)) {
          throw new Error(`Postgres reference_data ${category}.${lang} differs from Redis`)
        }

        copied++
      }
    }

    console.log(`Copied and verified ${copied} reference data keys from Redis`)
  } finally {
    await client.quit()
  }
}

exports.down = () => Promise.resolve()
