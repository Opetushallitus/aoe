/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw(`
    CREATE TABLE h5p_extraction
    (
        id               uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        record_id        bigint      NOT NULL REFERENCES record (id),
        source_file_key  text        NOT NULL,
        processed_at     timestamptz NOT NULL DEFAULT current_timestamp,
        s3_object_prefix text        NOT NULL,
        UNIQUE (record_id, source_file_key)
    )
  `)
}

exports.down = () => Promise.resolve()
