import { redisClient } from '@resource/redisClient'
import * as winstonLogger from '@util/winstonLogger'

import { setAsiasanat } from '@/controllers/ref/asiasanat'
import { setKoulutusasteet } from '@/controllers/ref/koulutusasteet'
import { setKohderyhmat } from '@/controllers/ref/kohderyhmat'
import { setKayttokohteet } from '@/controllers/ref/kayttokohteet'
import { setSaavutettavuudenTukitoiminnot } from '@/controllers/ref/saavutettavuuden-tukitoiminnot'
import { setSaavutettavuudenEsteet } from '@/controllers/ref/saavutettavuuden-esteet'
import { setKielet } from '@/controllers/ref/kielet'
import { setOrganisaatiot } from '@/controllers/ref/organisaatiot'
import { setTieteenalat } from '@/controllers/ref/tieteenalat'
import { setOppimateriaalityypit } from '@/controllers/ref/oppimateriaalityypit'
import { setPerusopetuksenOppiaineet } from '@/controllers/ref/perusopetus'
import { setLisenssit } from '@/controllers/ref/lisenssit'
import { setLukionkurssit } from '@/controllers/ref/lukionkurssit'
import { setLukionOppiaineetModuulit, setLukionTavoitteetSisallot } from '@/controllers/ref/lukio'
import {
  setAmmattikoulunTutkinnonOsat,
  setAmmattikoulunPerustutkinnot,
  setAmmattikoulunAmmattitutkinnot,
  setAmmattikoulunErikoisammattitutkinnot,
  setAmmattikoulunYTOaineet
} from '@/controllers/ref/ammattikoulu'
import { setLukionVanhatOppiaineetKurssit } from '@/controllers/ref/vanha-lukio'
import { setTuvaOppiaineetTavoitteet } from '@/controllers/ref/tuva'

export const getAsync = async (key: string): Promise<string | null> => {
  try {
    const value = await redisClient.get(key)
    return value?.toString() ?? null
  } catch (err) {
    winstonLogger.error(`REDIS get failed for key ${key}`, err)
    throw err
  }
}

export const setAsync = async (key: string, value: string): Promise<void> => {
  try {
    await redisClient.set(key, value)
  } catch (err) {
    winstonLogger.error(`REDIS set failed for key ${key}`, err)
    throw err
  }
}

const runInOrder = async (setters: (() => Promise<void>)[]): Promise<void> => {
  for (const set of setters) {
    try {
      await set()
    } catch (err) {
      winstonLogger.error(`Setting reference data failed in ${set.name}()`, err)
    }
  }
}

export async function updateReferenceData(): Promise<void> {
  winstonLogger.info('Starting reference data update ...')
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
  winstonLogger.info(`... Reference data update done in ${Date.now() - startedAt} ms`)
}
