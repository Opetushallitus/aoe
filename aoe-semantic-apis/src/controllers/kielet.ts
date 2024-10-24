import { getDataFromApi } from '../util/api.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { sortByValue } from '../util/data.utils';
import { KeyValue } from '../models/data';
import { winstonLogger } from '../util';
import config from '../config';
import { NextFunction, Request, Response } from 'express';

const endpoint = 'kielikoodistoopetushallinto';
const rediskey = 'kielet';
const params = 'koodi';

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setKielet(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.opintopolkuKoodistot,
    `/${endpoint}/`,
    {
      Accept: 'application/json',
      'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`,
    },
    params,
  );

  if (!results || (results as any).length < 1) {
    winstonLogger.error('No data from virkailija.opintopolku.fi in setKielet()');
    return;
  }

  const finnish: KeyValue<string, string>[] = [];
  const english: KeyValue<string, string>[] = [];
  const swedish: KeyValue<string, string>[] = [];

  results.forEach((result: any) => {
    const metadataFi = result.metadata?.find((e: any) => e.kieli?.toLowerCase() === 'fi');
    const metadataEn = result.metadata?.find((e: any) => e.kieli?.toLowerCase() === 'en');
    const metadataSv = result.metadata?.find((e: any) => e.kieli?.toLowerCase() === 'sv');

    if (!result.koodiArvo || (!metadataFi?.nimi && !metadataEn?.nimi && !metadataSv?.nimi)) {
      throw Error('Creating new sets of languages failed in setKielet(): Missing required data');
    }

    finnish.push({
      key: result.koodiArvo.toLowerCase(),
      value: metadataFi?.nimi || metadataSv?.nimi || metadataEn.nimi,
    });

    english.push({
      key: result.koodiArvo.toLowerCase(),
      value: metadataEn?.nimi || metadataFi?.nimi || metadataSv.nimi,
    });

    swedish.push({
      key: result.koodiArvo.toLowerCase(),
      value: metadataSv?.nimi || metadataFi?.nimi || metadataEn.nimi,
    });
  });

  try {
    finnish.sort(sortByValue);
    english.sort(sortByValue);
    swedish.sort(sortByValue);

    // move finnish, swedish and english to the front

    // finnish
    let fiIndex = finnish.findIndex((row: any) => row.key.toLowerCase() === 'fi');
    finnish.splice(0, 0, finnish.splice(fiIndex, 1)[0]);

    let svIndex = finnish.findIndex((row: any) => row.key.toLowerCase() === 'sv');
    finnish.splice(1, 0, finnish.splice(svIndex, 1)[0]);

    let enIndex = finnish.findIndex((row: any) => row.key.toLowerCase() === 'en');
    finnish.splice(2, 0, finnish.splice(enIndex, 1)[0]);

    // english
    fiIndex = english.findIndex((row: any) => row.key.toLowerCase() === 'fi');
    english.splice(0, 0, english.splice(fiIndex, 1)[0]);

    svIndex = english.findIndex((row: any) => row.key.toLowerCase() === 'sv');
    english.splice(1, 0, english.splice(svIndex, 1)[0]);

    enIndex = english.findIndex((row: any) => row.key.toLowerCase() === 'en');
    english.splice(2, 0, english.splice(enIndex, 1)[0]);

    // swedish
    fiIndex = swedish.findIndex((row: any) => row.key.toLowerCase() === 'fi');
    swedish.splice(0, 0, swedish.splice(fiIndex, 1)[0]);

    svIndex = swedish.findIndex((row: any) => row.key.toLowerCase() === 'sv');
    swedish.splice(1, 0, swedish.splice(svIndex, 1)[0]);

    enIndex = swedish.findIndex((row: any) => row.key.toLowerCase() === 'en');
    swedish.splice(2, 0, swedish.splice(enIndex, 1)[0]);

    await setAsync(`${rediskey}.fi`, JSON.stringify(finnish));
    await setAsync(`${rediskey}.en`, JSON.stringify(english));
    await setAsync(`${rediskey}.sv`, JSON.stringify(swedish));
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
export const getKielet = async (
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
    winstonLogger.error('Getting languages failed in getKielet()');
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
export const getKieli = async (req: Request, res: Response, next: NextFunction): Promise<KeyValue<string, string>> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      const input: KeyValue<string, string>[] = JSON.parse(redisData);
      const row: KeyValue<string, string> = input.find((e: any) => e.key === req.params.key);

      if (row) {
        res.status(200).json(row).end();
        return;
      }
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Getting language failed in getKieli()');
  }
};
