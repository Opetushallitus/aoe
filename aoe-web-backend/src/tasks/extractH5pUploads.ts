import { extractH5pUploads } from '@services/h5pExtractionService'
import * as log from '@util/winstonLogger'

const main = async (): Promise<void> => {
  const destinationBucket = process.argv[2]
  if (process.argv.length !== 3 || !destinationBucket?.trim()) {
    throw new Error('Usage: node dist/tasks/extractH5pUploads.js <destination-bucket>')
  }
  const { db, pgp } = await import('../resource/postgresClient.js')
  const { s3Client } = await import('../resource/s3Client.js')
  try {
    log.info('Starting H5P extraction batch', { destinationBucket })
    const result = await extractH5pUploads(db, s3Client, destinationBucket)
    if (result === null) {
      return
    }
    log.info('H5P extraction batch finished', result)
    if (result.failed > 0) {
      process.exitCode = 1
    }
  } finally {
    s3Client.destroy()
    pgp.end()
  }
}

main().catch((error) => {
  log.error('H5P extraction batch failed', error)
  process.exitCode = 1
})
