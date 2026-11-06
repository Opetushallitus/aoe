import { config } from '@/config'
import {
  EducationalMaterial,
  Material,
  MaterialDisplayName,
  Record,
  sequelize
} from '@/domain/aoeModels'
import { extractionFolderOf, findPreviewEntry } from '@/helpers/archivePreviewEntry'
import { abortOnClientClose, isClientAbortError, StatusError } from '@/helpers/errorHandler'
import { convertOfficeFileToStoredPDF, isOfficeMimeType } from '@/helpers/officeToPdfConverter'
import {
  CompleteMultipartUploadCommandOutput,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommandInput
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { db, pgp } from '@resource/postgresClient'
import { s3Client } from '@resource/s3Client'
import { hasAccesstoPublication } from '@services/authService'
import {
  extractFilePreview,
  InvalidArchiveError,
  previewKindOf
} from '@services/filePreviewService'
import { idParamSchema, jsonFieldSchema } from '@util/requestValidator'
import * as log from '@util/winstonLogger'
import { ZipArchive } from 'archiver'
import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import multer, { Multer, StorageEngine } from 'multer'
import path from 'path'
import { ColumnSet, ITask } from 'pg-promise'
import { Transaction } from 'sequelize'
import { PassThrough, Readable, Transform } from 'stream'
import { once } from 'node:events'
import { finished, pipeline } from 'node:stream/promises'
import os from 'node:os'
import { mkdtemp, rename, rm } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { updateDownloadCounter } from './analyticsQueries'
import { insertEducationalMaterialName } from './apiQueries'
import MulterFile = Express.Multer.File
import StreamZip from 'node-stream-zip'
import { IClient } from 'pg-promise/typescript/pg-subset'
import { z } from 'zod'

// Upload result type from @aws-sdk/lib-storage; superset of the legacy
// ManagedUpload.SendData (exposes Location/Key/Bucket/ETag).
type SendData = CompleteMultipartUploadCommandOutput

type StorageFile = { filekey: string; originalfilename: string }

type StorageObjectParams = {
  Bucket: NonNullable<GetObjectCommandInput['Bucket']>
  Key: NonNullable<GetObjectCommandInput['Key']>
  Range?: GetObjectCommandInput['Range']
}

// GetObject's Body is a browser/Node union incl. undefined; in Node it is always
// a Readable. Narrow with a runtime check instead of an unchecked `as` cast.
export const s3StreamBody = (body: unknown): Readable => {
  if (!(body instanceof Readable)) {
    throw new StatusError(502, 'S3 GetObject returned a non-stream body')
  }
  return body
}

const ENCRYPT_MARKER = Buffer.from('/Encrypt')

// Rejects a PDF containing the /Encrypt marker. Keeps a small overlap so a marker split
// across a chunk boundary is still found.
const rejectEncryptedPDF = (): Transform => {
  const overlap = ENCRYPT_MARKER.length - 1
  let tail = Buffer.alloc(0)
  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      const buf = Buffer.concat([tail, chunk])
      if (buf.includes(ENCRYPT_MARKER)) {
        callback(new StatusError(415, 'Encrypted PDF files not allowed'))
        return
      }
      tail = buf.subarray(Math.max(0, buf.length - overlap))
      callback(null, chunk)
    }
  })
}

const deleteFromStorage = async (key: string): Promise<void> => {
  await s3Client.send(new DeleteObjectCommand({ Bucket: config.cloudStorage.bucket, Key: key }))
}

// Streams the upload straight to the storage bucket. The stored file has the object key as
// its filename and the object URL as its path.
const streamUploadToStorage = async (file: MulterFile): Promise<Partial<MulterFile>> => {
  const { name, ext } = path.parse(file.originalname)
  const key = `${name.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}${ext}`
  const stream = file.stream as Readable & { truncated?: boolean }
  let size = 0
  const transforms = [
    new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        size += chunk.length
        callback(null, chunk)
      },
      // Fail before the body ends so a truncated file is never completed in S3.
      flush(callback) {
        callback(stream.truncated ? new Error('Upload exceeds the file size limit') : null)
      }
    })
  ]
  if (file.mimetype === 'application/pdf') {
    transforms.push(rejectEncryptedPDF())
  }
  const body = new PassThrough()
  const upload = new Upload({
    client: s3Client,
    params: { Bucket: config.cloudStorage.bucket, Key: key, Body: body }
  })
  try {
    const [, output] = await Promise.all([pipeline([stream, ...transforms, body]), upload.done()])
    return { filename: key, path: output.Location, size }
  } catch (err) {
    // The SDK doesn't destroy its body, so a failed upload would leave the pipeline waiting.
    body.destroy()
    await upload.abort()
    throw err
  }
}

const storage: StorageEngine = {
  async _handleFile(_req, file, callback) {
    let stored: Partial<MulterFile>
    try {
      stored = await streamUploadToStorage(file)
    } catch (err) {
      callback(err)
      return
    }
    callback(null, stored)
  },
  async _removeFile(_req, file, callback) {
    try {
      await deleteFromStorage(file.filename)
    } catch (err) {
      callback(err as Error)
      return
    }
    callback(null)
  }
}

const upload: Multer = multer({
  storage: storage,
  limits: { fileSize: Number(process.env.FILE_SIZE_LIMIT) },
  preservePath: true
}) // provide the return value from

const attachmentDetailsSchema = jsonFieldSchema.pipe(
  z.object({
    default: z.boolean(),
    kind: z.enum(['subtitles', 'captions', 'descriptions', 'chapters', 'metadata']),
    label: z.string(),
    srclang: z.string()
  })
)

const fileDetailsSchema = jsonFieldSchema.pipe(
  z.object({
    displayName: z.object({
      fi: z.string().nullish(),
      sv: z.string().nullish(),
      en: z.string().nullish()
    }),
    language: z.string(),
    priority: z.number().int()
  })
)
type FileDetails = z.infer<typeof fileDetailsSchema>

export const uploadAttachmentToMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contentType = req.headers['content-type']
    if (!contentType) {
      return next(new StatusError(400, 'Missing content-type header'))
    }

    const materialId = z.string().optional().parse(req.params.materialId)
    if (!materialId) {
      return next(new StatusError(400, 'Missing materialId req param'))
    }

    if (!contentType.startsWith('multipart/form-data')) {
      return next(new StatusError(400, 'Wrong contentType'))
    }
    const file = await uploadFileToBucket(req, res, 'attachment')
    if (!file) {
      return next(new StatusError(400, 'No file sent'))
    }
    // The details come after the file in the form, so they can only be checked once it's stored.
    const parsedDetails = attachmentDetailsSchema.safeParse(req.body.attachmentDetails)
    if (!parsedDetails.success) {
      await deleteFromStorage(file.filename)
      return next(new StatusError(400, 'Invalid attachmentDetails'))
    }
    try {
      const attachmentId = await insertDataToAttachmentTable(file, materialId, parsedDetails.data)
      res.status(200).json({ id: attachmentId })
    } catch (err) {
      await deleteFromStorage(file.filename)
      throw err
    }
  } catch (err) {
    log.error('Attachment upload failed', err)
    return next(
      err instanceof StatusError ? err : new StatusError(500, 'Failure in file upload', err)
    )
  }
}

export const uploadMaterial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contentType = req.headers['content-type']
    if (!contentType) {
      return next(new StatusError(400, 'Missing content-type header'))
    }

    log.debug(req.body)
    if (!contentType.startsWith('multipart/form-data')) {
      return next(new StatusError(400, 'Wrong contentType'))
    }
    upload.single('file')(req, res, async (err: any) => {
      try {
        if (err) {
          log.debug(err)
          if (err.code === 'LIMIT_FILE_SIZE') {
            next(new StatusError(413, err.message))
          } else if (err instanceof StatusError) {
            next(err)
          } else {
            next(new StatusError(500, 'Error in upload', err))
          }
          return
        }
        const resp: any = {}

        // Send educationalmaterialid if no file send for link material creation.
        if (!req.file) {
          await db
            .tx(async (t: any) => {
              const id = await insertDataToEducationalMaterialTable(req, t)
              if (req.body.name) {
                await insertEducationalMaterialName(JSON.parse(req.body.name), id.id, t)
              }
              return id
            })
            .then((data: any) => {
              resp.id = data.id
              return res.status(200).json(resp)
            })
            .catch((err: Error) => {
              next(new StatusError(500, 'Error in upload', err))
            })
        } else {
          // Only the Playwright seed is known to upload through v1; remove this branch if this never fires.
          log.error('Legacy v1 material upload with a file', {
            originalname: req.file.originalname
          })
          const file: MulterFile = req.file
          let materialid: string
          const fileDetails = fileDetailsSchema.parse(req.body.fileDetails)
          const material: any = []
          db.tx(async (t: ITask<IClient>) => {
            const emresp = await insertDataToEducationalMaterialTable(req, t)
            const id = await insertDataToMaterialTable(
              t,
              emresp.id,
              '',
              fileDetails.language,
              fileDetails.priority
            )
            material.push({ id: id.id, createFrom: file.originalname })
            materialid = id.id
            await insertDataToDisplayName(t, emresp.id, id.id, fileDetails)
            return emresp
          })
            .then(async (data: any) => {
              // return 200 if success and continue sending files to pouta
              resp.id = data.id
              resp.material = material
              res.status(200).json(resp)
              try {
                if (typeof file !== 'undefined') {
                  log.debug(materialid)
                  const recordid = await insertDataToRecordTable(
                    file,
                    materialid,
                    file.filename,
                    config.cloudStorage.bucket,
                    file.path
                  )
                  await extractUploadedPreview(file, recordid, file.filename)

                  // convert file to pdf if office document
                  try {
                    if (isOfficeMimeType(file.mimetype) && recordid) {
                      log.debug('Convert file and send to allas')
                      await convertOfficeFileToStoredPDF(file.filename, recordid)
                    }
                  } catch (e) {
                    log.debug('ERROR converting office file to pdf')
                    log.error(e)
                  }
                }
              } catch (err) {
                log.debug(`error while sending file to pouta: ${JSON.stringify((<any>req).file)}`)
                log.error(err)
              }
            })
            .catch((err: Error) => {
              if (!res.headersSent) {
                next(new StatusError(500, `Error in upload: ${err}`))
              }
            })
        }
      } catch (err) {
        if (!res.headersSent) {
          next(new StatusError(500, `Error in upload`, err))
        }
      }
    })
  } catch (err) {
    next(new StatusError(500, `Error in upload`, err))
  }
}

const uploadFileToBucket = (
  req: Request,
  res: Response,
  field: string
): Promise<MulterFile | undefined> =>
  new Promise((resolve, reject): void => {
    upload.single(field)(req, res, (err: any): void => {
      if (!err) {
        resolve(req.file)
      } else if (err.code === 'LIMIT_FILE_SIZE') {
        reject(new StatusError(413, `MULTER error`, err))
      } else if (err instanceof StatusError) {
        reject(err)
      } else {
        reject(new StatusError(500, `MULTER error`, err))
      }
    })
  })

// Upload a single file to the educational material with a multipart form upload.
// Create and save a PDF version from the office file formats, such as Excel, Word and PowerPoint.
// The upload has already succeeded and the scheduled conversion retries, so a failure is only logged.
const convertOfficeFileAfterResponse = async (key: string, recordID: string): Promise<void> => {
  try {
    await convertOfficeFileToStoredPDF(key, recordID)
  } catch (err) {
    log.error('Office file conversion failed after the response was sent', err)
  }
}

export const uploadFileToMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsedId = idParamSchema.safeParse(req.params.edumaterialid)
  if (!parsedId.success) {
    throw new StatusError(400, 'Invalid edumaterialid req param')
  }
  const edumaterialid = parsedId.data
  const file = await uploadFileToBucket(req, res, 'file')
  if (!file) {
    throw new StatusError(400, 'No file sent')
  }
  const parsedDetails = fileDetailsSchema.safeParse(req.body.fileDetails)
  if (!parsedDetails.success) {
    await deleteFromStorage(file.filename)
    throw new StatusError(400, 'Invalid fileDetails')
  }
  const fileDetails = parsedDetails.data

  let material: Material
  let recordID: string
  let t: Transaction
  t = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED // SERIALIZABLE,
  })
  try {
    // Save the general information of a new material entry.
    // Create a material in a separate transaction before using the returning material ID to avoid concurrency issues.
    material = await Material.create(
      {
        link: '',
        educationalMaterialId: edumaterialid,
        obsoleted: 0,
        priority: fileDetails.priority,
        materialLanguageKey: fileDetails.language
      },
      {
        transaction: t
      }
    )
    // Save the material display name with language versions.
    await upsertMaterialDisplayName(t, material.id, fileDetails)

    recordID = await upsertRecord(
      t,
      file,
      material.id,
      file.filename,
      config.cloudStorage.bucket,
      file.path
    )
    await t.commit()
  } catch (err: any) {
    log.error('Transaction for the single file upload failed', err)
    await t.rollback()
    await deleteFromStorage(file.filename)
    throw new StatusError(500, `Transaction for the single file upload failed`, err)
  }
  try {
    // Wait for H5P extraction so an invalid package is rejected with 400 before responding.
    // A failed ZIP preview doesn't fail the upload: the file preview backfill retries it.
    if (previewKindOf(file.originalname, file.mimetype) === 'h5p') {
      await extractFilePreview(
        db,
        s3Client,
        { id: recordID, filekey: file.filename, kind: 'h5p' },
        config.cloudStorage.bucket,
        config.cloudStorage.bucketUploadedMaterials,
        new AbortController().signal
      )
    } else {
      await extractUploadedPreview(file, recordID, file.filename)
    }
    res.status(200).json({
      id: edumaterialid,
      material: [
        {
          id: material.id,
          createFrom: file.originalname,
          educationalmaterialid: edumaterialid
        }
      ]
    })
    if (isOfficeMimeType(file.mimetype)) {
      await convertOfficeFileAfterResponse(file.filename, recordID)
    }
  } catch (err) {
    await Material.update(
      { obsoleted: 1 },
      {
        where: {
          id: material.id
        }
      }
    )
    if (err instanceof InvalidArchiveError) {
      try {
        await deleteFromStorage(file.filename)
      } catch (deleteError) {
        log.error(`Deleting rejected archive ${file.filename} failed`, deleteError)
      }
      next(new StatusError(400, err.message, err))
    } else {
      next(new StatusError(500, 'File upstreaming failed', err))
    }
  }
}

async function extractUploadedPreview(
  file: MulterFile,
  recordId: string | null,
  fileKey: string | undefined
): Promise<void> {
  const kind = previewKindOf(file.originalname, file.mimetype)
  if (!recordId || !fileKey || !kind) {
    return
  }
  try {
    await extractFilePreview(
      db,
      s3Client,
      { id: recordId, filekey: fileKey, kind },
      config.cloudStorage.bucket,
      config.cloudStorage.bucketUploadedMaterials,
      // Never aborted: extraction keeps going if the client disconnects.
      new AbortController().signal
    )
  } catch (err) {
    log.error(`File preview extraction failed for uploaded record ${recordId}`, err, {
      sourceBucket: config.cloudStorage.bucket,
      sourceKey: fileKey
    })
  }
}

const insertDataToEducationalMaterialTable = async (
  req: Request,
  t: ITask<IClient>
): Promise<{ id: string }> => {
  const uid = req.session?.passport?.user.uid
  if (!uid) {
    log.error('insertDataToEducationalMaterialTable missing uid in reques')
    throw new Error('Missing uid!')
  }
  return await t.one<{ id: string }>(
    `
    INSERT INTO educationalmaterial (usersusername)
    VALUES ($1)
    RETURNING id
  `,
    [uid]
  )
}

// Update or insert a material display name with the language versions (if available) and attach to a transaction.
// A new implementation of insertDataToDisplayName() below.
const upsertMaterialDisplayName = async (
  t: Transaction,
  materialId: string,
  fileDetails: FileDetails
): Promise<void> => {
  // Define the languages we are interested in
  const languages = ['en', 'fi', 'sv']

  // Iterate over each language to perform find and upsert operations
  for (const language of languages) {
    // Find the existing material display name for the current language
    const materialDisplayName = await MaterialDisplayName.findOne({
      where: { language, materialId },
      transaction: t
    })

    // Determine the display name to use, falling back to the first available language if necessary
    const displayName =
      fileDetails.displayName[language] ||
      materialDisplayName?.displayName ||
      fileDetails.displayName.en ||
      fileDetails.displayName.fi ||
      fileDetails.displayName.sv

    // Perform the upsert operation for the current language
    await MaterialDisplayName.upsert(
      {
        id: materialDisplayName?.id,
        displayName,
        language,
        materialId: materialId || materialDisplayName?.materialId
      },
      {
        transaction: t
      }
    )
  }
}

// LEGACY IMPLEMENTATION. TODO: TO BE REMOVED
export async function insertDataToDisplayName(
  t: any,
  educationalmaterialid: string,
  materialid: string,
  fileDetails: any
) {
  if (fileDetails.displayName && materialid) {
    const languages = ['fi', 'sv', 'en']

    for (const lang of languages) {
      const displayName = getDisplayName(fileDetails.displayName, lang)
      await t.none(
        'INSERT INTO materialdisplayname (displayname, language, materialid) (SELECT $1,$2,$3 where $3 in (select id from material where educationalmaterialid = $4)) ON CONFLICT (language, materialid) DO UPDATE Set displayname = $1;',
        [displayName, lang, materialid, educationalmaterialid]
      )
    }
  }
}

function getDisplayName(displayNameObj: any, lang: string): string {
  return displayNameObj[lang] || displayNameObj.fi || displayNameObj.sv || displayNameObj.en || ''
}

const insertDataToMaterialTable = async (
  t: ITask<IClient>,
  eduMaterialId: string,
  location: any,
  languages: any,
  priority: number
) => {
  const query = `
    INSERT INTO material (link, educationalmaterialid, materiallanguagekey, priority)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `
  return await t.one(query, [location, eduMaterialId, languages, priority])
}

const insertDataToAttachmentTable = async (
  file: MulterFile,
  materialID: string,
  metadata: z.infer<typeof attachmentDetailsSchema>
): Promise<string> =>
  db.tx(async (t: ITask<IClient>) => {
    await t.none(
      `
        UPDATE educationalmaterial
        SET updatedat = NOW()
        WHERE id = (
          SELECT m.educationalmaterialid FROM material m WHERE m.id = $1
        )
      `,
      [materialID]
    )
    const row = await t.one(
      `
        INSERT INTO attachment (filePath, originalfilename, filesize, mimetype, fileKey, fileBucket, materialid, defaultfile, kind, label, srclang)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `,
      [
        file.path,
        file.originalname,
        file.size,
        file.mimetype,
        file.filename,
        config.cloudStorage.bucket,
        materialID,
        metadata.default,
        metadata.kind,
        metadata.label,
        metadata.srclang
      ]
    )
    return z.object({ id: z.string() }).parse(row).id
  })

const upsertRecord = async (
  t: Transaction,
  file: MulterFile,
  materialID: string,
  cloudKey?: string,
  cloudBucket?: string,
  cloudURI?: string,
  recordID?: string
): Promise<string> => {
  const material = await Material.findOne({
    where: { id: materialID },
    transaction: t
  })

  if (!material) {
    log.error('usperRecord: did not find material to upsert: ', materialID)
    throw new Error('Did not find material to upsert')
  }

  await EducationalMaterial.update(
    { updatedAt: sequelize.literal('CURRENT_TIMESTAMP') },
    {
      where: {
        id: material.educationalMaterialId
      },
      transaction: t
    }
  )
  const [record] = await Record.upsert(
    {
      id: recordID,
      filePath: cloudURI,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      materialId: materialID,
      fileKey: cloudKey,
      fileBucket: cloudBucket
    },
    {
      transaction: t
    }
  )
  return record.id
}

// Transaction to persist the metadata of a new file and update the corresponding educational material.
// Set the cloud related columns nullable: ALTER TABLE <table> ALTER COLUMN <column> DROP NOT NULL.
const insertDataToRecordTable = async (
  file: MulterFile,
  materialID: string,
  cloudKey?: string,
  cloudBucket?: string,
  cloudURI?: string,
  recordID?: string
): Promise<string | null> => {
  const { id } = await db.tx(async (t: any) => {
    await t.none(
      `
        UPDATE educationalmaterial SET updatedat = NOW()
        WHERE id = (
          SELECT educationalmaterialid
          FROM material
          WHERE id = $1
        )
      `,
      [materialID]
    )
    let columnSet: ColumnSet = new pgp.helpers.ColumnSet(
      [
        'filepath',
        'originalfilename',
        'filesize',
        'mimetype',
        'materialid',
        'filekey',
        'filebucket'
      ],
      { table: 'record' }
    )
    const values = {
      id: recordID ? recordID : undefined,
      filepath: cloudURI,
      originalfilename: file.originalname,
      filesize: file.size,
      mimetype: file.mimetype,
      materialid: materialID,
      filekey: cloudKey,
      filebucket: cloudBucket
    }
    if (recordID) {
      columnSet = columnSet.extend(['id'])
    }
    return await t.oneOrNone(`
        ${pgp.helpers.insert([values], columnSet)}
        ON CONFLICT (id) DO UPDATE SET
        filepath = EXCLUDED.filepath, filekey = EXCLUDED.filekey, filebucket = EXCLUDED.filebucket,
        preview_type = NULL
        RETURNING id
      `)
  })
  return id
}

// Upload a file from the local file system to the cloud object storage.
export const uploadFileToStorage = async (
  filePath: string,
  fileName: string,
  bucketName: string,
  materialMeta?: Material
): Promise<SendData> => {
  // Stream the local file straight into lib-storage's multipart Upload, which
  // accepts a Readable of unknown length. No PassThrough needed.
  const body = fs.createReadStream(filePath)
  let putObjectS3: PutObjectCommandInput = {
    Bucket: bucketName,
    Key: fileName,
    Body: body
  }
  if (materialMeta) {
    putObjectS3 = {
      ...putObjectS3,
      Metadata: {
        educationalMaterialID: materialMeta.educationalMaterialId,
        materialID: materialMeta.id
      }
    }
  }
  try {
    return await new Upload({ client: s3Client, params: putObjectS3 }).done()
  } catch (err) {
    log.error(`Upstream to the cloud storage failed in uploadFileToStorage(): ${fileName}`)
    throw err
  } finally {
    // Release the file descriptor whether the upload finished, failed, or aborted.
    body.destroy()
  }
}

// Upload an in-memory file buffer to the cloud object storage.
export async function uploadBase64FileToStorage(
  base64data: Buffer,
  filename: string,
  bucketName: string
): Promise<any> {
  try {
    const params = {
      Bucket: bucketName,
      Key: filename,
      Body: base64data
    }
    const startTime: number = Date.now()
    // Callers read Location/Key/Bucket off the result, so use lib-storage's Upload
    // (PutObjectCommandOutput does not expose those fields).
    const data = await new Upload({ client: s3Client, params }).done()
    log.debug(
      'Uploading file to the cloud object storage completed in ' +
        (Date.now() - startTime) / 1000 +
        's'
    )
    return data
  } catch (err) {
    log.error('Error in processing file in uploadBase64FileToStorage()', err)
    throw err
  }
}

export const downloadPreviewFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  log.debug('HTTP request headers present in downloadPreviewFile()', req.headers)
  try {
    await downloadFileFromStorage(req, res)
  } catch (err) {
    next(err instanceof StatusError ? err : new StatusError(400, 'Failed to download file', err))
  }
}

export const downloadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filename = req.params.filename

    if (!filename) {
      next(new StatusError(400, 'Missing request param filename'))
      return
    }

    const materialidQuery = 'SELECT materialid FROM record WHERE filekey = $1'
    const materialid = (await db.any(materialidQuery, [filename]))[0]

    if (!materialid) {
      res.status(404).end()
      return
    }

    const educationalmaterialidQuery =
      'SELECT educationalmaterialid FROM versioncomposition WHERE materialid = $1'
    const originalMaterialIdArr: {
      educationalmaterialid: string
    }[] = await db.any(educationalmaterialidQuery, [materialid.materialid])

    const originalMaterialId = originalMaterialIdArr?.[0]

    let educationalmaterialId = originalMaterialId
      ? parseInt(originalMaterialId.educationalmaterialid, 10)
      : parseInt(materialid.materialid, 10)

    // Pass educational material ID to the next function in request chain.
    res.locals.id = educationalmaterialId

    await downloadFileFromStorage(req, res)

    // A soft failure (e.g. NoSuchKey -> 404) already ended the response; don't
    // count it as a download or fall through to the analytics middleware, which
    // would otherwise overwrite the status with 200.
    if (res.statusCode >= 400) {
      return
    }

    // Increase download counter unless the user is the owner of the material.
    if (!req.isAuthenticated() || !(await hasAccesstoPublication(educationalmaterialId, req))) {
      try {
        await updateDownloadCounter(educationalmaterialId.toString())
      } catch (error) {
        log.error('Updating download counter failed:', error)
      }
    }
    next()
  } catch (err) {
    next(err instanceof StatusError ? err : new StatusError(400, 'downloadFile error', err))
  }
}

const RANGE_MIME_TYPES = ['audio/mp4', 'audio/mpeg', 'audio/x-m4a', 'video/mp4']
const RANGE_MIN_FILE_SIZE = 100_000

const rangeHeaderSchema = z
  .string()
  .regex(/^bytes=\d+-\d*$/)
  .transform((header) => ({ header, start: parseInt(header.slice('bytes='.length), 10) }))

const getStorageFileDetails = async (
  fileName: string
): Promise<{ originalfilename: string; filesize: number; mimetype: string }> => {
  const query = `
    SELECT originalfilename, filesize, mimetype
    FROM record
    RIGHT JOIN material AS m ON m.id = materialid
    WHERE m.obsoleted = 0 AND filekey = $1
    UNION
    SELECT originalfilename, filesize, mimetype
    FROM attachment
    WHERE filekey = $1 AND obsoleted = 0
    LIMIT 1
  `
  const fileDetailsSchema = z.object({
    originalfilename: z.string(),
    filesize: z.coerce.number(),
    mimetype: z.string()
  })
  const row = await db.oneOrNone(query, [fileName])
  if (!row) {
    throw new StatusError(404, `Requested file ${fileName} not found.`)
  }
  const parsed = fileDetailsSchema.safeParse(row)
  if (!parsed.success) {
    throw new StatusError(
      500,
      `Unexpected file record for filekey=${fileName}: ${parsed.error.message}`
    )
  }
  return parsed.data
}

const downloadFileFromStorage = async (req: Request, res: Response): Promise<void> => {
  const fileName = z.string().min(1).parse(req.params.filename)
  const fileDetails = await getStorageFileDetails(fileName)
  const rangeAllowed =
    RANGE_MIME_TYPES.includes(fileDetails.mimetype) && fileDetails.filesize >= RANGE_MIN_FILE_SIZE
  const range = rangeAllowed ? rangeHeaderSchema.safeParse(req.headers.range).data : undefined
  if (range && range.start >= fileDetails.filesize) {
    res.status(416).set('Content-Range', `bytes */${fileDetails.filesize}`).end()
    return
  }
  const params: StorageObjectParams = {
    Bucket: config.cloudStorage.bucket,
    Key: fileName,
    ...(range && { Range: range.header })
  }
  await downloadFromStorage(res, params, fileDetails.originalfilename)
}

/**
 * @deprecated Legacy EFS ZIP preview fallback. Remove once every ZIP has a successful `file_preview` row.
 */
export const downloadAndExtractZip = async (
  res: Response,
  fileName: string
): Promise<string | false> => {
  const paramsS3 = { Bucket: config.cloudStorage.bucket, Key: fileName }
  const extractedFolder = extractionFolderOf(fileName)
  const temporaryFolder = `${extractedFolder}.tmp-${randomUUID()}`
  const archivePath = `${temporaryFolder}.zip`
  const { controller, dispose } = abortOnClientClose(res)
  try {
    try {
      const output = await s3Client.send(new GetObjectCommand(paramsS3), {
        abortSignal: controller.signal
      })
      await pipeline(s3StreamBody(output.Body), fs.createWriteStream(archivePath))
    } catch (err) {
      if (controller.signal.aborted || isClientAbortError(err)) {
        return false
      }
      if (err instanceof Error && err.name === 'NoSuchKey') {
        throw new StatusError(404, missingStorageObjectMessage(paramsS3))
      }
      throw new StatusError(500, `Download of [${fileName}] failed in downloadAndExtractZip()`, err)
    } finally {
      dispose()
    }
    return await unZipAndExtract(archivePath, temporaryFolder, extractedFolder)
  } finally {
    await rm(archivePath, { force: true })
  }
}

// The exact message both storage-download paths log when a DB record's backing
// object is missing from S3. Kept identical so log-based alerting matches either
// path.
const missingStorageObjectMessage = (paramsS3: { Bucket: string; Key: string }): string =>
  `Storage object missing though record exists: bucket=${paramsS3.Bucket} key=${paramsS3.Key}`

export type TemporaryFile = { directory: string; file: string }

// Download a single storage object to a unique, request-owned temporary file named
// fileName and return its path. Streams straight to disk (no in-memory buffer), so large
// archives don't have to fit in RAM. The directory is created with mkdtemp, so
// concurrent callers never collide, and is removed on error. Pass an AbortSignal
// to cancel the request (and release the socket) when the client disconnects.
export const downloadToTemporaryFile = async (
  paramsS3: {
    Bucket: string
    Key: string
  },
  fileName: string,
  abortSignal?: AbortSignal
): Promise<TemporaryFile> => {
  // Create the temp directory before issuing the S3 request so there is no async
  // gap between acquiring the response Body and the pipeline that consumes it;
  // otherwise a throw here would leak the Body's socket.
  const directory = await mkdtemp(path.join(os.tmpdir(), 'aoe-'))
  const file = path.join(directory, fileName)
  try {
    let body: Readable
    try {
      // v3 rejects send() on missing-key/access errors before returning a Body.
      body = s3StreamBody(
        (await s3Client.send(new GetObjectCommand(paramsS3), { abortSignal })).Body
      )
    } catch (err) {
      if (err instanceof Error && err.name === 'NoSuchKey') {
        // Record exists (caller checked) but object is gone; the caller
        // logs and pages on-call.
        throw new StatusError(404, missingStorageObjectMessage(paramsS3))
      }
      throw err
    }
    await pipeline(body, fs.createWriteStream(file), { signal: abortSignal })
    return { directory, file }
  } catch (err) {
    await rm(directory, { recursive: true, force: true })
    throw err
  }
}

const STORAGE_IDLE_TIMEOUT_MS = 60_000

// Stream a storage object to the client as an attachment, or as 206 Partial Content
// when paramsS3.Range is set.
export const downloadFromStorage = async (
  res: Response,
  paramsS3: StorageObjectParams,
  origFilename: string
): Promise<void> => {
  const key: string = paramsS3.Key
  const { controller, dispose } = abortOnClientClose(res)
  let idleTimer: NodeJS.Timeout | undefined
  try {
    const output = await s3Client.send(new GetObjectCommand(paramsS3), {
      abortSignal: controller.signal
    })
    const fileStream = s3StreamBody(output.Body)
    res.attachment(origFilename || key)
    if (output.ContentRange) {
      res.status(206).set({
        'Content-Range': output.ContentRange,
        'Accept-Ranges': 'bytes',
        // Stops compression() from gzipping the range of a compressible file type.
        'Cache-Control': 'no-transform',
        ...(output.ContentLength !== undefined && {
          'Content-Length': String(output.ContentLength)
        }),
        ...(output.ETag && { ETag: output.ETag }),
        ...(output.LastModified && { 'Last-Modified': output.LastModified.toUTCString() })
      })
    }
    // Express routes HEAD to this GET handler and drops the body, so don't stream it.
    if (res.req.method === 'HEAD') {
      fileStream.destroy()
      res.end()
      return
    }
    idleTimer = setTimeout(() => {
      const message = `Storage download idle for ${STORAGE_IDLE_TIMEOUT_MS} ms, aborting: key=${key} range=${paramsS3.Range ?? 'none'}`
      if (res.writableNeedDrain) {
        log.warn(`${message}, client stopped reading`)
      } else {
        log.error(`${message}, storage stopped sending`)
      }
      controller.abort()
    }, STORAGE_IDLE_TIMEOUT_MS)
    const idleWatch = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        idleTimer?.refresh()
        callback(null, chunk)
      }
    })
    await pipeline(fileStream, idleWatch, res)
  } catch (err) {
    if (controller.signal.aborted || isClientAbortError(err)) {
      return
    }
    if (err instanceof Error && err.name === 'NoSuchKey') {
      log.warn(missingStorageObjectMessage(paramsS3))
      if (!res.headersSent) {
        res.status(404).end()
      }
      return
    }
    throw new StatusError(500, `Download of [${key}] failed in downloadFromStorage()`, err)
  } finally {
    clearTimeout(idleTimer)
    dispose()
  }
}

// Download all files related to an educational material as a bundled ZIP file.
export const downloadAllMaterialsCompressed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsedId = idParamSchema.safeParse(req.params.edumaterialid)
  if (!parsedId.success) {
    return next(new StatusError(400, 'Invalid edumaterialid req param'))
  }
  const edumaterialid = parsedId.data

  // Queries to resolve files of the latest educational material version requested.
  const queryLatestPublished = `
    SELECT MAX(publishedat) AS max
    FROM versioncomposition
    WHERE educationalmaterialid = $1
  `
  const queryVersionFilesIds = `
    SELECT r.filekey, r.originalfilename
    FROM versioncomposition vc
    RIGHT JOIN material m ON m.id = vc.materialid
    RIGHT JOIN record r ON r.materialid = m.id
    WHERE m.educationalmaterialid = $1 AND m.obsoleted = 0 AND vc.publishedat = $2
    UNION
    SELECT a.filekey, a.originalfilename
    FROM attachmentversioncomposition avc
    INNER JOIN attachment a ON a.id = avc.attachmentid
    WHERE avc.versioneducationalmaterialid = $1 AND avc.versionpublishedat = $2 AND a.obsoleted = 0
  `
  const versionFiles: StorageFile[] = await db.task(async (t: any): Promise<any[]> => {
    let publishedAt = req.params.publishedat
    if (!publishedAt) {
      const latestPublished: { max: string } = await t.oneOrNone(
        queryLatestPublished,
        edumaterialid
      )
      publishedAt = latestPublished.max
    }
    return await t.any(queryVersionFilesIds, [edumaterialid, publishedAt])
  })
  res.header('Content-Disposition', 'attachment; filename=materials.zip')
  if (res.destroyed) {
    return
  }
  // Downstream files from the object storage and zip the bundle.
  try {
    await downloadAndZipFromStorage(res, versionFiles)
  } catch (err) {
    if (isClientAbortError(err)) {
      return
    }
    throw err
  }
  // Update the download counter.
  const educationalMaterialId: number = edumaterialid
  if (!req.isAuthenticated() || !(await hasAccesstoPublication(educationalMaterialId, req))) {
    try {
      await updateDownloadCounter(educationalMaterialId.toString())
    } catch (err) {
      log.error('Updating download counter failed', err)
    }
  }
}

const waitForStorageBody = async (body: Readable, filekey: string): Promise<void> => {
  try {
    await finished(body, { cleanup: true })
  } catch (err) {
    throw new StatusError(502, `Storage download of [${filekey}] failed`, err)
  }
}

const appendStorageFile = async (
  archive: ZipArchive,
  { filekey, originalfilename }: StorageFile,
  signal: AbortSignal
): Promise<void> => {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: config.cloudStorage.bucket, Key: filekey }),
    { abortSignal: signal }
  )
  const body = s3StreamBody(response.Body)
  // Archiver does not forward source errors. Watch for errors and premature
  // closure, and keep storage failures distinct from client disconnects.
  const bodyFinished = waitForStorageBody(body, filekey)
  try {
    const entryWritten = once(archive, 'entry', { signal })
    archive.append(body, { name: originalfilename })
    await Promise.all([entryWritten, bodyFinished])
  } finally {
    // On cancellation, retain the error listener until the body has closed.
    body.destroy()
    // Wait for cleanup without replacing the error propagated by Promise.all.
    await Promise.allSettled([bodyFinished])
  }
}

// Stream the files from the object storage one at a time into a zip written to res.
const downloadAndZipFromStorage = async (res: Response, files: StorageFile[]): Promise<void> => {
  const { controller, dispose } = abortOnClientClose(res)
  // Materials are mostly already-compressed (mp4, pptx, pdf), so deflate only burns CPU.
  const archive = new ZipArchive({ store: true })
  const output = pipeline(archive, res)
  const outputSettled = Promise.allSettled([output])
  try {
    for (const file of files) {
      await appendStorageFile(archive, file, controller.signal)
    }
    await archive.finalize()
    await output
  } catch (err) {
    controller.abort()
    archive.destroy(err as Error)
    await outputSettled
    throw err
  } finally {
    dispose()
  }
}

/**
 * A concurrent request may have renamed its extraction into place first; its copy is kept.
 * @deprecated Legacy EFS ZIP preview fallback. Remove once every ZIP has a successful `file_preview` row.
 */
const moveIntoPlace = async (temporaryFolder: string, extractedFolder: string): Promise<void> => {
  try {
    await rename(temporaryFolder, extractedFolder)
  } catch (err) {
    if (!fs.existsSync(extractedFolder)) {
      throw err
    }
    await rm(temporaryFolder, { recursive: true, force: true })
  }
}

/**
 * @deprecated Legacy EFS ZIP preview fallback. Remove once every ZIP has a successful `file_preview` row.
 */
const unZipAndExtract = async (
  zipFilePath: string,
  temporaryFolder: string,
  extractedFolder: string
): Promise<string | false> => {
  try {
    fs.mkdirSync(temporaryFolder, { recursive: true })
    const zip = new StreamZip.async({ file: zipFilePath })
    // Extracted into a request-owned folder first, so findExistingPreviewEntry never
    // picks up a partial or concurrent extraction.
    try {
      await zip.extract(null, temporaryFolder)
    } finally {
      await zip.close()
    }
    await moveIntoPlace(temporaryFolder, extractedFolder)
    return findPreviewEntry(extractedFolder)
  } catch (err) {
    await rm(temporaryFolder, { recursive: true, force: true })
    log.debug('Decompression of a HTML archive in unzipAndExtract() failed', err)
    return false
  }
}
