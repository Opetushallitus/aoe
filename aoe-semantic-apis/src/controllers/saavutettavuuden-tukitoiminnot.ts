import { getDataFromApi } from '../util/api.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { sortByOrder } from '../util/data.utils';
import { Accessibility } from '../models/data';
import { winstonLogger } from '../util';
import config from '../config';
import { NextFunction, Request, Response } from 'express';

const endpoint = 'edtech/codeschemes/AccessibilityFeatures';
const rediskey = 'saavutettavuudentukitoiminnot';
const params = 'codes/?format=json';

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setSaavutettavuudenTukitoiminnot(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.suomiKoodistot,
    `/${endpoint}/`,
    { Accept: 'application/json' },
    params,
  );

  if (!results || !(results as any).results || (results as any).results.length < 1) {
    winstonLogger.error('No data from koodistot.suomi.fi in setSaavutettavuudenTukitoiminnot()');
    return;
  }

  const finnish: Accessibility[] = [];
  const english: Accessibility[] = [];
  const swedish: Accessibility[] = [];

  (results as any).results.forEach((result: any) => {
    if (!result.id || !result.order || (!result.prefLabel?.fi && !result.prefLabel?.sv && !result.prefLabel?.en)) {
      throw Error(
        'Creating new sets of accessibility features failed in setSaavutettavuudenTukitoiminnot(): Missing required data',
      );
    }

    finnish.push({
      key: result.id,
      value: result.prefLabel.fi || result.prefLabel.sv || result.prefLabel.en,
      description: result.description?.fi || result.description?.sv || result.description?.en,
      order: result.order,
    });

    english.push({
      key: result.id,
      value: result.prefLabel.en || result.prefLabel.fi || result.prefLabel.sv,
      description: result.description?.en || result.description?.fi || result.description?.sv,
      order: result.order,
    });

    swedish.push({
      key: result.id,
      value: result.prefLabel.sv || result.prefLabel.fi || result.prefLabel.en,
      description: result.description?.sv || result.description?.fi || result.description?.en,
      order: result.order,
    });
  });

  try {
    finnish.sort(sortByOrder);
    english.sort(sortByOrder);
    swedish.sort(sortByOrder);

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
 * @returns {Promise<Accessibility[]>}
 */
export const getSaavutettavuudenTukitoiminnot = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Accessibility[]> => {
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
    winstonLogger.error('Getting accessibility features failed in getSaavutettavuudenTukitoiminnot()');
  }
};

/**
 * Get single row from redis database key-value
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<Accessibility>}
 */
export const getSaavutettavuudenTukitoiminto = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Accessibility> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      const input: Accessibility[] = JSON.parse(redisData);
      const row: Accessibility = input.find((e: any) => e.key === req.params.key);

      if (row) {
        res.status(200).json(row).end();
        return;
      }
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Getting accessibility feature failed in getSaavutettavuudenTukitoiminto()');
  }
};
