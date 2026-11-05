/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw(`
    ALTER TABLE record ADD COLUMN preview_type text;
    ALTER TABLE h5p_extraction RENAME TO file_preview;
    ALTER TABLE file_preview ADD COLUMN entry_path text;
    -- Old tasks keep writing to h5p_extraction during the rolling deploy; dropped in AOE-137 1c.
    CREATE VIEW h5p_extraction AS SELECT * FROM file_preview;
    UPDATE record r SET preview_type = 'h5p'
      FROM file_preview f
      WHERE f.record_id = r.id AND f.source_file_key = r.filekey AND f.success;
    UPDATE record SET preview_type = 'office'
      WHERE pdfkey = regexp_replace(filekey, '\\.[^.]*$', '') || '.pdf';
  `)
}

exports.down = () => Promise.resolve()
