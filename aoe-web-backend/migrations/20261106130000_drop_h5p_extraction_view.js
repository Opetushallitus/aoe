/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw('DROP VIEW IF EXISTS h5p_extraction')
}

exports.down = () => Promise.resolve()
