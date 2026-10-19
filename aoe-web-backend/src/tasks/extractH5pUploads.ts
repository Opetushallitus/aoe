import { S3Client } from '@aws-sdk/client-s3'
import { extractH5pUploads } from '@services/h5pExtractionService'
import * as log from '@util/winstonLogger'

const main = async (): Promise<void> => {
  const destinationBucket = process.argv[2]
  if (process.argv.length !== 3 || !destinationBucket?.trim()) {
    throw new Error('Usage: node dist/tasks/extractH5pUploads.js <destination-bucket>')
  }
  const { s3ClientConfig } = await import('../config.js')
  const { db, pgp } = await import('../resource/postgresClient.js')
  const s3 = new S3Client(s3ClientConfig)
  try {
    log.info('Starting H5P extraction batch', { destinationBucket })
    const result = await extractH5pUploads(db, s3, destinationBucket, {
      maxBytes:
        process.env.H5P_MAX_EXTRACTED_BYTES === undefined
          ? undefined
          : Number(process.env.H5P_MAX_EXTRACTED_BYTES),
      maxEntries:
        process.env.H5P_MAX_EXTRACTED_ENTRIES === undefined
          ? undefined
          : Number(process.env.H5P_MAX_EXTRACTED_ENTRIES)
    })
    log.info('H5P extraction batch finished', result)
    if (result.failed > 0) {
      process.exitCode = 1
    }
  } finally {
    s3.destroy()
    pgp.end()
  }
}

main().catch((error) => {
  log.error('H5P extraction batch failed', error)
  process.exitCode = 1
})
