import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  type S3Client
} from '@aws-sdk/client-s3'
import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js'
import { Readable } from 'node:stream'
import { InvalidArchiveError, uploadExtractedArchive } from './filePreviewService.ts'

const zipOf = async (files: Record<string, string>): Promise<Buffer> => {
  const writer = new ZipWriter(new BlobWriter())
  for (const [name, content] of Object.entries(files)) {
    await writer.add(name, new TextReader(content))
  }
  const blob = await writer.close()
  return Buffer.from(await blob.arrayBuffer())
}

// Serves one archive with ranged GETs and records the PUTs.
const fakeS3 = (archive: Buffer) => {
  const puts = new Map<string, string>()
  const s3 = {
    send: async (command: unknown) => {
      if (command instanceof HeadObjectCommand) {
        return { ContentLength: archive.length }
      }
      if (command instanceof GetObjectCommand) {
        const [, start, end] = /^bytes=(\d+)-(\d+)$/.exec(command.input.Range ?? '') ?? []
        assert.ok(start, 'every read must be ranged')
        return { Body: Readable.from([archive.subarray(Number(start), Number(end) + 1)]) }
      }
      if (command instanceof PutObjectCommand) {
        const chunks = await (command.input.Body as Readable).toArray()
        puts.set(command.input.Key ?? '', Buffer.concat(chunks).toString())
        return {}
      }
      throw new Error('unexpected command')
    }
  } as unknown as S3Client
  return { s3, puts }
}

const extract = (s3: S3Client, kind: 'h5p' | 'html-zip') =>
  uploadExtractedArchive(
    { id: '1', filekey: 'upload.zip', kind },
    s3,
    'source',
    'destination',
    new AbortController().signal
  )

describe('uploadExtractedArchive', () => {
  it('uploads every entry read from S3 ranges', async () => {
    const { s3, puts } = fakeS3(
      await zipOf({ 'site/index.html': '<p>hi</p>', 'site/empty.txt': '', 'site/a.css': 'a{}' })
    )
    const { prefix, entryPath } = await extract(s3, 'html-zip')
    assert.equal(entryPath, 'site/index.html')
    assert.deepEqual(Object.fromEntries(puts), {
      [`${prefix}site/index.html`]: '<p>hi</p>',
      [`${prefix}site/empty.txt`]: '',
      [`${prefix}site/a.css`]: 'a{}'
    })
  })

  it('rejects an H5P package without h5p.json before uploading', async () => {
    const zip = await zipOf({ 'content/content.json': '{}' })
    const { s3, puts } = fakeS3(zip)
    await assert.rejects(extract(s3, 'h5p'), InvalidArchiveError)
    assert.equal(puts.size, 0)
  })

  it('rejects a file that is not a ZIP', async () => {
    const { s3 } = fakeS3(Buffer.from('not a zip'))
    await assert.rejects(extract(s3, 'h5p'), InvalidArchiveError)
  })

  it('does not treat a storage failure as an invalid archive', async () => {
    const s3 = {
      send: async () => {
        throw new Error('S3 down')
      }
    } as unknown as S3Client
    await assert.rejects(extract(s3, 'h5p'), (error) => !(error instanceof InvalidArchiveError))
  })
})
