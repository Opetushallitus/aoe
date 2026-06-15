import { db } from '@resource/postgresClient'
import {
  aoeFileDownloadUrl,
  aoePdfDownloadUrl,
  aoeThumbnailDownloadUrl,
  getEduMaterialVersionURL
} from '@services/urlService'
import {
  AoeMetadataSchema,
  FetchMetadataParams,
  FetchMetadataResult,
  FetchMetadataResultSchema
} from '@/models/oaipmh'
import * as log from '@util/winstonLogger'

type BatchRow = {
  id: number
  obsoleted: number
  urnpublishedat: Date | string
  [key: string]: unknown
}

type MaterialRow = {
  id: number
  filekey: string | null
  pdfkey: string | null
}

type IsBasedonRow = {
  id: number
  materialname: string
  url: string
}

const countQuery = (allVersions: boolean) => `
  SELECT count(*)
  FROM educationalmaterial em
  ${allVersions ? 'INNER JOIN educationalmaterialversion emv on emv.educationalmaterialid = em.id' : ''}
  WHERE em.updatedat >= timestamp $1 AND em.updatedat < timestamp $2 AND em.publishedat IS NOT NULL
`

const batchQuery = (allVersions: boolean) => `
  SELECT em.id, em.createdat, em.publishedat, emv.publishedat as "urnpublishedat", em.updatedat,
         em.archivedat, em.obsoleted,
         CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.timerequired END AS timerequired,
         CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.agerangemin END AS agerangemin,
         CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.agerangemax END AS agerangemax,
         CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.licensecode END AS licensecode,
         CASE WHEN em.obsoleted = 1 THEN NULL ELSE em.expires END AS expires
  FROM educationalmaterial em
  INNER JOIN educationalmaterialversion emv on emv.educationalmaterialid = em.id
  ${!allVersions ? 'AND emv.publishedat = (SELECT MAX(publishedat) FROM educationalmaterialversion emv2 WHERE emv2.educationalmaterialid = emv.educationalmaterialid)' : ''}
  WHERE em.updatedat >= timestamp $1 AND em.updatedat < timestamp $2 AND em.publishedat IS NOT NULL
  ORDER BY em.id ASC
  OFFSET $3
  LIMIT $4
`

const materialJoinQuery = `
  SELECT m.id, m.materiallanguagekey AS language, m.link, version.priority,
         r.filesize, r.mimetype, r.filekey, m.obsoleted, r.pdfkey
  FROM (
    SELECT vc.materialid, vc.publishedat, vc.priority FROM versioncomposition vc
    WHERE vc.publishedat = $2
  ) AS version
  LEFT JOIN material m ON version.materialid = m.id
  LEFT JOIN record r ON m.id = r.materialid
  WHERE m.educationalmaterialid = $1 AND m.obsoleted = 0
`

export async function fetchMaterialMetadata(
  params: FetchMetadataParams
): Promise<FetchMetadataResult> {
  const { dateMin, dateMax, materialPerPage, pageNumber, allVersions } = params

  const countResult = await db.oneOrNone<{ count: string }>(countQuery(allVersions), [
    dateMin,
    dateMax
  ])
  const completeListSize: number = countResult ? parseInt(countResult.count, 10) : 0
  const pageTotal: number = Math.ceil(completeListSize / materialPerPage)

  const rawContent = await db.task(async (t) => {
    return t
      .map(
        batchQuery(allVersions),
        [dateMin, dateMax, pageNumber * materialPerPage, materialPerPage],
        async (q: BatchRow) => {
          const materialRows = await t.any<MaterialRow>(materialJoinQuery, [q.id, q.urnpublishedat])

          q.materials = await Promise.all(
            materialRows.map(async (m) => ({
              ...m,
              filepath: await aoeFileDownloadUrl(m.filekey ?? ''),
              pdfpath: await aoePdfDownloadUrl(m.pdfkey ?? ''),
              materialdisplayname: await t.any<{ displayname: string; language: string }>(
                'SELECT displayname, language FROM materialdisplayname WHERE materialid = $1',
                m.id
              )
            }))
          )

          if (q.obsoleted === 0) {
            q.materialname = await t.any<{ language: string; materialname: string }>(
              'SELECT language, materialname FROM materialname WHERE educationalmaterialid = $1',
              q.id
            )
            q.materialdescription = await t.any<{ language: string; description: string }>(
              'SELECT language, description FROM materialdescription WHERE educationalmaterialid = $1',
              q.id
            )
            q.educationalaudience = await t.any<{ educationalrole: string }>(
              'SELECT educationalrole FROM educationalaudience WHERE educationalmaterialid = $1',
              q.id
            )
            q.learningresourcetype = await t.any<{ value: string }>(
              'SELECT value FROM learningresourcetype WHERE educationalmaterialid = $1',
              q.id
            )
            q.accessibilityfeature = await t.any<{ value: string }>(
              'SELECT value FROM accessibilityfeature WHERE educationalmaterialid = $1',
              q.id
            )
            q.accessibilityhazard = await t.any<{ value: string }>(
              'SELECT value FROM accessibilityhazard WHERE educationalmaterialid = $1',
              q.id
            )
            q.keyword = await t.any<{ value: string; keywordkey: string }>(
              'SELECT value, keywordkey FROM keyword WHERE educationalmaterialid = $1',
              q.id
            )
            q.educationallevel = await t.any<{ value: string }>(
              'SELECT value FROM educationallevel WHERE educationalmaterialid = $1',
              q.id
            )
            q.educationaluse = await t.any<{ value: string }>(
              'SELECT value FROM educationaluse WHERE educationalmaterialid = $1',
              q.id
            )
            q.publisher = await t.any<{ name: string }>(
              'SELECT name FROM publisher WHERE educationalmaterialid = $1',
              q.id
            )
            q.author = await t.any<{ authorname: string; organization: string }>(
              'SELECT authorname, organization FROM author WHERE educationalmaterialid = $1',
              q.id
            )

            const isbasedonRows = await t.any<IsBasedonRow>(
              'SELECT id, materialname, url FROM isbasedon WHERE educationalmaterialid = $1',
              q.id
            )
            q.isbasedon = await Promise.all(
              isbasedonRows.map(async (ib) => ({
                ...ib,
                author: await t.any<{ authorname: string }>(
                  'SELECT authorname FROM isbasedonauthor WHERE isbasedonid = $1',
                  ib.id
                )
              }))
            )

            q.alignmentobject = await t.any<{
              alignmenttype: string
              targetname: string
              targeturl: string | null
              educationalframework: string
            }>(
              'SELECT alignmenttype, targetname, targeturl, educationalframework FROM alignmentobject WHERE educationalmaterialid = $1',
              q.id
            )

            const thumbnailRow = await t.oneOrNone<{ filekey: string; mimetype: string }>(
              'SELECT filekey, mimetype FROM thumbnail WHERE educationalmaterialid = $1 AND obsoleted = 0',
              q.id
            )
            if (thumbnailRow) {
              q.thumbnail = {
                ...thumbnailRow,
                filepath: await aoeThumbnailDownloadUrl(thumbnailRow.filekey)
              }
            }
          }

          const urnRow = await t.oneOrNone<{ urn: string | null; publishedat: Date | string }>(
            'SELECT urn, publishedat FROM educationalmaterialversion WHERE educationalmaterialid = $1 AND publishedat = $2',
            [q.id, q.urnpublishedat]
          )
          q.urn = urnRow?.urn ?? null

          if (allVersions && q.id && urnRow?.publishedat) {
            const publishedAt = urnRow.publishedat
            q.aoeUrl = getEduMaterialVersionURL(
              String(q.id),
              publishedAt instanceof Date ? publishedAt.toISOString() : String(publishedAt)
            )
          }

          return q
        }
      )
      .then(t.batch)
      .catch((err: unknown) => {
        log.error('Fetching a metadata batch failed at OAI-PMH API endpoint', err)
        throw err
      })
  })

  const content = (rawContent as unknown[]).map((item) => AoeMetadataSchema.parse(item))

  return FetchMetadataResultSchema.parse({
    dateMin,
    dateMax,
    materialPerPage,
    pageNumber,
    pageTotal,
    completeListSize,
    content
  })
}
