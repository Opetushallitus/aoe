import { config } from '@/config'
import { rmDir } from '@/helpers/fileRemover'
import { scheduledConvertAndUpstreamOfficeFilesToCloudStorage } from '@/helpers/officeToPdfConverter'
import { db } from '@resource/postgresClient'
import { reindexAll } from '@search/es'
import { sendExpirationMail, sendRatingNotificationMail } from '@services/mailService'
import { clearH5PContentCache } from '@services/h5pService'
import { processEntriesWithoutPID } from '@services/pidResolutionService'
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
import { Cron } from 'croner'
import { z } from 'zod'

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

const claimedRunSchema = z.object({ task_name: z.string() }).nullable()

const claimRun = async (taskName: string): Promise<boolean> => {
  const claimed = claimedRunSchema.parse(
    await db.oneOrNone(
      `INSERT INTO scheduled_task_run (task_name, run_date)
       VALUES ($1, (now() AT TIME ZONE 'UTC')::date)
       ON CONFLICT DO NOTHING RETURNING task_name`,
      [taskName]
    )
  )
  return claimed !== null
}

const scheduleClaimedTask = (
  taskName: keyof typeof config.scheduledTasks,
  pattern: string,
  run: () => Promise<void>
): void => {
  if (!config.scheduledTasks[taskName].enabled) {
    log.info(`Scheduled task ${taskName} disabled`)
    return
  }
  new Cron(pattern, async (): Promise<void> => {
    try {
      const claimed = await claimRun(taskName)
      if (!claimed) {
        log.info(`Scheduled task ${taskName} skipped: another task claimed today's run`)
        return
      }
      log.info(`Scheduled task ${taskName} started`)
      const startedAt = Date.now()
      await run()
      log.info(`Scheduled task ${taskName} completed in ${Date.now() - startedAt} ms`)
    } catch (err: unknown) {
      log.error(`Scheduled task ${taskName} failed`, err)
    }
  })
  log.info(`Scheduled task ${taskName} active at '${pattern}' (UTC)`)
}

export const startScheduledTasks = (): void => {
  scheduleClaimedTask('directoryCleaning', '0 0 1 * * *', async (): Promise<void> => {
    await rmDir(config.MEDIA_FILE_PROCESS.htmlFolder, false)
    await rmDir(config.MEDIA_FILE_PROCESS.h5pPathContent, false)
    await rmDir(config.MEDIA_FILE_PROCESS.h5pPathTemporaryStorage, false)
    clearH5PContentCache()
  })
  scheduleClaimedTask('pidRegistration', '0 15 1 * * *', processEntriesWithoutPID)
  scheduleClaimedTask('searchReindex', '0 30 1 * * *', reindexAll)
  scheduleClaimedTask(
    'officePdfConversion',
    '0 0 2 * * *',
    scheduledConvertAndUpstreamOfficeFilesToCloudStorage
  )
  scheduleClaimedTask('referenceDataUpdate', '0 0 3 * * *', updateReferenceData)
  scheduleClaimedTask('notificationMail', '0 0 10 * * *', async (): Promise<void> => {
    await sendRatingNotificationMail()
    await sendExpirationMail()
  })
}
