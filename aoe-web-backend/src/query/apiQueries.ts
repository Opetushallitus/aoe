import { config } from '@/config'
import { EducationalMaterialMetadata } from '@/controllers/educationalMaterial'
import { StatusError } from '@/helpers/errorHandler'
import { isOfficeMimeType } from '@/helpers/officeToPdfConverter'
import { db, pgp } from '@resource/postgresClient'
import { updateEsDocument } from '@search/es'
import { hasDownloadableFiles } from '@search/esQueries'
import { hasAccesstoPublication } from '@services/authService'
import { aoeThumbnailDownloadUrl } from '@services/urlService'
import { removeInvalidXMLCharacters } from '@util/invalidXMLCharValidator'
import * as log from '@util/winstonLogger'
import * as pgLib from 'pg-promise'
import { z } from 'zod'
import { updateViewCounter } from './analyticsQueries'
import {
  downloadFileFromStorage,
  findExistingIndexHtml,
  insertDataToDisplayName
} from './fileHandling'
import { getOwnerName } from './materialQueries'

import type { NextFunction, Request, Response } from 'express'
import type { ITask } from 'pg-promise'
import pg from 'pg-promise/typescript/pg-subset'

export async function addLinkToMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    await db.tx(async (t: any) => {
      const insertIntoMaterialQuery =
        'insert into material (link, educationalmaterialid, materiallanguagekey, priority) values ($1,$2,$3,$4) returning id, link;'
      const newLink = await t.one(insertIntoMaterialQuery, [
        req.body.link,
        req.params.edumaterialid,
        req.body.language,
        req.body.priority
      ])

      const displayName = req.body.displayName

      const insertIntoMaterialDisplayNameQuery =
        'INSERT INTO materialdisplayname (displayname, language, materialid) (SELECT $1,$2,$3 where $3 in (select id from material where educationalmaterialid = $4)) ON CONFLICT (language, materialid) DO UPDATE Set displayname = $1;'
      await t.none(insertIntoMaterialDisplayNameQuery, [
        displayName.fi || '',
        'fi',
        newLink.id,
        req.params.edumaterialid
      ])
      await t.none(insertIntoMaterialDisplayNameQuery, [
        displayName.sv || '',
        'sv',
        newLink.id,
        req.params.edumaterialid
      ])
      await t.none(insertIntoMaterialDisplayNameQuery, [
        displayName.en || '',
        'en',
        newLink.id,
        req.params.edumaterialid
      ])

      const setUpdateTimestamp = 'update educationalmaterial set updatedat = now() where id = $1;'
      await t.none(setUpdateTimestamp, [req.params.edumaterialid])

      const response = {
        id: req.params.edumaterialid,
        link: newLink
      }
      res.status(200).json(response)
    })
  } catch (err) {
    next(new StatusError(500, 'Issue adding link to material', err))
  }
}

export async function getMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const query =
      'SELECT * FROM educationalmaterial where obsoleted != 1 order by id desc limit 100;'
    const data = await db.any(query)
    res.status(200).json(data)
  } catch (err) {
    next(new StatusError(500, 'Issue getting materials ', err))
  }
}

// Create a reusable transaction mode (serializable + read-only + deferrable):
const mode = new pgLib.txMode.TransactionMode({
  tiLevel: pgLib.txMode.isolationLevel.serializable,
  readOnly: true,
  deferrable: true
})

/**
 *
 * @param req
 * @param res
 * @param next
 * @param {boolean} resDisabled Request metadata in post processes without handling the HTTP response.
 */
export const getEducationalMaterialMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction,
  resDisabled?: boolean
): Promise<void> => {
  const rawId = resDisabled ? (res.locals.id as string) : (req.params.edumaterialid as string)
  const eduMaterialId: number = parseInt(rawId, 10)

  if (Number.isNaN(eduMaterialId)) {
    if (resDisabled) {
      log.error(
        `Invalid material id '${rawId}' (parsed to NaN) at ${req.method} ${req.originalUrl}`
      )
      return next(new StatusError(400, `Invalid material id: '${rawId}'`))
    }
    return next(new StatusError(404, `Material not found: '${rawId}'`))
  }

  db.tx({ mode }, async (t: any): Promise<any> => {
    const queries: any = []
    let query
    query =
      'SELECT id, createdat, publishedat, updatedat, archivedat, timerequired, agerangemin, agerangemax, ' +
      'licensecode, l.license, obsoleted, originalpublishedat, expires, suitsallearlychildhoodsubjects, ' +
      'suitsallpreprimarysubjects, suitsallbasicstudysubjects, suitsalluppersecondarysubjects, ' +
      'suitsallvocationaldegrees, suitsallselfmotivatedsubjects, suitsallbranches, ' +
      'suitsalluppersecondarysubjectsnew, ratingcontentaverage, ratingvisualaverage, viewcounter, ' +
      'downloadcounter ' +
      'FROM educationalmaterial AS m ' +
      'LEFT JOIN licensecode AS l ON l.code = m.licensecode ' +
      "WHERE id = $1 AND obsoleted != '1'"
    let response = await t.any(query, [eduMaterialId])
    const isPublished = !!(response[0] && response[0].publishedat)
    queries.push(response)

    query = 'SELECT * FROM materialname ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM materialdescription ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM educationalaudience ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM learningresourcetype ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM accessibilityfeature ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM accessibilityhazard ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM keyword ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM educationallevel ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM educationaluse ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM publisher ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM author ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM isbasedon ' + 'WHERE educationalmaterialid = $1'
    response = await t.map(query, [eduMaterialId], (q: any) => {
      t.any('SELECT * FROM isbasedonauthor ' + 'WHERE isbasedonid = $1', q.id).then((data: any) => {
        q.author = data
      })
      return q
    })
    queries.push(response)
    query = 'SELECT * FROM alignmentobject ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    // Get all materials from material table if not published else get from version table.
    if (!isPublished) {
      query =
        'SELECT m.id, m.materiallanguagekey AS language, link, filepath, originalfilename, filesize, ' +
        'mimetype, filekey, filebucket, pdfkey FROM material AS m ' +
        'LEFT JOIN record AS r ON m.id = r.materialid ' +
        'WHERE m.educationalmaterialid = $1 AND m.obsoleted = 0'
      response = await t.any(query, [eduMaterialId])
    } else {
      if (req.params.publishedat) {
        query =
          'SELECT m.id, m.materiallanguagekey AS language, link, version.priority, filepath, ' +
          'originalfilename, filesize, mimetype, filekey, filebucket, version.publishedat, pdfkey ' +
          'FROM (SELECT materialid, publishedat, priority FROM versioncomposition ' +
          'WHERE publishedat = $2) AS version ' +
          'LEFT JOIN material AS m ON m.id = version.materialid ' +
          'LEFT JOIN record AS r ON m.id = r.materialid ' +
          'WHERE m.educationalmaterialid = $1 AND m.obsoleted = 0 ' +
          'ORDER BY priority'
        response = await t.any(query, [eduMaterialId, req.params.publishedat])
      } else {
        query =
          'SELECT m.id, m.materiallanguagekey AS language, link, version.priority, filepath, ' +
          'originalfilename, filesize, mimetype, filekey, filebucket, version.publishedat, pdfkey ' +
          'FROM (SELECT materialid, publishedat, priority FROM versioncomposition WHERE publishedat = ' +
          '(SELECT MAX(publishedat) FROM versioncomposition WHERE educationalmaterialid = $1)) AS version ' +
          'LEFT JOIN material AS m ON m.id = version.materialid ' +
          'LEFT JOIN record AS r ON m.id = r.materialid ' +
          'WHERE m.educationalmaterialid = $1 AND m.obsoleted = 0 ' +
          'ORDER BY priority'
        response = await t.any(query, [eduMaterialId])
      }
    }
    queries.push(response)

    query =
      'SELECT dn.id, dn.displayname, dn.language, dn.materialid FROM material AS m ' +
      'RIGHT JOIN materialdisplayname AS dn ON m.id = dn.materialid ' +
      'WHERE m.educationalmaterialid = $1 AND m.obsoleted = 0'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query = 'SELECT * FROM educationalaudience ' + 'WHERE educationalmaterialid = $1'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)

    query =
      'SELECT * FROM thumbnail ' + 'WHERE educationalmaterialid = $1 AND obsoleted = 0 LIMIT 1'
    response = await t.oneOrNone(query, [eduMaterialId])
    queries.push(response)
    // get all attachments from attachment table if not published else get from version table
    if (!isPublished) {
      query =
        'SELECT attachment.id, filepath, originalfilename, filesize, mimetype, filekey, filebucket, ' +
        'defaultfile, kind, label, srclang, materialid FROM material ' +
        'INNER JOIN attachment ON material.id = attachment.materialid ' +
        'WHERE material.educationalmaterialid = $1 AND material.obsoleted = 0 AND attachment.obsoleted = 0'
      response = await t.any(query, [eduMaterialId])
    } else {
      if (req.params.publishedat) {
        query =
          'SELECT attachment.id, filepath, originalfilename, filesize, mimetype, filekey, ' +
          'filebucket, defaultfile, kind, label, srclang, materialid FROM attachmentversioncomposition AS v ' +
          'INNER JOIN attachment ON v.attachmentid = attachment.id ' +
          'WHERE versioneducationalmaterialid = $1 AND attachment.obsoleted = 0 AND versionpublishedat = $2'
        response = await t.any(query, [eduMaterialId, req.params.publishedat])
      } else {
        query =
          'SELECT attachment.id, filepath, originalfilename, filesize, mimetype, filekey, ' +
          'filebucket, defaultfile, kind, label, srclang, materialid FROM attachmentversioncomposition AS v ' +
          'INNER JOIN attachment ON v.attachmentid = attachment.id ' +
          'WHERE versioneducationalmaterialid = $1 AND attachment.obsoleted = 0 AND versionpublishedat = ' +
          '(SELECT MAX(publishedat) FROM versioncomposition WHERE educationalmaterialid = $1)'
        response = await t.any(query, [eduMaterialId, req.params.publishedat])
      }
    }
    queries.push(response)

    query =
      'SELECT DISTINCT publishedat ' +
      'FROM versioncomposition ' +
      'WHERE educationalmaterialid = $1 ' +
      'ORDER BY publishedat DESC'
    response = await t.any(query, [eduMaterialId])
    queries.push(response)
    if (req.params.publishedat) {
      query =
        'SELECT urn FROM educationalmaterialversion WHERE educationalmaterialid = $1 AND publishedat = $2'
      response = await t.oneOrNone(query, [eduMaterialId, req.params.publishedat])
      queries.push(response)
    } else {
      query =
        'SELECT urn ' +
        'FROM educationalmaterialversion ' +
        'WHERE educationalmaterialid = $1 AND publishedat = ' +
        '(SELECT MAX(publishedat) FROM educationalmaterialversion WHERE educationalmaterialid = $1)'
      response = await t.oneOrNone(query, [eduMaterialId])
      queries.push(response)
    }
    return t.batch(queries)
  })
    .then(async (data: any) => {
      const jsonObj: any = {}
      if (!data[0][0]) {
        return res.status(200).json(jsonObj)
      }
      const uid = req?.session?.passport?.user.uid || ''

      const owner = await isOwner(eduMaterialId, uid)
      // add displayname object to material object
      for (const element of data[14]) {
        const nameobj = {
          fi: '',
          sv: '',
          en: ''
        }
        for (const element2 of data[15]) {
          if (element2.materialid === element.id) {
            if (element2.language === 'fi') {
              nameobj.fi = element2.displayname
            } else if (element2.language === 'sv') {
              nameobj.sv = element2.displayname
            } else if (element2.language === 'en') {
              nameobj.en = element2.displayname
            }
          }
        }
        element.displayName = nameobj
      }
      jsonObj.id = data[0][0].id
      jsonObj.materials = data[14]
      for (const i in jsonObj.materials) {
        let ext = ''
        if (jsonObj.materials[i] && jsonObj.materials[i]['originalfilename']) {
          ext = jsonObj.materials[i]['originalfilename'].substring(
            jsonObj.materials[i]['originalfilename'].lastIndexOf('.'),
            jsonObj.materials[i]['originalfilename'].length
          )
        }
        if (ext === '.h5p') {
          jsonObj.materials[i]['mimetype'] = 'text/html'
          jsonObj.materials[i]['filepath'] =
            `${config.MEDIA_FILE_PROCESS.h5pPlayApi}${jsonObj.materials[i]['filekey']}`
        } else if (
          jsonObj.materials[i] &&
          jsonObj.materials[i]['pdfkey'] &&
          isOfficeMimeType(jsonObj.materials[i]['mimetype'])
        ) {
          jsonObj.materials[i]['filepath'] =
            config.MEDIA_FILE_PROCESS.conversionToPdfApi + jsonObj.materials[i]['pdfkey']
        } else if (
          jsonObj.materials[i] &&
          (jsonObj.materials[i]['mimetype'] === 'application/zip' ||
            jsonObj.materials[i]['mimetype'] === 'text/html' ||
            jsonObj.materials[i]['mimetype'] === 'application/x-zip-compressed')
        ) {
          const fileSize = jsonObj.materials[i]['filesize'] || 0
          const maxSize = config.MEDIA_FILE_PROCESS.maxZipExtractionSize
          const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2)
          const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2)

          // Skip synchronous extraction for large files to prevent timeout issues
          if (fileSize > maxSize) {
            log.warn(
              `Skipping ZIP extraction for large file: eduMaterialId=${eduMaterialId}, materialId=${jsonObj.materials[i].id}, ` +
                `filekey=${jsonObj.materials[i].filekey}, filesize=${fileSizeMB} MB (max allowed: ${maxSizeMB} MB). ` +
                `File will be available for download only.`
            )
            // Leave filepath empty so the file can still be downloaded but not previewed
            continue
          }

          req.params.key = jsonObj.materials[i].filekey
          log.debug(
            `Processing ZIP/HTML file: eduMaterialId=${eduMaterialId}, materialId=${jsonObj.materials[i].id}, ` +
              `filekey=${req.params.key}, filesize=${fileSizeMB} MB`
          )

          // Check if files are already extracted on disk before downloading from S3
          const cachedResult = findExistingIndexHtml(jsonObj.materials[i]['originalfilename'])
          const result =
            cachedResult !== false
              ? cachedResult
              : await downloadFileFromStorage(req, res, next, true)
          if (
            result !== false &&
            (jsonObj.materials[i]['mimetype'] === 'application/zip' ||
              jsonObj.materials[i]['mimetype'] === 'application/x-zip-compressed')
          ) {
            /**
             * if the unZipAndExtract returns a pathToReturn instead of false, we know its a html file, so then we change the mimetype to text/html
             * Write db code to replace application/zip with text/html for this specific file
             * mimetype = text/html + result
             */
            jsonObj.materials[i]['mimetype'] = 'text/html'
            jsonObj.materials[i]['filepath'] =
              process.env.HTML_BASE_URL +
              result.replace(config.MEDIA_FILE_PROCESS.htmlFolder, '/content')
          } else if (result !== false) {
            /**
             * This means the function the returned true, but the mimetype was already text/html so we dont have to change it
             * Simply return the result to the frontend, which means we have to to the query here and push the response thereafter
             */
            jsonObj.materials[i]['filepath'] = result
          }
        }
      }
      jsonObj.owner = owner
      jsonObj.ownerName = await getOwnerName(String(eduMaterialId))
      jsonObj.name = data[1]
      jsonObj.createdAt = data[0][0].createdat
      jsonObj.updatedAt = data[0][0].updatedat
      jsonObj.publishedAt = data[0][0].publishedat
      jsonObj.archivedAt = data[0][0].archivedat
      jsonObj.suitsAllEarlyChildhoodSubjects = data[0][0].suitsallearlychildhoodsubjects
      jsonObj.suitsAllPrePrimarySubjects = data[0][0].suitsallpreprimarysubjects
      jsonObj.suitsAllBasicStudySubjects = data[0][0].suitsallbasicstudysubjects
      jsonObj.suitsAllUpperSecondarySubjects = data[0][0].suitsalluppersecondarysubjects
      jsonObj.suitsAllVocationalDegrees = data[0][0].suitsallvocationaldegrees
      jsonObj.suitsAllSelfMotivatedSubjects = data[0][0].suitsallselfmotivatedsubjects
      jsonObj.suitsAllBranches = data[0][0].suitsallbranches
      jsonObj.suitsAllUpperSecondarySubjectsNew = data[0][0].suitsalluppersecondarysubjectsnew
      jsonObj.ratingContentAverage = data[0][0].ratingcontentaverage
      jsonObj.ratingVisualAverage = data[0][0].ratingvisualaverage
      jsonObj.viewCounter = data[0][0].viewcounter
      jsonObj.downloadCounter = data[0][0].downloadcounter
      jsonObj.author = data[11]
      jsonObj.publisher = data[10]
      jsonObj.description = data[2]
      jsonObj.keywords = data[7]
      jsonObj.learningResourceTypes = data[4]
      jsonObj.timeRequired = data[0][0].timerequired
      const typicalAgeRange: any = {}
      typicalAgeRange.typicalAgeRangeMin = data[0][0].agerangemin
      typicalAgeRange.typicalAgeRangeMax = data[0][0].agerangemax
      jsonObj.expires = data[0][0].expires
      jsonObj.typicalAgeRange = typicalAgeRange
      jsonObj.educationalAlignment = data[13]
      jsonObj.educationalLevels = data[8]
      jsonObj.educationalUses = data[9]
      jsonObj.accessibilityFeatures = data[5]
      jsonObj.accessibilityHazards = data[6]
      const license: any = {}
      license.value = data[0][0].license
      license.key = data[0][0].licensecode
      jsonObj.license = license
      jsonObj.isBasedOn = data[12]
      jsonObj.educationalRoles = data[16]
      jsonObj.thumbnail = data[17]
      if (jsonObj.thumbnail) {
        jsonObj.thumbnail.filepath = await aoeThumbnailDownloadUrl(jsonObj.thumbnail.filekey)
      }
      jsonObj.attachments = data[18]
      jsonObj.versions = data[19]
      jsonObj.hasDownloadableFiles = jsonObj.materials
        ? hasDownloadableFiles(jsonObj.materials)
        : false
      jsonObj.urn = data[20] ? data[20].urn : data[20]
      !resDisabled && res.status(200).json(jsonObj)

      // Pass response (metadata) to the next function in the request chain.
      res.locals = jsonObj

      if (
        !resDisabled &&
        (!req.isAuthenticated() || !(await hasAccesstoPublication(jsonObj.id, req)))
      ) {
        updateViewCounter(jsonObj.id).catch((error) => {
          log.error(`View counter update failed: ${error}`)
        })
      }
      next()
    })
    .catch((err: any) => {
      next(new StatusError(400, 'Issue getting material data', err))
    })
}

export async function getUserMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    db.task(async (t: any) => {
      const params: any = []
      let query
      query =
        "SELECT id, publishedat, expires, viewcounter, downloadcounter FROM educationalmaterial WHERE usersusername = $1 and obsoleted != '1';"
      params.push(req.session.passport.user.uid)
      return t
        .map(query, params, async (q: any) => {
          query = 'select * from materialname where educationalmaterialid = $1;'
          let response = await t.any(query, [q.id])
          q.name = response
          query = 'select * from materialdescription where educationalmaterialid = $1;'
          response = await t.any(query, [q.id])
          q.description = response
          query = 'select * from learningresourcetype where educationalmaterialid = $1;'
          response = await t.any(query, [q.id])
          q.learningResourceTypes = response
          query = 'select * from keyword where educationalmaterialid = $1;'
          response = await t.any(query, [q.id])
          q.keywords = response
          query = 'select * from author where educationalmaterialid = $1;'
          response = await t.any(query, [q.id])
          q.authors = response
          query =
            'Select filekey as thumbnail from thumbnail where educationalmaterialid = $1 and obsoleted = 0;'
          response = await db.oneOrNone(query, [q.id])
          if (response) {
            response.thumbnail = await aoeThumbnailDownloadUrl(response.thumbnail)
          }
          q.thumbnail = response
          query = 'select * from educationallevel where educationalmaterialid = $1;'
          response = await t.any(query, [q.id])
          q.educationalLevels = response
          query =
            'select licensecode as key, license as value from educationalmaterial as m left join licensecode as l on m.licensecode = l.code WHERE m.id = $1;'
          const responseObj = await t.oneOrNone(query, [q.id])
          q.license = responseObj
          return q
        })
        .then(t.batch)
        .catch((error: any) => {
          log.error(error)
          return error
        })
    }).then((data: any) => {
      res.status(200).json(data)
    })
  } catch (err) {
    next(new StatusError(500, 'Issue getting users material', err))
  }
}

export async function getRecentMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await db.task(async (t: any) => {
      // Fetch the initial list of educational materials
      const materials = await t.any(
        "SELECT id FROM educationalmaterial WHERE obsoleted = '0' AND publishedat IS NOT NULL AND (expires IS NULL OR expires > now()) ORDER BY updatedAt DESC LIMIT 6;"
      )

      // Process each material to fetch additional details
      for (const material of materials) {
        // Fetch material names
        material.name = await t.any(
          'SELECT * FROM materialname WHERE educationalmaterialid = $1;',
          [material.id]
        )

        // Fetch material descriptions
        material.description = await t.any(
          'SELECT * FROM materialdescription WHERE educationalmaterialid = $1;',
          [material.id]
        )

        // Fetch learning resource types
        material.learningResourceTypes = await t.any(
          'SELECT * FROM learningresourcetype WHERE educationalmaterialid = $1;',
          [material.id]
        )

        // Fetch keywords
        material.keywords = await t.any('SELECT * FROM keyword WHERE educationalmaterialid = $1;', [
          material.id
        ])

        // Fetch authors
        material.authors = await t.any('SELECT * FROM author WHERE educationalmaterialid = $1;', [
          material.id
        ])

        // Fetch thumbnail
        const thumbnailResponse = await db.oneOrNone(
          'SELECT filekey AS thumbnail FROM thumbnail WHERE educationalmaterialid = $1 AND obsoleted = 0;',
          [material.id]
        )
        if (thumbnailResponse) {
          thumbnailResponse.thumbnail = await aoeThumbnailDownloadUrl(thumbnailResponse.thumbnail)
        }
        material.thumbnail = thumbnailResponse

        // Fetch educational levels
        material.educationalLevels = await t.any(
          'SELECT * FROM educationallevel WHERE educationalmaterialid = $1;',
          [material.id]
        )

        // Fetch license information
        material.license = await t.oneOrNone(
          'SELECT licensecode AS key, license AS value FROM educationalmaterial AS m LEFT JOIN licensecode AS l ON m.licensecode = l.code WHERE m.id = $1;',
          [material.id]
        )
      }

      return materials
    })

    res.status(200).json(data)
  } catch (err) {
    next(new StatusError(500, 'Issue getting recent materials', err))
  }
}

export async function setEducationalMaterialObsoleted(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let query
    let data
    await db.tx({ mode }, async (t: any) => {
      const queries: any = []
      query = "update educationalmaterial SET obsoleted = '1' WHERE id = $1;"
      queries.push(await db.none(query, [req.params.edumaterialid]))
      query = "update material SET obsoleted = '1' WHERE educationalmaterialid = $1 returning id;"
      data = await db.any(query, [req.params.edumaterialid])
      queries.push(data)
      const arr: string[] = []
      for (let i = 1; i <= data.length; i++) {
        arr.push(`('${data[i - 1].id}')`)
      }
      if (arr.length > 0) {
        query = `update attachment SET obsoleted = '1' WHERE materialid in (${arr.join(',')} );`
        queries.push(await db.none(query))
      }
      query = 'update educationalmaterial set updatedat = now() where id = $1'
      queries.push(await db.none(query, [req.params.edumaterialid]))
      return t.batch(queries)
    })
    res.status(204).send()
    updateEsDocument().catch((err: Error) => {
      log.error(err)
    })
  } catch (err) {
    next(new StatusError(500, 'Issue deleting material', err))
  }
}

/**
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @return {Promise<void>}
 */
export const setMaterialObsoleted = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await db.tx({ mode }, async (t: any): Promise<any> => {
      const queries: any = []
      let query: string
      query = `
        UPDATE material
        SET obsoleted = '1'
        WHERE id = $1
        RETURNING educationalmaterialid
      `
      queries.push(await db.one(query, [req.params.materialid]))
      query = `
        UPDATE attachment
        SET obsoleted = '1'
        WHERE materialid = $1
      `
      queries.push(await db.none(query, [req.params.materialid]))
      query = `
        UPDATE educationalmaterial
        SET updatedat = NOW()
        WHERE id = $1
      `
      queries.push(await db.none(query, [req.params.edumaterialid]))
      return t.batch(queries)
    })
    res.status(200).json({ obsoleted: req.params.materialid })
    updateEsDocument().catch((err: Error): void => {
      log.error('Search index update failed', err)
    })
  } catch (err) {
    next(new StatusError(500, `Setting the material as obsoleted failed`, err))
  }
}

export const setAttachmentObsoleted = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let query
    let data
    await db.tx({ mode }, async (t: any): Promise<any> => {
      const queries: any = []
      query = `
        UPDATE attachment
        SET obsoleted = '1'
        WHERE id = $1
      `
      data = await db.any(query, [req.params.attachmentid])
      queries.push(data)
      query = `
        UPDATE educationalmaterial
        SET updatedat = now()
        WHERE id = $1
      `
      queries.push(await db.none(query, [req.params.edumaterialid]))
      return t.batch(queries)
    })
    res.status(200).json({ status: 'deleted' })
    updateEsDocument().catch((err: Error) => {
      log.error('Search index update failed after setting an attachment file obsoleted: %o', err)
    })
  } catch (err) {
    next(new StatusError(500, `Setting an attachment file obsoleted failed`, err))
  }
}

async function setLanguage(obj: any) {
  if (obj) {
    // Set 'fi' based on the availability of 'sv' and 'en'
    if (!obj.fi || obj.fi === '') {
      obj.fi = obj.sv || obj.en || ''
    }

    // Set 'sv' based on the availability of 'fi' and 'en'
    if (!obj.sv || obj.sv === '') {
      obj.sv = obj.fi || obj.en || ''
    }

    // Set 'en' based on the availability of 'fi' and 'sv'
    if (!obj.en || obj.en === '') {
      obj.en = obj.fi || obj.sv || ''
    }
  }
}

const insertDataToDescription = async (t: any, educationalmaterialid: string, description: any) => {
  const queries = []
  const query =
    'INSERT ' +
    'INTO materialdescription ' +
    '(description, language, educationalmaterialid) ' +
    'VALUES ($1, $2, $3) ' +
    'ON CONFLICT (language, educationalmaterialid) DO ' +
    'UPDATE SET description = $1'
  if (description && educationalmaterialid) {
    if (!description.fi || description.fi === '') {
      if (!description.sv || description.sv === '') {
        if (!description.en || description.en === '') {
          queries.push(await t.any(query, ['', 'fi', educationalmaterialid]))
        } else {
          queries.push(
            await t.any(query, [
              removeInvalidXMLCharacters(description.en, true),
              'fi',
              educationalmaterialid
            ])
          )
        }
      } else {
        queries.push(
          await t.any(query, [
            removeInvalidXMLCharacters(description.sv, true),
            'fi',
            educationalmaterialid
          ])
        )
      }
    } else {
      queries.push(
        await t.any(query, [
          removeInvalidXMLCharacters(description.fi, true),
          'fi',
          educationalmaterialid
        ])
      )
    }

    if (!description.sv || description.sv === '') {
      if (!description.fi || description.fi === '') {
        if (!description.en || description.en === '') {
          queries.push(await t.any(query, ['', 'sv', educationalmaterialid]))
        } else {
          queries.push(
            await t.any(query, [
              removeInvalidXMLCharacters(description.en, true),
              'sv',
              educationalmaterialid
            ])
          )
        }
      } else {
        queries.push(
          await t.any(query, [
            removeInvalidXMLCharacters(description.fi, true),
            'sv',
            educationalmaterialid
          ])
        )
      }
    } else {
      queries.push(
        await t.any(query, [
          removeInvalidXMLCharacters(description.sv, true),
          'sv',
          educationalmaterialid
        ])
      )
    }

    if (!description.en || description.en === '') {
      if (!description.fi || description.fi === '') {
        if (!description.sv || description.sv === '') {
          queries.push(await t.any(query, ['', 'en', educationalmaterialid]))
        } else {
          queries.push(
            await t.any(query, [
              removeInvalidXMLCharacters(description.sv, true),
              'en',
              educationalmaterialid
            ])
          )
        }
      } else {
        queries.push(
          await t.any(query, [
            removeInvalidXMLCharacters(description.fi, true),
            'en',
            educationalmaterialid
          ])
        )
      }
    } else {
      queries.push(
        await t.any(query, [
          removeInvalidXMLCharacters(description.en, true),
          'en',
          educationalmaterialid
        ])
      )
    }
  }
  return queries
}

export interface NameObject {
  en?: string | null
  sv?: string | null
  fi?: string | null
}

export async function insertEducationalMaterialName(materialname: NameObject, id: string, t: any) {
  const query =
    'INSERT INTO materialname (materialname, language, slug, educationalmaterialid) ' +
    'VALUES ($1, $2, $3, $4) ' +
    'ON CONFLICT (language,educationalmaterialid) DO ' +
    'UPDATE SET materialname = $1, slug = $3'
  const queries = []
  await setLanguage(materialname)
  log.debug(`Query in insertEducationalMaterialName(): ${query}`)
  if (materialname.fi === null) {
    queries.push(await t.any(query, ['', 'fi', '', id]))
  } else {
    queries.push(await t.any(query, [materialname.fi, 'fi', '', id]))
  }
  if (materialname.sv === null) {
    queries.push(await t.any(query, ['', 'sv', '', id]))
  } else {
    queries.push(await t.any(query, [materialname.sv, 'sv', '', id]))
  }
  if (materialname.en === null) {
    queries.push(await t.any(query, ['', 'en', '', id]))
  } else {
    queries.push(await t.any(query, [materialname.en, 'en', '', id]))
  }
  return queries
}

type KeyedRowSpec = {
  table: string
  keyColumn: string
  valueColumn: string
  updateOnConflict: boolean
}

type AlignmentRow = {
  id: number
  alignmenttype: string
  objectkey: string
  source: string
}

/**
 * Replace the key/value rows of a material-scoped lookup table: delete the rows whose key
 * is no longer present, then upsert the current set. Every key/value is bound as a
 * parameter (identifiers via pg-promise name/csv formatting), so caller-supplied strings
 * can never alter the SQL. `table`, `keyColumn` and `valueColumn` are trusted constants.
 */
const syncKeyedRows = async (
  t: ITask<pg.IClient> & pg.IClient,
  spec: KeyedRowSpec,
  emid: string,
  items?: Array<{ key: string; value: string }> | null
): Promise<void> => {
  const { table, keyColumn, valueColumn, updateOnConflict } = spec
  if (!items || items.length < 1) {
    await t.none('DELETE FROM $1:name WHERE educationalmaterialid = $2', [table, emid])
    return
  }
  await t.none('DELETE FROM $1:name WHERE educationalmaterialid = $2 AND $3:name NOT IN ($4:csv)', [
    table,
    emid,
    keyColumn,
    items.map((item) => item.key)
  ])
  const columns = new pgp.helpers.ColumnSet([keyColumn, valueColumn, 'educationalmaterialid'], {
    table
  })
  const rows = items.map((item) => ({
    [keyColumn]: item.key,
    [valueColumn]: item.value,
    educationalmaterialid: emid
  }))
  const conflict = updateOnConflict
    ? pgp.as.format(
        'ON CONFLICT ($1:name, educationalmaterialid) DO UPDATE SET $2:name = EXCLUDED.$2:name',
        [keyColumn, valueColumn]
      )
    : pgp.as.format('ON CONFLICT ($1:name, educationalmaterialid) DO NOTHING', [keyColumn])
  await t.none(`${pgp.helpers.insert(rows, columns)} ${conflict}`)
}

const versionSchema = z.object({ publishedat: z.string() })

export const updateMaterial = async (
  metadata: EducationalMaterialMetadata,
  emid: string
): Promise<{ publishedat: string } | undefined> => {
  return await db
    .tx(async (t) => {
      log.debug(`Update metadata in updateMaterial(): ${JSON.stringify(metadata)}`)

      if (metadata.name) {
        await insertEducationalMaterialName(metadata.name, emid, t)
      }

      // material
      const dnow: number = Date.now() / 1000.0
      await t.none(
        `
        UPDATE educationalmaterial
        SET (expires, UpdatedAt, timeRequired, agerangeMin, agerangeMax, licensecode, suitsAllEarlyChildhoodSubjects,
          suitsAllPrePrimarySubjects, suitsAllBasicStudySubjects, suitsAllUpperSecondarySubjects,
          suitsAllVocationalDegrees, suitsAllSelfMotivatedSubjects, suitsAllBranches, suitsAllUpperSecondarySubjectsNew) =
          ($1, to_timestamp($2), $3, $4, $5, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        WHERE id = $6
      `,
        [
          metadata.expires,
          dnow,
          metadata.timeRequired || '',
          metadata.typicalAgeRange ? metadata.typicalAgeRange.typicalAgeRangeMin : undefined,
          metadata.typicalAgeRange ? metadata.typicalAgeRange.typicalAgeRangeMax : undefined,
          emid,
          metadata.license,
          metadata.suitsAllEarlyChildhoodSubjects,
          metadata.suitsAllPrePrimarySubjects,
          metadata.suitsAllBasicStudySubjects,
          metadata.suitsAllUpperSecondarySubjects,
          metadata.suitsAllVocationalDegrees,
          metadata.suitsAllSelfMotivatedSubjects,
          metadata.suitsAllBranches,
          metadata.suitsAllUpperSecondarySubjectsNew
        ]
      )

      // description
      if (metadata.description) {
        await insertDataToDescription(t, emid, metadata.description)
      }

      await syncKeyedRows(
        t,
        {
          table: 'educationalaudience',
          keyColumn: 'educationalrolekey',
          valueColumn: 'educationalrole',
          updateOnConflict: true
        },
        emid,
        metadata.educationalRoles
      )
      await syncKeyedRows(
        t,
        {
          table: 'educationaluse',
          keyColumn: 'educationalusekey',
          valueColumn: 'value',
          updateOnConflict: true
        },
        emid,
        metadata.educationalUses
      )
      await syncKeyedRows(
        t,
        {
          table: 'learningresourcetype',
          keyColumn: 'learningresourcetypekey',
          valueColumn: 'value',
          updateOnConflict: true
        },
        emid,
        metadata.learningResourceTypes
      )
      await syncKeyedRows(
        t,
        {
          table: 'keyword',
          keyColumn: 'keywordkey',
          valueColumn: 'value',
          updateOnConflict: true
        },
        emid,
        metadata.keywords
      )
      await syncKeyedRows(
        t,
        {
          table: 'publisher',
          keyColumn: 'publisherkey',
          valueColumn: 'name',
          updateOnConflict: true
        },
        emid,
        metadata.publisher
      )
      const isBasedonArr = metadata.isBasedOn?.externals ?? []
      await t.none(
        'DELETE FROM isbasedonauthor WHERE isbasedonid IN (SELECT id FROM isbasedon WHERE educationalmaterialid = $1)',
        [emid]
      )
      await t.none('DELETE FROM isbasedon WHERE educationalmaterialid = $1', [emid])
      for (const external of isBasedonArr) {
        const inserted = await t.one(
          'INSERT INTO isbasedon (materialname, url, educationalmaterialid) VALUES ($1,$2,$3) ON CONFLICT (materialname, educationalmaterialid) DO UPDATE SET url = $2 RETURNING id',
          [external.name, external.url, emid]
        )
        for (const author of external.author) {
          await t.none('INSERT INTO isbasedonauthor (authorname, isbasedonid) VALUES ($1,$2)', [
            author,
            inserted.id
          ])
        }
      }

      const alignmentObjectArr = metadata.alignmentObjects
      if (!alignmentObjectArr || alignmentObjectArr.length === 0) {
        await t.none('DELETE FROM alignmentobject WHERE educationalmaterialid = $1', [emid])
      } else {
        const existing = (await t.any(
          'SELECT * FROM alignmentobject WHERE educationalmaterialid = $1',
          [emid]
        )) as AlignmentRow[]
        const stale = existing.filter(
          (row) =>
            !alignmentObjectArr.some(
              (a) =>
                row.alignmenttype === a.alignmentType &&
                row.objectkey === a.key &&
                row.source === a.source
            )
        )
        for (const row of stale) {
          await t.none('DELETE FROM alignmentobject WHERE id = $1', [row.id])
        }
        const columns = new pgp.helpers.ColumnSet(
          [
            'alignmenttype',
            'targetname',
            'source',
            'educationalmaterialid',
            'objectkey',
            'educationalframework',
            'targeturl'
          ],
          { table: 'alignmentobject' }
        )
        const values = alignmentObjectArr.map((element) => ({
          alignmenttype: element.alignmentType,
          targetname: element.targetName,
          source: element.source,
          educationalmaterialid: emid,
          objectkey: element.key,
          educationalframework: element.educationalFramework || '',
          targeturl: element.targetUrl
        }))
        await t.none(
          pgp.helpers.insert(values, columns) +
            ' ON CONFLICT ON CONSTRAINT constraint_alignmentobject DO UPDATE SET educationalframework = excluded.educationalframework'
        )
      }
      await t.none('DELETE FROM author WHERE educationalmaterialid = $1', [emid])
      for (const element of metadata.authors ?? []) {
        await t.none(
          'INSERT INTO author (authorname, organization, educationalmaterialid, organizationkey) VALUES ($1, $2, $3, $4)',
          [
            element.author || '',
            element.organization ? element.organization.value : '',
            emid,
            element.organization ? element.organization.key : ''
          ]
        )
      }

      // File details
      if (metadata.fileDetails) {
        for (const element of metadata.fileDetails) {
          await insertDataToDisplayName(t, emid, element.id, element)
          await t.none(
            'UPDATE material SET materiallanguagekey = $1 WHERE id = $2 AND educationalmaterialid = $3',
            [element.language, element.id, emid]
          )
          if (element.link) {
            await t.none(
              'UPDATE material SET link = $1 WHERE id = $2 AND educationalmaterialid = $3',
              [element.link, element.id, emid]
            )
          }
        }
      }
      await syncKeyedRows(
        t,
        {
          table: 'accessibilityfeature',
          keyColumn: 'accessibilityfeaturekey',
          valueColumn: 'value',
          updateOnConflict: false
        },
        emid,
        metadata.accessibilityFeatures
      )
      await syncKeyedRows(
        t,
        {
          table: 'accessibilityhazard',
          keyColumn: 'accessibilityhazardkey',
          valueColumn: 'value',
          updateOnConflict: false
        },
        emid,
        metadata.accessibilityHazards
      )
      await syncKeyedRows(
        t,
        {
          table: 'educationallevel',
          keyColumn: 'educationallevelkey',
          valueColumn: 'value',
          updateOnConflict: false
        },
        emid,
        metadata.educationalLevels
      )
      if (metadata.attachmentDetails) {
        for (const element of metadata.attachmentDetails) {
          await t.none(
            'update attachment set kind = $1, defaultfile = $2, label = $3, srclang = $4 where (id = $5 ' +
              'and (select educationalmaterialid from material where id = (select materialid from attachment where id = $5)) = $6)',
            [element.kind, element.default, element.label, element.lang, element.id, emid]
          )
        }
      }

      if (metadata.isVersioned) {
        if (metadata.materials) {
          await t.none(
            'UPDATE educationalmaterial SET publishedat = now() WHERE id = $1 AND publishedat IS NULL;',
            [emid]
          )
          const publishedat = versionSchema.parse(
            await t.one(
              'INSERT INTO educationalmaterialversion (educationalmaterialid, publishedat) values ($1, now()::timestamp(3)) returning publishedat;',
              [emid]
            )
          )
          for (const element of metadata.materials) {
            await t.none(
              'INSERT INTO versioncomposition (educationalmaterialid, materialid, publishedat, priority) select $1,$2,now()::timestamp(3),$3 where exists (select * from material where id = $2 and educationalmaterialid = $1)',
              [emid, element.materialId, element.priority]
            )
            if (element.attachments) {
              for (const att of element.attachments) {
                await t.none(
                  'INSERT INTO attachmentversioncomposition (versioneducationalmaterialid, versionmaterialid, versionpublishedat, attachmentid) select $1,$2,now()::timestamp(3),$3 where exists (select * from attachment where id = $3 and materialid = $2)',
                  [emid, element.materialId, att]
                )
              }
            }
          }
          return publishedat
        }
      } else if (metadata.materials) {
        for (const element of metadata.materials) {
          await t.none(
            'UPDATE versioncomposition SET priority = $3 WHERE educationalmaterialid = $1 and materialid = $2 and publishedat = (select max(publishedat) from versioncomposition where educationalmaterialid = $1)',
            [emid, element.materialId, element.priority]
          )
        }
      }

      return undefined
    })
    .catch((err: Error) => {
      log.error(err)
      throw err
    })
}

export const updateEduMaterialVersionURN = async (
  id: string,
  publishedat: string,
  urn: string
): Promise<void> => {
  try {
    await db.none(
      `
      UPDATE educationalmaterialversion
      SET urn = $3
      WHERE educationalmaterialid = $1 AND publishedat = $2
    `,
      [id, publishedat, urn]
    )
  } catch (error) {
    log.error(`Failed to update educational material version URN`, error)
    throw error
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const query =
      'UPDATE users SET (firstname, lastname, preferredlanguage, preferredtargetname, ' +
      'preferredalignmenttype) = ($1, $2, $3, $4, $5) ' +
      'WHERE username = $6'
    const data = await db.any(query, [
      req.body.firstname,
      req.body.lastname,
      req.body.preferredlanguage,
      req.body.preferredtargetname,
      req.body.preferredalignmenttype,
      req.session.passport.user.uid
    ])
    res.status(200).json('user updated')
  } catch (err) {
    next(new StatusError(500, 'Issue updating user', err))
  }
}

export async function updateTermsOfUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const query = "UPDATE users SET termsofusage = '1' WHERE username = $1"
    const data = await db.any(query, [req.session.passport.user.uid])
    res.status(200).json('terms of usage updated')
  } catch (err) {
    next(new StatusError(500, 'Update failed', err))
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const query = 'SELECT * FROM users WHERE username = $1'
    const data = await db.any(query, [req.session.passport.user.uid])
    res.status(200).json(data)
  } catch (err) {
    next(new StatusError(500, 'Issue processing get user request', err))
  }
}

async function isOwner(educationalmaterialid: number, uid: string) {
  const result = await db.oneOrNone(
    'SELECT usersusername from educationalmaterial WHERE id = $1',
    educationalmaterialid
  )
  if (!result) {
    return false
  }
  return uid === result.usersusername
}
