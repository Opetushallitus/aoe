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
      event.interaction?.toUpperCase() ?? null,
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

export type Interval = 'day' | 'week' | 'month'

export interface IntervalFilterMetadata {
  organizations?: string[]
  educationalLevels?: string[]
  educationalSubjects?: string[]
}

export interface IntervalTotalRequest {
  since: string
  until: string
  interaction?: string
  metadata?: IntervalFilterMetadata
  filters?: IntervalFilterMetadata
}

export interface IntervalTotal {
  year: number
  month?: number
  week?: number
  day?: number
  dayTotal?: number
  weekTotal?: number
  monthTotal?: number
}

const buildIntervalSelect = (
  interval: Interval
): { select: string; groupBy: string; orderBy: string } => {
  switch (interval) {
    case 'day':
      return {
        select: `EXTRACT(YEAR FROM timestamp)::int AS year, EXTRACT(MONTH FROM timestamp)::int AS month, EXTRACT(DAY FROM timestamp)::int AS day, COUNT(*)::int AS "dayTotal"`,
        groupBy: '1, 2, 3',
        orderBy: '1 ASC, 2 ASC, 3 ASC'
      }
    case 'week':
      return {
        select: `EXTRACT(YEAR FROM timestamp)::int AS year, EXTRACT(WEEK FROM timestamp)::int AS week, COUNT(*)::int AS "weekTotal"`,
        groupBy: '1, 2',
        orderBy: '1 ASC, 2 ASC'
      }
    case 'month':
      return {
        select: `EXTRACT(YEAR FROM timestamp)::int AS year, EXTRACT(MONTH FROM timestamp)::int AS month, COUNT(*)::int AS "monthTotal"`,
        groupBy: '1, 2',
        orderBy: '1 ASC, 2 ASC'
      }
  }
}

interface QueryFilter {
  sql: string
  params: Record<string, unknown>
  include: boolean
}

const buildWhereAndParams = (
  filters: QueryFilter[]
): { where: string; params: Record<string, unknown> } => {
  const active = filters.filter((f) => f.include)
  return {
    where: active.map((f) => f.sql).join(' AND '),
    params: Object.assign({}, ...active.map((f) => f.params))
  }
}

export const getMaterialActivityTotal = async (
  interval: Interval,
  request: IntervalTotalRequest
): Promise<IntervalTotal[]> => {
  const { select, groupBy, orderBy } = buildIntervalSelect(interval)

  const filters: QueryFilter[] = [
    {
      sql: 'timestamp >= $(since)::date',
      params: { since: request.since },
      include: true
    },
    {
      sql: "timestamp < $(until)::date + interval '1 day'",
      params: { until: request.until },
      include: true
    },
    {
      sql: 'interaction = $(interaction)',
      params: { interaction: request.interaction?.toUpperCase() },
      include: !!request.interaction
    },
    {
      sql: 'metadataorganizations && $(organizations)',
      params: { organizations: request.metadata?.organizations },
      include: !!request.metadata?.organizations?.length
    },
    {
      sql: 'metadataeducationallevels && $(educationalLevels)',
      params: { educationalLevels: request.metadata?.educationalLevels },
      include: !!request.metadata?.educationalLevels?.length
    },
    {
      sql: 'metadataeducationalsubjects && $(educationalSubjects)',
      params: { educationalSubjects: request.metadata?.educationalSubjects },
      include: !!request.metadata?.educationalSubjects?.length
    }
  ]

  const { where, params } = buildWhereAndParams(filters)

  const query = `
    SELECT ${select}
    FROM analyticsmaterialactivity
    WHERE ${where}
    GROUP BY ${groupBy}
    ORDER BY ${orderBy}
  `

  return db.any<IntervalTotal>(query, params)
}

export const getSearchRequestsTotal = async (
  interval: Interval,
  request: IntervalTotalRequest
): Promise<IntervalTotal[]> => {
  const { select, groupBy, orderBy } = buildIntervalSelect(interval)

  const filters: QueryFilter[] = [
    {
      sql: 'timestamp >= $(since)::date',
      params: { since: request.since },
      include: true
    },
    {
      sql: "timestamp < $(until)::date + interval '1 day'",
      params: { until: request.until },
      include: true
    },
    {
      sql: 'filterseducationallevels && $(educationalLevels)',
      params: { educationalLevels: request.filters?.educationalLevels },
      include: !!request.filters?.educationalLevels?.length
    },
    {
      sql: 'filterseducationalsubjects && $(educationalSubjects)',
      params: { educationalSubjects: request.filters?.educationalSubjects },
      include: !!request.filters?.educationalSubjects?.length
    }
  ]

  const { where, params } = buildWhereAndParams(filters)

  const query = `
    SELECT ${select}
    FROM analyticssearchrequest
    WHERE ${where}
    GROUP BY ${groupBy}
    ORDER BY ${orderBy}
  `

  return db.any<IntervalTotal>(query, params)
}

export const getPopularityQuery =
  'select a/NULLIF(b,0) as popularity from' +
  '(select' +
  '(select (viewcounter + downloadcounter + (select count(*) from rating where id = $1)) ' +
  'from educationalmaterial where id = $1) as a, ' +
  '(select (SELECT EXTRACT(DAY FROM (select sum(now() - publishedat) from educationalmaterial where id = $1))) as b))' +
  'as c;'
