/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS urn
    (
        id           serial       PRIMARY KEY,
        material_url varchar(255) NOT NULL UNIQUE
    )
  `)
}

exports.down = () => Promise.resolve()
