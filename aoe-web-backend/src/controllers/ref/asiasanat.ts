import { XMLParser } from 'fast-xml-parser'

import { getDataFromApi } from '@util/ref/api.utils'
import { getAsync, setAsync } from '@util/ref/redis.utils'
import { sortByValue } from '@util/ref/data.utils'
import { KeyValue } from '@/models/ref/data'
import { config } from '@/config'
import * as winstonLogger from '@util/winstonLogger'
import { NextFunction, Request, Response } from 'express'

const endpoint = 'yso'
const rediskey = 'asiasanat'
const params = 'data'

type PrefLabel = { lang?: string; _?: string }
type Concept = { about?: string; prefLabel?: PrefLabel[] }
type ParsedRdf = { RDF?: { Concept?: Concept[] } }

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setAsiasanat(): Promise<void> {
  winstonLogger.info('Getting asiasanat from API in setAsiasanat()')

  const results: string = await getDataFromApi(
    config.EXTERNAL_API.asiasanat || 'not-defined',
    `/${endpoint}/`,
    { Accept: 'application/rdf+xml' },
    params
  )
  winstonLogger.info('setAsiasanat() API fetch done!')

  if (!results || results?.length < 500) {
    winstonLogger.error('No data from api.finto.fi')
    return
  }

  const finnish: KeyValue<string, string>[] = []
  const english: KeyValue<string, string>[] = []
  const swedish: KeyValue<string, string>[] = []

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    removeNSPrefix: true,
    textNodeName: '_',
    isArray: (name) => ['Concept', 'prefLabel'].includes(name)
  })

  try {
    const parsed = parser.parse(results)
    parsed.RDF?.Concept?.forEach((concept: Concept) => {
      const key: string = concept.about
      const labelFi = concept.prefLabel?.find((e) => e.lang === 'fi')
      const labelEn = concept.prefLabel?.find((e) => e.lang === 'en')
      const labelSv = concept.prefLabel?.find((e) => e.lang === 'sv')

      if (!key || (!labelFi && !labelEn && !labelSv)) {
        throw Error('Missing required data in setAsiasanat()')
      }

      finnish.push({ key, value: labelFi?._ || labelSv?._ || labelEn?._ })
      english.push({ key, value: labelEn?._ || labelFi?._ || labelSv?._ })
      swedish.push({ key, value: labelSv?._ || labelFi?._ || labelEn?._ })
    })
  } catch (err) {
    winstonLogger.error('Error parsing results in setAsiasanat(): %o', err)
    return
  }

  try {
    finnish.sort(sortByValue)
    english.sort(sortByValue)
    swedish.sort(sortByValue)

    if (
      finnish.length < JSON.parse(await getAsync(`${rediskey}.fi`))?.length ||
      english.length < JSON.parse(await getAsync(`${rediskey}.en`))?.length ||
      swedish.length < JSON.parse(await getAsync(`${rediskey}.sv`))?.length
    ) {
      winstonLogger.error(
        'Creating new sets of YSO asiasanat failed in setAsiasanat(): one of language values sets was smaller than currently in Redis'
      )
      return
    } else {
      winstonLogger.info('Pushing asiasanat to Redis...')
      await setAsync(`${rediskey}.fi`, JSON.stringify(finnish))
      winstonLogger.info('setAsiasanat() finnish done!')
      await setAsync(`${rediskey}.en`, JSON.stringify(english))
      winstonLogger.info('setAsiasanat() english done!')
      await setAsync(`${rediskey}.sv`, JSON.stringify(swedish))
      winstonLogger.info('setAsiasanat() swedish done! Finished!')
    }
  } catch (err) {
    throw err
  }
}

/**
 * Get data from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<KeyValue<string, string>[]>}
 */
export const getAsiasanat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<KeyValue<string, string>[]> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`)

    if (redisData) {
      res.status(200).json(JSON.parse(redisData)).end()
      return
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error('Failed to get asiasanat in getAsiasanat()')
  }
}

/**
 * Get single row from redis database key-value
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<KeyValue<string, string>>}
 */
export const getAsiasana = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<KeyValue<string, string>> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`)

    if (redisData) {
      const input: KeyValue<string, string>[] = JSON.parse(redisData)
      const row = input.find((e) => e.key === req.params.key)

      if (!!row) {
        res.status(200).json(row).end()
        return
      } else {
        res.status(404).json({ error: 'Not Found' }).end()
        return
      }
    } else {
      res.status(404).json({ error: 'Not Found' }).end()
      return
    }
  } catch (err) {
    next(err)
    winstonLogger.error('Failed to get asiasana in getAsiasana()')
  }
}
