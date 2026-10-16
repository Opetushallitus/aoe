/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw(`
    CREATE TABLE reference_data
    (
        reference_data_id uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        category          text        NOT NULL,
        lang              text        NOT NULL,
        value             jsonb       NOT NULL,
        created_at        timestamptz NOT NULL DEFAULT current_timestamp,
        updated_at        timestamptz NOT NULL DEFAULT current_timestamp,
        UNIQUE (category, lang)
    )
  `)
}

exports.down = () => Promise.resolve()
