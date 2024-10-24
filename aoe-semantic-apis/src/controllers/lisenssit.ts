import { getDataFromApi } from '../util/api.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { License } from '../models/data';
import { winstonLogger } from '../util';
import config from '../config';
import { NextFunction, Request, Response } from 'express';

const endpoint = 'edtech/codeschemes/Licence';
const rediskey = 'lisenssit';
const params = 'codes/?format=json&expand=externalReference';

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
    params,
  );

  if (!results || !(results as any).results || (results as any).results.length < 1) {
    winstonLogger.error('No data from koodistot.suomi.fi in setLisenssit()');
    return;
  }

  const finnish: License[] = [];
  const english: License[] = [];
  const swedish: License[] = [];

  (results as any).results.forEach((result: any) => {
    if (
      !result.codeValue ||
      (!result.prefLabel?.fi && !result.prefLabel?.sv && !result.prefLabel?.en) ||
      (!result.definition?.fi && !result.definition?.sv && !result.definition?.en) ||
      !result.externalReferences ||
      result.externalReferences.length < 1
    ) {
      throw Error('Creating new sets of licenses failed in setLisenssit(): Missing required data');
    }

    finnish.push({
      key: result.codeValue,
      value: result.prefLabel.fi || result.prefLabel.sv || result.prefLabel.en,
      link: result.externalReferences[0].href,
      description: result.definition.fi || result.definition.sv || result.definition.en,
    });

    english.push({
      key: result.codeValue,
      value: result.prefLabel.en || result.prefLabel.fi || result.prefLabel.sv,
      link: result.externalReferences[0].href,
      description: result.definition.en || result.definition.fi || result.definition.sv,
    });

    swedish.push({
      key: result.codeValue,
      value: result.prefLabel.sv || result.prefLabel.fi || result.prefLabel.en,
      link: result.externalReferences[0].href,
      description: result.definition.sv || result.definition.fi || result.definition.en,
    });
  });

  try {
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
 * @returns {Promise<License[]>}
 */
export const getLisenssit = async (req: Request, res: Response, next: NextFunction): Promise<License[]> => {
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
    winstonLogger.error('Getting licenses failed in getLisenssit()');
  }
};

/**
 * Get single row from redis database key-value
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<License>}
 */
export const getLisenssi = async (req: Request, res: Response, next: NextFunction): Promise<License> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      const input: License[] = JSON.parse(redisData);
      const row: License = input.find((e: any) => e.key === req.params.key);

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
    winstonLogger.error('Getting license failed in getLisenssi()');
  }
};
