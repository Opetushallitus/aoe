import { getDataFromApi } from '@util/ref/api.utils'
import { setAsync } from '@util/ref/redis.utils'
import { License } from '@/models/ref/data'
import * as winstonLogger from '@util/winstonLogger'
import { config } from '@/config'

const endpoint = 'edtech/codeschemes/Licence'
const rediskey = 'lisenssit'
const params = 'codes/?format=json&expand=externalReference'

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setLisenssit(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.suomiKoodistot,
    `/${endpoint}/`,
    { Accept: 'application/json' },
    params
  )

  if (!results || !(results as any).results || (results as any).results.length < 1) {
    winstonLogger.error('No data from koodistot.suomi.fi in setLisenssit()')
    return
  }

  const finnish: License[] = []
  const english: License[] = []
  const swedish: License[] = []

  ;(results as any).results.forEach((result: any) => {
    if (
      !result.codeValue ||
      (!result.prefLabel?.fi && !result.prefLabel?.sv && !result.prefLabel?.en) ||
      (!result.definition?.fi && !result.definition?.sv && !result.definition?.en) ||
      !result.externalReferences ||
      result.externalReferences.length < 1
    ) {
      throw Error('Creating new sets of licenses failed in setLisenssit(): Missing required data')
    }

    finnish.push({
      key: result.codeValue,
      value: result.prefLabel.fi || result.prefLabel.sv || result.prefLabel.en,
      link: result.externalReferences[0].href,
      description: result.definition.fi || result.definition.sv || result.definition.en
    })

    english.push({
      key: result.codeValue,
      value: result.prefLabel.en || result.prefLabel.fi || result.prefLabel.sv,
      link: result.externalReferences[0].href,
      description: result.definition.en || result.definition.fi || result.definition.sv
    })

    swedish.push({
      key: result.codeValue,
      value: result.prefLabel.sv || result.prefLabel.fi || result.prefLabel.en,
      link: result.externalReferences[0].href,
      description: result.definition.sv || result.definition.fi || result.definition.en
    })
  })

  try {
    await setAsync(`${rediskey}.fi`, JSON.stringify(finnish))
    await setAsync(`${rediskey}.en`, JSON.stringify(english))
    await setAsync(`${rediskey}.sv`, JSON.stringify(swedish))
  } catch (err) {
    throw Error(err)
  }
}
