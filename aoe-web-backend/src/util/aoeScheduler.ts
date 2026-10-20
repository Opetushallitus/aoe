import { config } from '@/config'
import { rmDir } from '@/helpers/fileRemover'
import { scheduledConvertAndUpstreamOfficeFilesToCloudStorage } from '@/helpers/officeToPdfConverter'
import { db } from '@resource/postgresClient'
import { s3Client } from '@resource/s3Client'
import { reindexAll } from '@search/es'
import { sendExpirationMail, sendRatingNotificationMail } from '@services/mailService'
import { clearH5PContentCache } from '@services/h5pService'
import { processEntriesWithoutPID } from '@services/pidResolutionService'
import { extractH5pUploads } from '@services/h5pExtractionService'
import {
  setAmmattikoulunAmmattitutkinnot,
  setAmmattikoulunErikoisammattitutkinnot,
  setAmmattikoulunPerustutkinnot,
  setAmmattikoulunTutkinnonOsat,
  setAmmattikoulunYTOaineet,
  setLukionOppiaineetModuulit,
  setLukionTavoitteetSisallot,
  setLukionVanhatOppiaineetKurssit,
  setPerusopetuksenOppiaineet,
  setTuvaOppiaineetTavoitteet
} from '@services/ePerusteetService'
import {
  setAsiasanat,
  setKayttokohteet,
  setKielet,
  setKohderyhmat,
  setKoulutusasteet,
  setLisenssit,
  setLukionkurssit,
  setOppimateriaalityypit,
  setOrganisaatiot,
  setSaavutettavuudenEsteet,
  setSaavutettavuudenTukitoiminnot,
  setTieteenalat
} from '@services/referenceDataService'
import * as log from '@util/winstonLogger'
import { runTaskWithLock, type TaskRun } from '@util/taskLock'
import { Cron } from 'croner'

const runInOrder = async (setters: (() => Promise<void>)[]): Promise<void> => {
  for (const set of setters) {
    try {
      await set()
    } catch (err) {
      log.error(`Setting reference data failed in ${set.name}()`, err)
    }
  }
}

export async function updateReferenceData(): Promise<void> {
  log.info('Starting reference data update ...')
  const startedAt = Date.now()
  await Promise.all([
    runInOrder([setLukionOppiaineetModuulit, setLukionTavoitteetSisallot]),
    runInOrder([
      setAmmattikoulunPerustutkinnot,
      setAmmattikoulunAmmattitutkinnot,
      setAmmattikoulunErikoisammattitutkinnot,
      setAmmattikoulunTutkinnonOsat,
      setAmmattikoulunYTOaineet
    ]),
    runInOrder([setAsiasanat, setOrganisaatiot, setPerusopetuksenOppiaineet]),
    runInOrder([
      setKoulutusasteet,
      setKohderyhmat,
      setKayttokohteet,
      setSaavutettavuudenTukitoiminnot,
      setSaavutettavuudenEsteet,
      setKielet,
      setTieteenalat,
      setOppimateriaalityypit,
      setLisenssit,
      setLukionkurssit,
      setLukionVanhatOppiaineetKurssit,
      setTuvaOppiaineetTavoitteet
    ])
  ])
  log.info(`... Reference data update done in ${Date.now() - startedAt} ms`)
}

const scheduleTask = (
  taskName: keyof typeof config.scheduledTasks,
  pattern: string,
  run: TaskRun<void>
): void => {
  if (!config.scheduledTasks[taskName].enabled) {
    log.info(`Scheduled task ${taskName} disabled`)
    return
  }
  new Cron(pattern, async (): Promise<void> => {
    try {
      await runTaskWithLock(db, taskName, async (connection, signal) => {
        log.info(`Scheduled task ${taskName} started`)
        const startedAt = Date.now()
        await run(connection, signal)
        log.info(`Scheduled task ${taskName} completed in ${Date.now() - startedAt} ms`)
      })
    } catch (err: unknown) {
      log.error(`Scheduled task ${taskName} failed`, err)
    }
  })
  log.info(`Scheduled task ${taskName} active at '${pattern}'`)
}

export const startScheduledTasks = (): void => {
  if (config.featureFlags.extractH5PFilesToS3) {
    scheduleTask('h5pExtraction', '0 */10 * * * *', async (connection, signal): Promise<void> => {
      const result = await extractH5pUploads(
        connection,
        s3Client,
        config.cloudStorage.bucket,
        config.cloudStorage.bucketUploadedMaterials,
        signal
      )
      log.info('H5P extraction batch finished', result)
    })
  }
  scheduleTask('directoryCleaning', '0 0 1 * * *', async (): Promise<void> => {
    await rmDir(config.MEDIA_FILE_PROCESS.htmlFolder, false)
    await rmDir(config.MEDIA_FILE_PROCESS.h5pPathContent, false)
    await rmDir(config.MEDIA_FILE_PROCESS.h5pPathTemporaryStorage, false)
    clearH5PContentCache()
  })
  scheduleTask('pidRegistration', '0 15 1 * * *', processEntriesWithoutPID)
  scheduleTask('searchReindex', '0 30 1 * * *', reindexAll)
  scheduleTask(
    'officePdfConversion',
    '0 0 2 * * *',
    scheduledConvertAndUpstreamOfficeFilesToCloudStorage
  )
  scheduleTask('referenceDataUpdate', '0 0 3 * * *', updateReferenceData)
  scheduleTask('notificationMail', '0 0 10 * * *', async (): Promise<void> => {
    await sendRatingNotificationMail()
    await sendExpirationMail()
  })
}
