/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw('DROP TABLE IF EXISTS temporaryattachment, temporaryrecord')
}

exports.down = () => Promise.resolve()
