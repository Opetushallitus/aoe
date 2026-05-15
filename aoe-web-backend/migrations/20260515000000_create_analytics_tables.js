/** @param {import('knex').Knex} knex */
exports.up = async (knex) => {
  await knex.raw(`
    CREATE TABLE AnalyticsMaterialActivity
    (
        Id                      BIGSERIAL                NOT NULL,
        SessionId               TEXT,
        Timestamp               TIMESTAMP WITH TIME ZONE NOT NULL,
        EduMaterialId           TEXT,
        Interaction             TEXT,
        MetadataCreated             TIMESTAMP WITH TIME ZONE,
        MetadataUpdated             TIMESTAMP WITH TIME ZONE,
        MetadataOrganizations       TEXT[],
        MetadataEducationalLevels   TEXT[],
        MetadataEducationalSubjects TEXT[],
        PRIMARY KEY (Id)
    )
  `)
  await knex.raw(
    'CREATE INDEX idx_analytics_material_activity_timestamp ON AnalyticsMaterialActivity (Timestamp)'
  )
  await knex.raw(
    'CREATE INDEX idx_analytics_material_activity_interaction ON AnalyticsMaterialActivity (Interaction)'
  )
  await knex.raw(
    'CREATE INDEX idx_analytics_material_activity_edu_material_id ON AnalyticsMaterialActivity (EduMaterialId)'
  )

  await knex.raw(`
    CREATE TABLE AnalyticsSearchRequest
    (
        Id                           BIGSERIAL                NOT NULL,
        SessionId                    TEXT,
        Timestamp                    TIMESTAMP WITH TIME ZONE NOT NULL,
        Keywords                     TEXT,
        FiltersEducationalLevels     TEXT[],
        FiltersEducationalSubjects   TEXT[],
        FiltersLearningResourceTypes TEXT[],
        PRIMARY KEY (Id)
    )
  `)
  await knex.raw(
    'CREATE INDEX idx_analytics_search_request_timestamp ON AnalyticsSearchRequest (Timestamp)'
  )
}

exports.down = () => Promise.resolve()
