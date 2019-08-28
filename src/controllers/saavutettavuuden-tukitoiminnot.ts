import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { sortByValue } from "../util/data.utils";
import { KeyValue } from "../models/key-value";

const endpoint = "edtech/codeschemes/AccessibilityFeatures";
const rediskey = "saavutettavuudentukitoiminnot";
const params = "codes/?format=json";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 */
export async function setSaavutettavuudenTukitoiminnot(): Promise<any> {
  try {
    const results = await getDataFromApi(
      process.env.KOODISTOT_SUOMI_URL,
      `/${endpoint}/`,
      {"Accept": "application/json"},
      params
    );

    const finnish: KeyValue<string, string>[] = [];
    const english: KeyValue<string, string>[] = [];
    const swedish: KeyValue<string, string>[] = [];

    results.results.forEach((result: any) => {
      finnish.push({
        key: result.id,
        value: result.prefLabel.fi !== undefined ? result.prefLabel.fi : (result.prefLabel.sv !== undefined ? result.prefLabel.sv : result.prefLabel.en),
      });

      english.push({
        key: result.id,
        value: result.prefLabel.en !== undefined ? result.prefLabel.en : (result.prefLabel.fi !== undefined ? result.prefLabel.fi : result.prefLabel.sv),
      });

      swedish.push({
        key: result.id,
        value: result.prefLabel.sv !== undefined ? result.prefLabel.sv : (result.prefLabel.fi !== undefined ? result.prefLabel.fi : result.prefLabel.en),
      });
    });

    finnish.sort(sortByValue);
    english.sort(sortByValue);
    swedish.sort(sortByValue);

    await setAsync(`${rediskey}.fi`, JSON.stringify(finnish));
    await setAsync(`${rediskey}.en`, JSON.stringify(english));
    await setAsync(`${rediskey}.sv`, JSON.stringify(swedish));
  } catch (err) {
    console.error(err);
  }
}

/**
 * Get data from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<any>}
 */
export const getSaavutettavuudenTukitoiminnot = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const redisData = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      res.status(200).json(JSON.parse(redisData));
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

/**
 * Get single row from redis database key-value
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<any>}
 */
export const getSaavutettavuudenTukitoiminto = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const redisData = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      const input = JSON.parse(redisData);
      const row = input.find((e: any) => e.key === req.params.key);

      if (row !== undefined) {
        res.status(200).json(row);
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};
