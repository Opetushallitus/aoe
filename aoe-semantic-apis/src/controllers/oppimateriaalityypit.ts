import { getDataFromApi } from '../util/api.utils'
import { getAsync, setAsync } from '../util/redis.utils'
import { sortByValue } from '../util/data.utils'
import { KeyValue } from '../models/data'
import { winstonLogger } from '../util'
import config from '../config'
import { NextFunction, Request, Response } from 'express'

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
      value:
        result.prefLabel.fi !== undefined
          ? result.prefLabel.fi.toLowerCase()
          : result.prefLabel.sv !== undefined
            ? result.prefLabel.sv.toLowerCase()
            : result.prefLabel.en.toLowerCase()
    })

    english.push({
      key: result.id,
      value:
        result.prefLabel.en !== undefined
          ? result.prefLabel.en.toLowerCase()
          : result.prefLabel.fi !== undefined
            ? result.prefLabel.fi.toLowerCase()
            : result.prefLabel.sv.toLowerCase()
    })

    swedish.push({
      key: result.id,
      value:
        result.prefLabel.sv !== undefined
          ? result.prefLabel.sv.toLowerCase()
          : result.prefLabel.fi !== undefined
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

/**
 * Get data from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<KeyValue<string, string>[]>}
 */
export const getOppimateriaalityypit = async (
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
    winstonLogger.error('Getting learning resource types failed in getOppimateriaalityypit()')
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
export const getOppimateriaalityyppi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<KeyValue<string, string>> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`)

    if (redisData) {
      const input: KeyValue<string, string>[] = JSON.parse(redisData)
      const row: KeyValue<string, string> = input.find((e: any) => e.key === req.params.key)

      if (row !== undefined) {
        res.status(200).json(row).end()
        return
      } else {
        res.sendStatus(406).end()
        return
      }
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error('Getting learning resource types failed in getOppimateriaalityypit()')
  }
}
