import { config } from '@/config'
import { scheduledConvertAndUpstreamOfficeFilesToCloudStorage } from '@/helpers/officeToPdfConverter'
import { db } from '@resource/postgresClient'
import { deleteExpiredSessions } from '@resource/sessionStore'
import { reindexAll } from '@search/es'
import { sendExpirationMail, sendRatingNotificationMail } from '@services/mailService'
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
  scheduleTask('pidRegistration', '0 15 1 * * *', processEntriesWithoutPID)
  scheduleTask('searchReindex', '0 30 1 * * *', reindexAll)
  scheduleTask(
    'officePdfConversion',
    '0 0 2 * * *',
    scheduledConvertAndUpstreamOfficeFilesToCloudStorage
  )
  scheduleTask('referenceDataUpdate', '0 0 3 * * *', updateReferenceData)
  scheduleTask('sessionCleanup', '0 0 4 * * *', deleteExpiredSessions)
  scheduleTask('notificationMail', '0 0 10 * * *', async (): Promise<void> => {
    await sendRatingNotificationMail()
    await sendExpirationMail()
  })
}
