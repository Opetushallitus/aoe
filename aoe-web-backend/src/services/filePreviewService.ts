import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  type S3Client
} from '@aws-sdk/client-s3'
import * as log from '@util/winstonLogger'
import { type Entry, type FileEntry, Reader, ZipReader } from '@zip.js/zip.js'
import mime from 'mime'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { PassThrough, Readable, Writable } from 'node:stream'
import type { ReadableStream } from 'node:stream/web'
import type { IDatabase } from 'pg-promise'
import { z } from 'zod'

const previewKindSchema = z.enum(['h5p', 'html-zip'])
export type PreviewKind = z.infer<typeof previewKindSchema>

const previewUploadSchema = z.object({
  id: z.string(),
  filekey: z.string(),
  kind: previewKindSchema
})
export type PreviewUpload = z.infer<typeof previewUploadSchema>

const ZIP_MIME_TYPES = ['application/zip', 'application/x-zip-compressed']

// The extension wins, so an .h5p sent as application/zip is still validated as H5P.
// Mirrored by ZIP_UPLOAD_SQL for the backfill.
export const previewKindOf = (originalName: string, mimetype: string): PreviewKind | null => {
  if (path.extname(originalName).toLowerCase() === '.h5p') {
    return 'h5p'
  }
  return ZIP_MIME_TYPES.includes(mimetype) ? 'html-zip' : null
}

// H5P packages were already backfilled by the earlier H5P extraction job.
const ZIP_UPLOAD_SQL = `
  r.mimetype IN ('application/zip', 'application/x-zip-compressed')
  AND lower(r.originalfilename) NOT LIKE '%.h5p'`

const MAX_EXTRACTED_BYTES = 5 * 1024 ** 3
const MAX_EXTRACTED_ENTRIES = 100_000

// The archive itself is unacceptable, as opposed to an S3 or disk failure.
export class InvalidArchiveError extends Error {}

// Storage failed while reading the archive, as opposed to the archive being invalid.
class ArchiveReadError extends Error {}

// Reads the archive with ranged GETs, so it never touches local disk.
class S3RangeReader extends Reader<string> {
  private readonly s3: S3Client
  private readonly bucket: string
  private readonly key: string
  private readonly signal: AbortSignal

  constructor(s3: S3Client, bucket: string, key: string, signal: AbortSignal) {
    super(key)
    this.s3 = s3
    this.bucket = bucket
    this.key = key
    this.signal = signal
  }

  async init(): Promise<void> {
    try {
      const { ContentLength } = await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: this.key }),
        { abortSignal: this.signal }
      )
      this.size = z.number().parse(ContentLength)
    } catch (error) {
      throw new ArchiveReadError('Archive size read failed', { cause: error })
    }
  }

  private async range(offset: number, size: number): Promise<Readable> {
    const { Body } = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: this.key,
        Range: `bytes=${offset}-${offset + size - 1}`
      }),
      { abortSignal: this.signal }
    )
    if (!(Body instanceof Readable)) {
      throw new Error('Archive range read returned a non-stream body')
    }
    return Body
  }

  // An empty range would read the whole object.
  async readUint8Array(index: number, length: number): Promise<Uint8Array> {
    if (length === 0) {
      return new Uint8Array()
    }
    try {
      const body = await this.range(index, length)
      return Buffer.concat(await body.toArray())
    } catch (error) {
      throw new ArchiveReadError('Archive range read failed', { cause: error })
    }
  }

  // One GET per entry instead of one per 256 KiB chunk.
  createReadable({ offset = 0, size = this.size - offset } = {}): ReadableStream<Uint8Array> {
    const range = (): Promise<Readable> =>
      size === 0 ? Promise.resolve(Readable.from([])) : this.range(offset, size)
    return Readable.toWeb(
      Readable.from(
        (async function* () {
          yield* await range()
        })()
      )
    )
  }
}

async function readZipEntries(zip: ZipReader<string>): Promise<Entry[]> {
  try {
    return await zip.getEntries()
  } catch (error) {
    if (error instanceof ArchiveReadError) {
      throw error
    }
    throw new InvalidArchiveError('Archive is not a valid ZIP file', { cause: error })
  }
}

// The first index.html, else the first index.htm, outside __MACOSX resource forks.
const previewEntryOf = (names: string[]): string | undefined => {
  const candidates = names.filter((name) => !name.split('/').includes('__MACOSX'))
  return (
    candidates.find((name) => path.posix.basename(name) === 'index.html') ??
    candidates.find((name) => path.posix.basename(name) === 'index.htm')
  )
}

export const uploadExtractedArchive = async (
  upload: PreviewUpload,
  s3: S3Client,
  sourceBucket: string,
  destinationBucket: string,
  signal: AbortSignal
): Promise<{ prefix: string; entryPath: string | null }> => {
  signal.throwIfAborted()
  const zip = new ZipReader(new S3RangeReader(s3, sourceBucket, upload.filekey, signal), {
    useWebWorkers: false
  })
  try {
    const allEntries = await readZipEntries(zip)
    const entries = allEntries.filter((entry): entry is FileEntry => !entry.directory)
    if (entries.length > MAX_EXTRACTED_ENTRIES) {
      throw new InvalidArchiveError(
        `Archive exceeds the ${MAX_EXTRACTED_ENTRIES}-entry extraction limit`
      )
    }
    const declaredBytes = entries.reduce((total, entry) => total + entry.uncompressedSize, 0)
    if (!Number.isSafeInteger(declaredBytes) || declaredBytes > MAX_EXTRACTED_BYTES) {
      throw new InvalidArchiveError(
        `Archive exceeds the ${MAX_EXTRACTED_BYTES}-byte extraction limit`
      )
    }
    // zip.js rejects absolute and `..` entry names.
    const names = entries.map((entry) => path.posix.normalize(entry.filename))
    let entryPath: string | null = null
    if (upload.kind === 'h5p') {
      // Require package metadata at the root, without rejecting packages whose
      // playback libraries are incomplete: extraction and previewability are separate.
      if (!names.includes('h5p.json')) {
        throw new InvalidArchiveError('H5P archive has no root h5p.json file')
      }
    } else {
      entryPath = previewEntryOf(names) ?? null
      if (!entryPath) {
        throw new InvalidArchiveError('ZIP archive has no index.html or index.htm')
      }
    }

    const sourceHash = createHash('sha256')
      .update(JSON.stringify([sourceBucket, upload.filekey]))
      .digest('hex')
    const prefix = `files/${upload.id}/${sourceHash}/`
    for (const [index, entry] of entries.entries()) {
      signal.throwIfAborted()
      const body = new PassThrough()
      // The SDK pipes the body without forwarding its errors, so a failed entry stream
      // must abort the upload or its socket waits for the rest of the body.
      const putAbort = new AbortController()
      try {
        await Promise.all([
          entry.getData(Writable.toWeb(body), { signal }),
          s3.send(
            new PutObjectCommand({
              Bucket: destinationBucket,
              Key: `${prefix}${names[index]}`,
              Body: body,
              ContentLength: entry.uncompressedSize,
              ContentType: mime.getType(names[index]) ?? 'application/octet-stream'
            }),
            { abortSignal: AbortSignal.any([signal, putAbort.signal]) }
          )
        ])
      } catch (error) {
        putAbort.abort()
        throw error
      } finally {
        body.destroy()
      }
    }
    return { prefix, entryPath }
  } finally {
    await zip.close()
  }
}

export const extractFilePreview = async (
  database: Pick<IDatabase<unknown>, 'none' | 'tx'>,
  s3: S3Client,
  upload: PreviewUpload,
  sourceBucket: string,
  destinationBucket: string,
  signal: AbortSignal
): Promise<void> => {
  try {
    const { prefix, entryPath } = await uploadExtractedArchive(
      upload,
      s3,
      sourceBucket,
      destinationBucket,
      signal
    )
    signal.throwIfAborted()
    await database.tx(async (t) => {
      await t.none(
        `INSERT INTO file_preview (record_id, source_file_key, s3_object_prefix, entry_path, success)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (record_id, source_file_key) DO UPDATE SET
           s3_object_prefix = EXCLUDED.s3_object_prefix,
           entry_path = EXCLUDED.entry_path,
           success = true,
           processed_at = current_timestamp`,
        [upload.id, upload.filekey, prefix, entryPath]
      )
      await t.none(`UPDATE record SET preview_type = $3 WHERE id = $1 AND filekey = $2`, [
        upload.id,
        upload.filekey,
        upload.kind
      ])
    })
    log.info(`File preview extraction completed for record ${upload.id}`, {
      kind: upload.kind,
      sourceBucket,
      sourceKey: upload.filekey,
      destinationBucket,
      prefix,
      entryPath
    })
  } catch (error) {
    if (upload.kind === 'html-zip' && error instanceof InvalidArchiveError) {
      // Not previewable, so it stays a download. Recorded as done so the backfill skips it.
      await database.none(
        `INSERT INTO file_preview (record_id, source_file_key, s3_object_prefix, entry_path, success)
         VALUES ($1, $2, NULL, NULL, true)
         ON CONFLICT (record_id, source_file_key) DO UPDATE SET
           s3_object_prefix = NULL,
           entry_path = NULL,
           success = true,
           processed_at = current_timestamp`,
        [upload.id, upload.filekey]
      )
      log.info(`ZIP upload for record ${upload.id} has no preview: ${error.message}`, {
        sourceKey: upload.filekey
      })
      return
    }
    try {
      await database.none(
        `INSERT INTO file_preview (record_id, source_file_key, success)
         VALUES ($1, $2, false)
         ON CONFLICT (record_id, source_file_key) DO UPDATE SET
           success = false,
           s3_object_prefix = NULL,
           entry_path = NULL,
           processed_at = current_timestamp
         WHERE NOT file_preview.success`,
        [upload.id, upload.filekey]
      )
    } catch (recordError) {
      log.error(`Failed to record file preview failure for record ${upload.id}`, recordError, {
        sourceKey: upload.filekey
      })
    }
    throw error
  }
}

export const extractFilePreviews = async (
  database: Pick<IDatabase<unknown>, 'any' | 'none' | 'tx'>,
  s3: S3Client,
  sourceBucket: string,
  destinationBucket: string,
  signal: AbortSignal
): Promise<void> => {
  signal.throwIfAborted()
  // Previews written by tasks running the previous code, which didn't set preview_type.
  // Only needed during the transition; removed in AOE-137 1c with the h5p_extraction view.
  await database.none(`
    UPDATE record r SET preview_type = 'h5p'
    FROM file_preview f
    WHERE r.preview_type IS NULL AND f.record_id = r.id AND f.source_file_key = r.filekey
      AND f.success AND f.s3_object_prefix IS NOT NULL AND f.entry_path IS NULL
      AND lower(r.originalfilename) LIKE '%.h5p'
  `)
  await database.none(`
    UPDATE record SET preview_type = 'office'
    WHERE preview_type IS NULL AND pdfkey = regexp_replace(filekey, '\\.[^.]*$', '') || '.pdf'
  `)
  const [counts] = await database.any<{ remaining: number; failed: number }>(`
    SELECT COUNT(*) FILTER (WHERE f.success IS NOT TRUE)::int AS remaining,
           COUNT(*) FILTER (WHERE f.success = false)::int AS failed
    FROM record r
    LEFT JOIN file_preview f ON f.record_id = r.id AND f.source_file_key = r.filekey
    WHERE r.filekey IS NOT NULL AND ${ZIP_UPLOAD_SQL}
  `)
  log.info(
    `File preview batch starting: ${counts.remaining} uploads remaining, ${counts.failed} of them failed before`,
    counts
  )
  const uploads = z.array(previewUploadSchema).parse(
    await database.any(`
      SELECT r.id::text AS id, r.filekey, 'html-zip' AS kind
      FROM record r
      WHERE r.filekey IS NOT NULL
        AND ${ZIP_UPLOAD_SQL}
        AND NOT EXISTS (
          SELECT 1 FROM file_preview f
          WHERE f.record_id = r.id AND f.source_file_key = r.filekey AND f.success
        )
      ORDER BY random()
      LIMIT 5
    `)
  )
  for (const upload of uploads) {
    signal.throwIfAborted()
    try {
      await extractFilePreview(database, s3, upload, sourceBucket, destinationBucket, signal)
    } catch (error) {
      log.error(`File preview extraction failed for record ${upload.id}`, error, {
        kind: upload.kind,
        sourceBucket,
        sourceKey: upload.filekey
      })
      signal.throwIfAborted()
    }
  }
}
