import { getDataFromApi } from '../util/api.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { sortByValue } from '../util/data.utils';
import { KeyValue } from '../models/data';
import { winstonLogger } from '../util';
import config from '../config';
import { NextFunction, Request, Response } from 'express';

const endpoint = 'edtech/codeschemes/EducationalRole';
const rediskey = 'kohderyhmat';
const params = 'codes/?format=json';

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setKohderyhmat(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.suomiKoodistot,
    `/${endpoint}/`,
    { Accept: 'application/json' },
    params,
  );

  if (!results || !(results as any).results || (results as any).results.length < 1) {
    winstonLogger.error('No data from koodistot.suomi.fi in setKohderyhmat()');
    return;
  }

  const finnish: KeyValue<string, string>[] = [];
  const english: KeyValue<string, string>[] = [];
  const swedish: KeyValue<string, string>[] = [];

  (results as any).results.forEach((result: any) => {
    if (!result.id || (!result.prefLabel?.fi && !result.prefLabel?.sv && !result.prefLabel?.en)) {
      throw Error('Creating new sets of educational roles failed in setKohderyhmat(): Missing required data');
    }

    finnish.push({
      key: result.id,
      value: result.prefLabel.fi
        ? result.prefLabel.fi.trim()
        : result.prefLabel.sv
        ? result.prefLabel.sv.trim()
        : result.prefLabel.en.trim(),
    });

    english.push({
      key: result.id,
      value: result.prefLabel.en
        ? result.prefLabel.en.trim()
        : result.prefLabel.fi
        ? result.prefLabel.fi.trim()
        : result.prefLabel.sv.trim(),
    });

    swedish.push({
      key: result.id,
      value: result.prefLabel.sv
        ? result.prefLabel.sv.trim()
        : result.prefLabel.fi
        ? result.prefLabel.fi.trim()
        : result.prefLabel.en.trim(),
    });
  });

  try {
    finnish.sort(sortByValue);
    english.sort(sortByValue);
    swedish.sort(sortByValue);

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
export const getKohderyhmat = async (
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
    winstonLogger.error('Getting educational roles failed in getKohderyhmat()');
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
export const getKohderyhma = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<KeyValue<string, string>> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      const input: KeyValue<string, string>[] = JSON.parse(redisData);
      const row: KeyValue<string, string> = input.find((e: any) => e.key === req.params.key);

      if (row) {
        res.status(200).json(row).end();
        return;
      } else {
        res.sendStatus(406).end();
        return;
      }
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Getting educational role failed in getKohderyhma()');
  }
};
