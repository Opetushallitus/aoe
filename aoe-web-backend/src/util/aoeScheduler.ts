import { config } from '@/config'
import { rmDir } from '@/helpers/fileRemover'
import { scheduledConvertAndUpstreamOfficeFilesToCloudStorage } from '@/helpers/officeToPdfConverter'
import { updateEsDocument } from '@search/es'
import { sendExpirationMail, sendRatingNotificationMail } from '@services/mailService'
import { processEntriesWithoutPID } from '@services/pidResolutionService'
import * as log from '@util/winstonLogger'
import { Job, scheduleJob } from 'node-schedule'

const emailSchedule = process.env.EMAIL_CRON_SCHEDULE || '0 0 10 * * *'
const pidSchedule = process.env.PID_CRON_SCHEDULE || '0 15 1 * * *'
const fileCleaningSchedule = process.env.FILE_CLEANING_CRON_SCHEDULE || '0 0 1 * * *'
const indexUpdateSchedule = process.env.INDEX_UPDATE_CRON_SCHEDULE || '0 30 1 * * *'

export const startScheduledCleaning = (): void => {
  const dirCleaningScheduler: Job = scheduleJob(fileCleaningSchedule, async (): Promise<void> => {
    // Remove temporary content from the resource directories (H5P, HTML).
    try {
      rmDir(config.MEDIA_FILE_PROCESS.htmlFolder, false)
      rmDir(config.MEDIA_FILE_PROCESS.h5pPathContent, false)
      rmDir(config.MEDIA_FILE_PROCESS.h5pPathTemporaryStorage, false)
      log.debug('Scheduled removal for temporary H5P and HTML content completed.')
    } catch (err: unknown) {
      log.error('Scheduled removal for temporary H5P or HTML content failed', err)
      dirCleaningScheduler.cancel()
    }
  })
  log.info('Scheduled job active for directory cleaning at 1:00 AM (UTC)')
}

// 1:15 AM (UTC): scheduled PID (Permanent Identifiers) registration for recently published educational materials.
export const startScheduledRegistrationForPIDs = (): void => {
  if (!process.env.PID_SERVICE_RUN_SCHEDULED || process.env.PID_SERVICE_RUN_SCHEDULED !== 'true') {
    return
  }
  const pidRegisterScheduler: Job = scheduleJob(pidSchedule, async (): Promise<void> => {
    try {
      log.info('Starting to register PIDs for educational materials')
      await processEntriesWithoutPID()
      log.info('Finished PID registration for educational materials')
    } catch (err: unknown) {
      log.error('PID registration for educational materials failed', err)
      pidRegisterScheduler.cancel()
    }
  })
}

// 1:30 AM (UTC): scheduled search index update.
export const startScheduledSearchIndexUpdate = (): void => {
  const searchUpdateScheduler: Job = scheduleJob(indexUpdateSchedule, async (): Promise<void> => {
    // Update search engine index with recent changes.
    try {
      await updateEsDocument(true)
      log.debug('Scheduled index update for the search engine completed.')
    } catch (err: unknown) {
      log.error('Scheduled index update for the search engine failed', err)
      searchUpdateScheduler.cancel()
    }
  })
  log.info('Scheduled job active for search index update at 1:30 AM (UTC)')
}

export function startScheduledMailJobs() {
  scheduleJob(emailSchedule, async (): Promise<void> => {
    try {
      await sendRatingNotificationMail()
      await sendExpirationMail()
    } catch (err: unknown) {
      log.error('Sending scheduled expiration or rating notification mail failed', err)
    }
  })
}

export function startScheduledPdfConvertAndUpstreamOfficeFiles() {
  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  sleep(10000).then((): void => {
    void scheduledConvertAndUpstreamOfficeFilesToCloudStorage()
  })
}
