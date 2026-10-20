/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw('DROP TABLE scheduled_task_run')
}

exports.down = () => Promise.resolve()
