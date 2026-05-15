import { TypeMaterialActivity, TypeSearchRequest } from '@aoe/services/analyticsService'
import { db } from '@resource/postgresClient'
import * as log from '@util/winstonLogger'

export const updateViewCounter = async (id: string): Promise<void> => {
  try {
    await db.tx(async (t: any) => {
      const query = `
        UPDATE educationalmaterial
        SET viewcounter = viewcounter + 1, counterupdatedat = NOW()
        WHERE id = $1
      `
      await t.none(query, [id])
    })
  } catch (error) {
    log.error('Failed to update counter', error)
    throw error
  }
}

export async function updateDownloadCounter(id: string): Promise<void> {
  try {
    await db.tx(async (t: any) => {
      const query =
        'update educationalmaterial set downloadcounter = downloadcounter + 1, counterupdatedat = now() where id = $1;'
      await t.none(query, [id])
    })
  } catch (error) {
    log.error('Failed to update counter', error)
    throw error
  }
}

export const insertMaterialActivityEvent = async (event: TypeMaterialActivity): Promise<void> => {
  await db.none(
    `INSERT INTO analyticsmaterialactivity
      (sessionid, timestamp, edumaterialid, interaction,
       metadatacreated, metadataupdated,
       metadataorganizations, metadataeducationallevels, metadataeducationalsubjects)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      event.sessionId ?? null,
      event.timestamp,
      event.eduMaterialId ?? null,
      event.interaction ?? null,
      event.metadata?.created ?? null,
      event.metadata?.updated ?? null,
      event.metadata?.organizations ?? null,
      event.metadata?.educationalLevels ?? null,
      event.metadata?.educationalSubjects ?? null
    ]
  )
}

export const insertSearchRequestEvent = async (event: TypeSearchRequest): Promise<void> => {
  const keywords = 'keywords' in event ? event.keywords : null
  const filters = 'filters' in event ? event.filters : null
  await db.none(
    `INSERT INTO analyticssearchrequest
      (sessionid, timestamp, keywords,
       filterseducationallevels, filterseducationalsubjects, filterslearningresourcetypes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      event.sessionId ?? null,
      event.timestamp,
      keywords ?? null,
      filters?.educationalLevels ?? null,
      filters?.educationalSubjects ?? null,
      filters?.learningResourceTypes ?? null
    ]
  )
}

export const getPopularityQuery =
  'select a/NULLIF(b,0) as popularity from' +
  '(select' +
  '(select (viewcounter + downloadcounter + (select count(*) from rating where id = $1)) ' +
  'from educationalmaterial where id = $1) as a, ' +
  '(select (SELECT EXTRACT(DAY FROM (select sum(now() - publishedat) from educationalmaterial where id = $1))) as b))' +
  'as c;'
