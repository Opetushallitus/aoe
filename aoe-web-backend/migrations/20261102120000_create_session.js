/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw(`
    CREATE TABLE session
    (
        session_id uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        sid        text        NOT NULL UNIQUE,
        data       jsonb       NOT NULL,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT current_timestamp,
        updated_at timestamptz NOT NULL DEFAULT current_timestamp
    );
    CREATE INDEX session_expires_at_idx ON session (expires_at);
  `)
}

exports.down = () => Promise.resolve()
