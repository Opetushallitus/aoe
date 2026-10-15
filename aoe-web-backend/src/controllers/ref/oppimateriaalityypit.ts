import { getDataFromApi } from '@util/ref/api.utils'
import { setAsync } from '@util/ref/redis.utils'
import { sortByValue } from '@util/ref/data.utils'
import { KeyValue } from '@/models/ref/data'
import * as winstonLogger from '@util/winstonLogger'
import { config } from '@/config'

const endpoint = 'edtech/codeschemes/MateriaalinTyyppi'
const rediskey = 'oppimateriaalityypit'
const params = 'codes/?format=json'

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setOppimateriaalityypit(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.suomiKoodistot,
    `/${endpoint}/`,
    { Accept: 'application/json' },
    params
  )

  if (!results || !(results as any).results || (results as any).results.length < 1) {
    winstonLogger.error('No data from koodistot.suomi.fi in setOppimateriaalityypit()')
    return
  }

  const finnish: KeyValue<string, string>[] = []
  const english: KeyValue<string, string>[] = []
  const swedish: KeyValue<string, string>[] = []

  ;(results as any).results.forEach((result: any) => {
    if (!result.id || (!result.prefLabel?.fi && !result.prefLabel?.sv && !result.prefLabel?.en)) {
      throw Error(
        'Creating new sets of learning resource types failed in setOppimateriaalityypit(): Missing required data'
      )
    }

    finnish.push({
      key: result.id,
      value: !!result.prefLabel.fi
        ? result.prefLabel.fi.toLowerCase()
        : !!result.prefLabel.sv
          ? result.prefLabel.sv.toLowerCase()
          : result.prefLabel.en.toLowerCase()
    })

    english.push({
      key: result.id,
      value: !!result.prefLabel.en
        ? result.prefLabel.en.toLowerCase()
        : !!result.prefLabel.fi
          ? result.prefLabel.fi.toLowerCase()
          : result.prefLabel.sv.toLowerCase()
    })

    swedish.push({
      key: result.id,
      value: !!result.prefLabel.sv
        ? result.prefLabel.sv.toLowerCase()
        : !!result.prefLabel.fi
          ? result.prefLabel.fi.toLowerCase()
          : result.prefLabel.en.toLowerCase()
    })
  })

  try {
    finnish.sort(sortByValue)
    english.sort(sortByValue)
    swedish.sort(sortByValue)

    await setAsync(`${rediskey}.fi`, JSON.stringify(finnish))
    await setAsync(`${rediskey}.en`, JSON.stringify(english))
    await setAsync(`${rediskey}.sv`, JSON.stringify(swedish))
  } catch (err) {
    throw Error(err)
  }
}
