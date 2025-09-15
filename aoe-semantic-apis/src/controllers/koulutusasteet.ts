import { getDataFromApi } from '../util/api.utils'
import { getAsync, setAsync } from '../util/redis.utils'
import { Children, EducationLevel } from '../models/data'
import { sortByValue } from '../util/data.utils'
import { winstonLogger } from '../util'
import config from '../config'
import { NextFunction, Request, Response } from 'express'
import { disabledEducationalLevels } from '../constants/metadata-exceptions.json'

const endpoint = 'edtech/codeschemes/Koulutusaste'
const rediskey = 'koulutusasteet'
const params = 'codes/?format=json'

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setKoulutusasteet(): Promise<void> {
  winstonLogger.info('Getting educational levels from API in setKoulutus()')
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.suomiKoodistot,
    `/${endpoint}/`,
    { Accept: 'application/json' },
    params
  )
  winstonLogger.info('... API fetch done!')

  if (!results || !(results as any).results || (results as any).results.length < 1) {
    winstonLogger.error('No data from koodistot.suomi.fi in setKoulutusasteet()')
    return
  }

  const finnish: EducationLevel[] = []
  const english: EducationLevel[] = []
  const swedish: EducationLevel[] = []

  const data = (results as any).results.map((result: any) => {
    return {
      key: result.id,
      parent: 'broaderCode' in result ? result.broaderCode.id : undefined,
      value: {
        fi: result.prefLabel?.fi,
        en: result.prefLabel?.en,
        sv: result.prefLabel?.sv
      }
    }
  })

  data.forEach((row: any) => {
    if (!row.key || (!row.value?.fi && !row.value?.sv && !row.value?.en)) {
      throw Error(
        'Creating new sets of educational levels failed in setKoulutusasteet(): Missing required data'
      )
    }

    const childrenArray = data.filter((e: any) => e.parent === row.key)
    const childrenFi: Children[] = []
    const childrenEn: Children[] = []
    const childrenSv: Children[] = []

    childrenFi.push({
      key: row.key,
      value: row.value.fi || row.value.sv || row.value.en,
      disabled: disabledEducationalLevels.includes(row.key)
    })

    childrenEn.push({
      key: row.key,
      value: row.value.en || row.value.fi || row.value.sv,
      disabled: disabledEducationalLevels.includes(row.key)
    })

    childrenSv.push({
      key: row.key,
      value: row.value.sv || row.value.fi || row.value.en,
      disabled: disabledEducationalLevels.includes(row.key)
    })

    childrenArray.forEach((child: any) => {
      childrenFi.push({
        key: child.key,
        value: child.value?.fi || child.value?.sv || child.value?.en,
        disabled: disabledEducationalLevels.includes(child.key)
      })

      childrenEn.push({
        key: child.key,
        value: child.value?.en || child.value?.fi || child.value?.sv,
        disabled: disabledEducationalLevels.includes(child.key)
      })

      childrenSv.push({
        key: child.key,
        value: child.value?.sv || child.value?.fi || child.value?.en,
        disabled: disabledEducationalLevels.includes(child.key)
      })
    })

    // basic education
    if (row.key === '8cb1a02f-54cb-499a-b470-4ee980519707') {
      // sort sub levels by value
      childrenFi.sort(sortByValue)
      childrenEn.sort(sortByValue)
      childrenSv.sort(sortByValue)

      // we need to do some manual sorting to get main level first and 10th grade to last
      const mainLevelIndex = childrenFi.findIndex(
        (level: Children) => level.key === '8cb1a02f-54cb-499a-b470-4ee980519707'
      )
      childrenFi.splice(0, 0, childrenFi.splice(mainLevelIndex, 1)[0])

      const lastLevelIndex = childrenFi.findIndex(
        (level: Children) => level.key === '14fe3b08-8516-4999-946b-96eb90c2d563'
      )
      childrenFi.splice(childrenFi.length - 1, 0, childrenFi.splice(lastLevelIndex, 1)[0])
    }

    if (row.parent === undefined) {
      finnish.push({
        key: row.key,
        value: row.value.fi || row.value.sv || row.value.en,
        children: childrenFi
      })

      english.push({
        key: row.key,
        value: row.value.en || row.value.fi || row.value.sv,
        children: childrenEn
      })

      swedish.push({
        key: row.key,
        value: row.value.sv || row.value.fi || row.value.en,
        children: childrenSv
      })
    }
  })

  try {
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
 * @returns {Promise<EducationLevel[]>}
 */
export const getKoulutusasteet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<EducationLevel[]> => {
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
    winstonLogger.error('Getting educational levels failed in getKoulutusasteet()')
  }
}

/**
 * Get single row from redis database key-value
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<EducationLevel>}
 */
export const getKoulutusaste = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<EducationLevel> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`)

    if (redisData) {
      const input: EducationLevel[] = JSON.parse(redisData)
      const row: EducationLevel = input.find((e: any) => e.key === req.params.key)

      if (row) {
        res.status(200).json(row).end()
        return
      }
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error('Setting educational level failed in getKoulutusaste()')
  }
}
