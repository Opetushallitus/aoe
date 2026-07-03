/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw('ALTER TABLE record ALTER COLUMN filesize TYPE BIGINT')
  await knex.raw('ALTER TABLE temporaryrecord ALTER COLUMN filesize TYPE BIGINT')
  await knex.raw('ALTER TABLE attachment ALTER COLUMN filesize TYPE BIGINT')
  await knex.raw('ALTER TABLE temporaryattachment ALTER COLUMN filesize TYPE BIGINT')
}
