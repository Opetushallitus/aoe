import { getDataFromApi } from '../util/api.utils'
import { getAsync, setAsync } from '../util/redis.utils'
import { getUnique, sortByTargetName } from '../util/data.utils'
import { AlignmentObjectExtended } from '../models/alignment-object-extended'
import { winstonLogger } from '../util'
import config from '../config'
import { NextFunction, Request, Response } from 'express'

const endpoint = 'lukionkurssit'
const rediskey = 'lukionkurssit'
const params = 'koodi'

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setLukionkurssit(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.opintopolkuKoodistot,
    `/${endpoint}/`,
    {
      Accept: 'application/json',
      'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`
    },
    params
  )

  if (!results || (results as any).length < 1) {
    winstonLogger.error('No data from opintopolku koodistot in setLukionkurssit()')
    return
  }

  const finnish: AlignmentObjectExtended[] = []
  const english: AlignmentObjectExtended[] = []
  const swedish: AlignmentObjectExtended[] = []

  results.forEach((row: any) => {
    if (!row.metadata || !row.koodiArvo || !row.resourceUri) {
      throw Error(
        'Creating new sets of courses failed in setLukionkurssit(): Missing required data'
      )
    }

    const metadataFi = row.metadata.find((e: any) => e.kieli.toLowerCase() === 'fi')
    const metadataEn = row.metadata.find((e: any) => e.kieli.toLowerCase() === 'en')
    const metadataSv = row.metadata.find((e: any) => e.kieli.toLowerCase() === 'sv')

    finnish.push({
      key: row.koodiArvo,
      source: 'upperSecondarySchoolSubjects',
      alignmentType: 'educationalSubject',
      targetName: metadataFi?.nimi
        ? metadataFi.nimi.trim()
        : metadataSv?.nimi
          ? metadataSv.nimi.trim()
          : metadataEn.nimi.trim(),
      targetUrl: row.resourceUri
    })

    english.push({
      key: row.koodiArvo,
      source: 'upperSecondarySchoolSubjects',
      alignmentType: 'educationalSubject',
      targetName: metadataEn?.nimi
        ? metadataEn.nimi.trim()
        : metadataFi?.nimi
          ? metadataFi.nimi.trim()
          : metadataSv.nimi.trim(),
      targetUrl: row.resourceUri
    })

    swedish.push({
      key: row.koodiArvo,
      source: 'upperSecondarySchoolSubjects',
      alignmentType: 'educationalSubject',
      targetName: metadataSv?.nimi
        ? metadataSv.nimi.trim()
        : metadataFi?.nimi
          ? metadataFi.nimi.trim()
          : metadataEn.nimi.trim(),
      targetUrl: row.resourceUri
    })
  })

  try {
    finnish.sort(sortByTargetName)
    english.sort(sortByTargetName)
    swedish.sort(sortByTargetName)

    const filteredFi: AlignmentObjectExtended[] = getUnique(finnish, 'targetName')
    const filteredEn: AlignmentObjectExtended[] = getUnique(english, 'targetName')
    const filteredSv: AlignmentObjectExtended[] = getUnique(swedish, 'targetName')

    await setAsync(`${rediskey}.fi`, JSON.stringify(filteredFi))
    await setAsync(`${rediskey}.en`, JSON.stringify(filteredEn))
    await setAsync(`${rediskey}.sv`, JSON.stringify(filteredSv))
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
 * @returns {Promise<AlignmentObjectExtended[]>}
 */
export const getLukionkurssit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<AlignmentObjectExtended[]> => {
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
    winstonLogger.error('Getting upper secondary school courses failed in getLukionkurssit()')
  }
}

/**
 * Get single row from redis database key-value
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<AlignmentObjectExtended[]>}
 */
export const getLukionkurssi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<AlignmentObjectExtended[]> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`)

    if (redisData) {
      const input: AlignmentObjectExtended[] = JSON.parse(redisData)
      const row: AlignmentObjectExtended = input.find(
        (e: any) => e.key.toLowerCase() === req.params.key.toLowerCase()
      )

      if (row) {
        res.status(200).json(row).end()
        return
      }
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error('Getting upper secondary school course failed in getLukionkurssi()')
  }
}
