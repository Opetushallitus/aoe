import { parseString, processors } from 'xml2js';

import { getDataFromApi } from '../util/api.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { sortByValue } from '../util/data.utils';
import { KeyValue } from '../models/data';
import config from '../config';
import { winstonLogger } from '../util';
import { NextFunction, Request, Response } from 'express';

const endpoint = 'yso';
const rediskey = 'asiasanat';
const params = 'data';

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setAsiasanat(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.asiasanat || 'not-defined',
    `/${endpoint}/`,
    { Accept: 'application/rdf+xml' },
    params,
  );

  if (!results || results?.length < 500) {
    winstonLogger.error('No data from api.finto.fi');
    return;
  }

  const finnish: KeyValue<string, string>[] = [];
  const english: KeyValue<string, string>[] = [];
  const swedish: KeyValue<string, string>[] = [];

  const parseOptions = {
    tagNameProcessors: [processors.stripPrefix],
    attrNameProcessors: [processors.stripPrefix],
    valueProcessors: [processors.stripPrefix],
    attrValueProcessors: [processors.stripPrefix],
  };
  parseString(results, parseOptions, (err, result) => {
    if (err) {
      winstonLogger.error('Error parsing results in setAsiasanat(): %o', err);
      return;
    }

    result.RDF?.Concept?.forEach((concept: any) => {
      // const key = concept.$.about.substring(concept.$.about.lastIndexOf("/") + 1, concept.$.about.length);
      const key: string = concept.$?.about;
      const labelFi = concept.prefLabel?.find((e: any) => e.$?.lang === 'fi');
      const labelEn = concept.prefLabel?.find((e: any) => e.$?.lang === 'en');
      const labelSv = concept.prefLabel?.find((e: any) => e.$?.lang === 'sv');

      if (!key || (!labelFi && !labelEn && !labelSv)) {
        throw Error('Missing required data in setAsiasanat()');
      }

      finnish.push({
        key: key,
        value: labelFi?._ || labelSv?._ || labelEn?._,
      });

      english.push({
        key: key,
        value: labelEn?._ || labelFi?._ || labelSv?._,
      });

      swedish.push({
        key: key,
        value: labelSv?._ || labelFi?._ || labelEn?._,
      });
    });
  });

  try {
    finnish.sort(sortByValue);
    english.sort(sortByValue);
    swedish.sort(sortByValue);

    if (
      finnish.length < JSON.parse(await getAsync(`${rediskey}.fi`))?.length ||
      english.length < JSON.parse(await getAsync(`${rediskey}.en`))?.length ||
      swedish.length < JSON.parse(await getAsync(`${rediskey}.sv`))?.length
    ) {
      winstonLogger.error('Creating new sets of YSO asiasanat failed in setAsiasanat()');
      return;
    } else {
      await setAsync(`${rediskey}.fi`, JSON.stringify(finnish));
      await setAsync(`${rediskey}.en`, JSON.stringify(english));
      await setAsync(`${rediskey}.sv`, JSON.stringify(swedish));
    }
  } catch (err) {
    throw Error(err);
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
  next: NextFunction,
): Promise<KeyValue<string, string>[]> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      res.status(200).json(JSON.parse(redisData)).end();
      return;
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Failed to get asiasanat in getAsiasanat()');
  }
};

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
  next: NextFunction,
): Promise<KeyValue<string, string>> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      const input: KeyValue<string, string>[] = JSON.parse(redisData);
      const row: KeyValue<string, string> = input.find((e: any) => e.key === req.params.key);

      if (row !== undefined) {
        res.status(200).json(row).end();
        return;
      } else {
        res.status(404).json({ error: 'Not Found' }).end();
        return;
      }
    } else {
      res.status(404).json({ error: 'Not Found' }).end();
      return;
    }
  } catch (err) {
    next(err);
    winstonLogger.error('Failed to get asiasana in getAsiasana()');
  }
};
