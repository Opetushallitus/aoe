import { getDataFromApi } from '@util/ref/api.utils'
import { setAsync } from '@util/ref/redis.utils'
import { getUnique, sortByValue } from '@util/ref/data.utils'
import { KeyValue } from '@/models/ref/data'
import * as winstonLogger from '@util/winstonLogger'
import { config } from '@/config'

const endpoint = 'organisaatio/v4'
const rediskey = 'organisaatiot'
const params = 'hae?aktiiviset=true&suunnitellut=false&lakkautetut=false'

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setOrganisaatiot(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.organisaatiot || 'not-defined',
    `/${endpoint}/`,
    {
      Accept: 'application/json',
      'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`
    },
    params
  )

  if (!results || !(results as any).organisaatiot || (results as any).organisaatiot.length < 1) {
    winstonLogger.error(
      'No data for organisations from virkailija.opintopolku.fi in setOrganisaatiot()'
    )
    return
  }

  const finnish: KeyValue<string, string>[] = []
  const english: KeyValue<string, string>[] = []
  const swedish: KeyValue<string, string>[] = []

  ;(results as any).organisaatiot.forEach((organisation: any) => {
    if (
      !organisation.oid ||
      (!organisation.nimi?.fi && !organisation.nimi?.sv && !organisation.nimi?.en)
    ) {
      throw Error(
        'Creating new sets of organisations failed in setOrganisaatiot(): Missing required data'
      )
    }

    finnish.push({
      key: organisation.oid,
      value: organisation.nimi.fi || organisation.nimi.sv || organisation.nimi.en
    })

    english.push({
      key: organisation.oid,
      value: organisation.nimi.en || organisation.nimi.fi || organisation.nimi.sv
    })

    swedish.push({
      key: organisation.oid,
      value: organisation.nimi.sv || organisation.nimi.fi || organisation.nimi.en
    })
  })

  try {
    finnish.sort(sortByValue)
    english.sort(sortByValue)
    swedish.sort(sortByValue)

    const filteredFi: KeyValue<string, string>[] = getUnique(finnish, 'value')
    const filteredEn: KeyValue<string, string>[] = getUnique(english, 'value')
    const filteredSv: KeyValue<string, string>[] = getUnique(swedish, 'value')

    await setAsync(`${rediskey}.fi`, JSON.stringify(filteredFi))
    await setAsync(`${rediskey}.en`, JSON.stringify(filteredEn))
    await setAsync(`${rediskey}.sv`, JSON.stringify(filteredSv))
  } catch (err) {
    throw Error(err)
  }
}
