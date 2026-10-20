import { GetObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3'
import * as log from '@util/winstonLogger'
import mime from 'mime'
import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, mkdtemp, rm, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import StreamZip from 'node-stream-zip'
import type { IDatabase } from 'pg-promise'

export type H5pUpload = { id: string; filebucket: string; filekey: string }

export type H5pExtractionResult = { selected: number; processed: number; failed: number }

const MAX_EXTRACTED_BYTES = 5 * 1024 ** 3
const MAX_EXTRACTED_ENTRIES = 100_000

const uploadExtractedArchive = async (
  upload: H5pUpload,
  s3: S3Client,
  destinationBucket: string,
  signal: AbortSignal
): Promise<string> => {
  signal.throwIfAborted()
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'aoe-h5p-'))
  try {
    const archivePath = path.join(temporaryDirectory, 'upload.h5p')
    const extractedDirectory = path.join(temporaryDirectory, 'extracted')
    const { Body } = await s3.send(
      new GetObjectCommand({ Bucket: upload.filebucket, Key: upload.filekey }),
      { abortSignal: signal }
    )
    if (!(Body instanceof Readable)) {
      throw new Error('H5P download returned a non-stream body')
    }
    await pipeline(Body, createWriteStream(archivePath), { signal })
    await mkdir(extractedDirectory)

    const zip = new StreamZip.async({ file: archivePath })
    let entries: StreamZip.ZipEntry[]
    try {
      entries = Object.values(await zip.entries())
      signal.throwIfAborted()
      if (entries.length > MAX_EXTRACTED_ENTRIES) {
        throw new Error(`H5P archive exceeds the ${MAX_EXTRACTED_ENTRIES}-entry extraction limit`)
      }
      const declaredBytes = entries.reduce((total, entry) => total + entry.size, 0)
      if (!Number.isSafeInteger(declaredBytes) || declaredBytes > MAX_EXTRACTED_BYTES) {
        throw new Error(`H5P archive exceeds the ${MAX_EXTRACTED_BYTES}-byte extraction limit`)
      }
      let extractedBytes = 0
      for (const entry of entries) {
        if (!entry.isFile) {
          continue
        }
        const filePath = path.join(extractedDirectory, path.posix.normalize(entry.name))
        await mkdir(path.dirname(filePath), { recursive: true })
        await pipeline(
          await zip.stream(entry.name),
          new Transform({
            transform(chunk, _encoding, callback) {
              extractedBytes += chunk.length
              if (extractedBytes > MAX_EXTRACTED_BYTES) {
                callback(
                  new Error(`H5P archive exceeds the ${MAX_EXTRACTED_BYTES}-byte extraction limit`)
                )
                return
              }
              callback(null, chunk)
            }
          }),
          createWriteStream(filePath),
          { signal }
        )
      }
    } finally {
      await zip.close()
    }
    // Require package metadata at the root, without rejecting packages whose
    // playback libraries are incomplete: extraction and previewability are separate.
    if (!(await stat(path.join(extractedDirectory, 'h5p.json'))).isFile()) {
      throw new Error('H5P archive has no root h5p.json file')
    }

    const sourceHash = createHash('sha256')
      .update(JSON.stringify([upload.filebucket, upload.filekey]))
      .digest('hex')
    const prefix = `files/${upload.id}/${sourceHash}/`
    for (const entry of entries) {
      if (!entry.isFile) {
        continue
      }
      const relativePath = path.posix.normalize(entry.name)
      const body = createReadStream(path.join(extractedDirectory, relativePath))
      try {
        signal.throwIfAborted()
        await s3.send(
          new PutObjectCommand({
            Bucket: destinationBucket,
            Key: `${prefix}${relativePath}`,
            Body: body,
            ContentLength: entry.size,
            ContentType: mime.getType(relativePath) ?? 'application/octet-stream'
          }),
          { abortSignal: signal }
        )
      } finally {
        body.destroy()
      }
    }
    return prefix
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
}

export const extractH5pUpload = async (
  database: Pick<IDatabase<unknown>, 'none'>,
  s3: S3Client,
  upload: H5pUpload,
  destinationBucket: string,
  signal: AbortSignal
): Promise<string> => {
  const prefix = await uploadExtractedArchive(upload, s3, destinationBucket, signal)
  signal.throwIfAborted()
  await database.none(
    `INSERT INTO h5p_extraction (record_id, source_file_key, s3_object_prefix)
     VALUES ($1, $2, $3)
     ON CONFLICT (record_id, source_file_key) DO NOTHING`,
    [upload.id, upload.filekey, prefix]
  )
  log.info(`H5P extraction completed for record ${upload.id}`, {
    sourceBucket: upload.filebucket,
    sourceKey: upload.filekey,
    destinationBucket,
    prefix
  })
  return prefix
}

export const extractH5pUploads = async (
  database: Pick<IDatabase<unknown>, 'any' | 'none'>,
  s3: S3Client,
  destinationBucket: string,
  signal: AbortSignal
): Promise<H5pExtractionResult> => {
  signal.throwIfAborted()
  const uploads = await database.any<H5pUpload>(`
    SELECT r.id, r.filebucket, r.filekey
    FROM record r
    WHERE lower(r.originalfilename) LIKE '%.h5p'
      AND r.filebucket IS NOT NULL
      AND r.filekey IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM h5p_extraction e
        WHERE e.record_id = r.id AND e.source_file_key = r.filekey
      )
    ORDER BY random()
    LIMIT 2
  `)
  const result: H5pExtractionResult = { selected: uploads.length, processed: 0, failed: 0 }
  for (const upload of uploads) {
    signal.throwIfAborted()
    try {
      await extractH5pUpload(database, s3, upload, destinationBucket, signal)
      result.processed++
    } catch (error) {
      result.failed++
      log.error(`H5P extraction failed for record ${upload.id}`, error, {
        sourceBucket: upload.filebucket,
        sourceKey: upload.filekey
      })
      signal.throwIfAborted()
    }
  }
  return result
}
