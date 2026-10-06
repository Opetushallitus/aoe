/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw(`
    CREATE TABLE scheduled_task_run
    (
        scheduled_task_run_id uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        task_name             text        NOT NULL,
        run_date              date        NOT NULL,
        created_at            timestamptz NOT NULL DEFAULT current_timestamp,
        updated_at            timestamptz NOT NULL DEFAULT current_timestamp,
        UNIQUE (task_name, run_date)
    )
  `)
}

exports.down = () => Promise.resolve()
