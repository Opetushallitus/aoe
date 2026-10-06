import { WebWritableStream } from 'htmlparser2/WebWritableStream'

import { getAsync, setAsync } from '@util/ref/redis.utils'
import { sortByValue } from '@util/ref/data.utils'
import { KeyValue } from '@/models/ref/data'
import { config } from '@/config'
import * as winstonLogger from '@util/winstonLogger'
import { NextFunction, Request, Response } from 'express'

const endpoint = 'yso'
const rediskey = 'asiasanat'
const params = 'data'

type Concept = { key?: string; labels: Record<string, string> }

const fetchConcepts = async (url: string): Promise<Concept[]> => {
  const response = await fetch(url, { headers: { Accept: 'application/rdf+xml' } })
  if (!response.ok || !response.body) {
    await response.body?.cancel()
    throw new Error(`Error getting data from ${url}: responded with HTTP ${response.status}`)
  }
  const concepts: Concept[] = []
  const open: { concept?: Concept; label?: { lang: string; text: string } } = {}
  await response.body.pipeTo(
    new WebWritableStream(
      {
        onopentag(name, attributes) {
          if (name === 'skos:Concept') {
            open.concept = { key: attributes['rdf:about'], labels: {} }
          } else if (open.concept && name === 'skos:prefLabel') {
            open.label = { lang: attributes['xml:lang'] ?? '', text: '' }
          }
        },
        ontext(text) {
          if (open.label) {
            open.label.text += text
          }
        },
        onclosetag(name) {
          if (open.concept && open.label && name === 'skos:prefLabel') {
            open.concept.labels[open.label.lang] = open.label.text
            open.label = undefined
          } else if (open.concept && name === 'skos:Concept') {
            concepts.push(open.concept)
            open.concept = undefined
          }
        }
      },
      { xmlMode: true }
    )
  )
  return concepts
}

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setAsiasanat(): Promise<void> {
  winstonLogger.info('Getting asiasanat from API in setAsiasanat()')

  const concepts = await fetchConcepts(`${config.EXTERNAL_API.asiasanat}/${endpoint}/${params}`)
  winstonLogger.info('setAsiasanat() API fetch done!')

  if (concepts.length === 0) {
    winstonLogger.error('No data from api.finto.fi')
    return
  }

  const finnish: KeyValue<string, string>[] = []
  const english: KeyValue<string, string>[] = []
  const swedish: KeyValue<string, string>[] = []

  for (const { key, labels } of concepts) {
    if (!key || (!labels.fi && !labels.en && !labels.sv)) {
      winstonLogger.error('Error parsing results in setAsiasanat()', key)
      return
    }
    finnish.push({ key, value: labels.fi || labels.sv || labels.en })
    english.push({ key, value: labels.en || labels.fi || labels.sv })
    swedish.push({ key, value: labels.sv || labels.fi || labels.en })
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
