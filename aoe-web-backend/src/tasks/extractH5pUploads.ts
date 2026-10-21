import { config } from '@/config'
import { db, pgp } from '@resource/postgresClient'
import { s3Client } from '@resource/s3Client'
import { extractH5pUploads } from '@services/h5pExtractionService'
import { runTaskWithLock } from '@util/taskLock'
import * as log from '@util/winstonLogger'

const main = async (): Promise<void> => {
  const destinationBucket = process.argv[2]
  if (process.argv.length !== 3 || !destinationBucket?.trim()) {
    throw new Error('Usage: node dist/tasks/extractH5pUploads.js <destination-bucket>')
  }
  try {
    log.info('Starting H5P extraction batch', { destinationBucket })
    const result = await runTaskWithLock(db, 'h5pExtraction', (connection, signal) =>
      extractH5pUploads(connection, s3Client, config.cloudStorage.bucket, destinationBucket, signal)
    )
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
