import { z } from 'zod'
import { db } from '@resource/postgresClient'

export interface RecordKeyValue {
  key: string
  value: number
}

export const dateString = z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
  message: 'Invalid date string'
})

// Frontend keys for these filters are typed `number | string` (e.g. educational
// subjects from koodisto APIs). DB columns are TEXT[], so we normalize to string.
const stringKey = z.union([z.string(), z.number().transform(String)])
export const stringKeyArray = z.array(stringKey)

export const educationalLevelRequestSchema = z.object({
  since: dateString.nullish(),
  until: dateString.nullish(),
  educationalLevels: stringKeyArray.nullish(),
  expiredBefore: dateString.nullish()
})
export type EducationalLevelRequest = z.infer<typeof educationalLevelRequestSchema>

export const educationalSubjectRequestSchema = z.object({
  since: dateString.nullish(),
  until: dateString.nullish(),
  educationalSubjects: stringKeyArray.nullish()
})
export type EducationalSubjectRequest = z.infer<typeof educationalSubjectRequestSchema>

export const organizationRequestSchema = z.object({
  since: dateString.nullish(),
  until: dateString.nullish(),
  organizations: stringKeyArray.nullish()
})
export type OrganizationRequest = z.infer<typeof organizationRequestSchema>

export const getEducationalLevelDistribution = async (
  request: EducationalLevelRequest
): Promise<RecordKeyValue[]> => {
  const levels = request.educationalLevels ?? []
  if (levels.length === 0) {
    return []
  }

  if (request.since && request.until) {
    return db.any<RecordKeyValue>(
      `SELECT el.educationallevelkey AS key, COUNT(em.id)::int AS value
       FROM educationalmaterial em
       JOIN educationallevel el ON el.educationalmaterialid = em.id
       WHERE el.educationallevelkey = ANY($1)
         AND em.publishedat >= $2::date
         AND em.publishedat < $3::date + interval '1 day'
       GROUP BY el.educationallevelkey`,
      [levels, request.since, request.until]
    )
  }

  return db.any<RecordKeyValue>(
    `SELECT el.educationallevelkey AS key, COUNT(em.id)::int AS value
     FROM educationalmaterial em
     JOIN educationallevel el ON el.educationalmaterialid = em.id
     WHERE el.educationallevelkey = ANY($1)
     GROUP BY el.educationallevelkey`,
    [levels]
  )
}

export const getEducationalLevelExpired = async (
  request: EducationalLevelRequest
): Promise<RecordKeyValue[]> => {
  const levels = request.educationalLevels ?? []
  if (levels.length === 0) {
    return []
  }

  return db.any<RecordKeyValue>(
    `SELECT el.educationallevelkey AS key, COUNT(em.id)::int AS value
     FROM educationalmaterial em
     JOIN educationallevel el ON el.educationalmaterialid = em.id
     WHERE el.educationallevelkey = ANY($1)
       AND em.expires < $2::date
     GROUP BY el.educationallevelkey`,
    [levels, request.expiredBefore]
  )
}

export const getEducationalSubjectDistribution = async (
  request: EducationalSubjectRequest
): Promise<RecordKeyValue[]> => {
  const subjects = request.educationalSubjects ?? []
  if (subjects.length === 0) {
    return []
  }

  if (request.since && request.until) {
    return db.any<RecordKeyValue>(
      `SELECT ao.objectkey AS key, COUNT(em.id)::int AS value
       FROM educationalmaterial em
       JOIN alignmentobject ao ON ao.educationalmaterialid = em.id
       WHERE ao.objectkey = ANY($1)
         AND em.publishedat >= $2::date
         AND em.publishedat < $3::date + interval '1 day'
       GROUP BY ao.objectkey`,
      [subjects, request.since, request.until]
    )
  }

  return db.any<RecordKeyValue>(
    `SELECT ao.objectkey AS key, COUNT(em.id)::int AS value
     FROM educationalmaterial em
     JOIN alignmentobject ao ON ao.educationalmaterialid = em.id
     WHERE ao.objectkey = ANY($1)
     GROUP BY ao.objectkey`,
    [subjects]
  )
}

export const getOrganizationDistribution = async (
  request: OrganizationRequest
): Promise<RecordKeyValue[]> => {
  const organizations = request.organizations ?? []
  if (organizations.length === 0) {
    return []
  }

  if (request.since && request.until) {
    return db.any<RecordKeyValue>(
      `SELECT a.organizationkey AS key, COUNT(em.id)::int AS value
       FROM educationalmaterial em
       JOIN author a ON a.educationalmaterialid = em.id
       WHERE a.organizationkey = ANY($1)
         AND em.publishedat >= $2::date
         AND em.publishedat < $3::date + interval '1 day'
       GROUP BY a.organizationkey`,
      [organizations, request.since, request.until]
    )
  }

  return db.any<RecordKeyValue>(
    `SELECT a.organizationkey AS key, COUNT(em.id)::int AS value
     FROM educationalmaterial em
     JOIN author a ON a.educationalmaterialid = em.id
     WHERE a.organizationkey = ANY($1)
     GROUP BY a.organizationkey`,
    [organizations]
  )
}
