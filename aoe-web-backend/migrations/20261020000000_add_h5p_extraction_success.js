/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw(`
    ALTER TABLE h5p_extraction
      ADD COLUMN success boolean NOT NULL DEFAULT true,
      ALTER COLUMN s3_object_prefix DROP NOT NULL
  `)
}

exports.down = () => Promise.resolve()
