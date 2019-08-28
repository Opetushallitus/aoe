import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { getUnique, sortByValue } from "../util/data.utils";
import { KeyValue } from "../models/data";

const endpoint = "lukionkurssit";
const rediskey = "lukionkurssit";
const params = "koodi";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 */
export async function setLukionkurssit(): Promise<any> {
  try {
    const results = await getDataFromApi(
      process.env.KOODISTO_SERVICE_URL,
      `/${endpoint}/`,
      {"Accept": "application/json"},
      params
    );

    const finnish: KeyValue<string, string>[] = [];
    const english: KeyValue<string, string>[] = [];
    const swedish: KeyValue<string, string>[] = [];

    results.forEach((row: any) => {
      const metadataFi = row.metadata.find((e: any) => e.kieli.toLowerCase() === "fi");
      const metadataEn = row.metadata.find((e: any) => e.kieli.toLowerCase() === "en");
      const metadataSv = row.metadata.find((e: any) => e.kieli.toLowerCase() === "sv");

      finnish.push({
        key: row.koodiArvo,
        value: metadataFi ? metadataFi.nimi.trim() : (metadataSv ? metadataSv.nimi.trim() : metadataEn.nimi.trim()),
      });

      english.push({
        key: row.koodiArvo,
        value: metadataEn ? metadataEn.nimi.trim() : (metadataFi ? metadataFi.nimi.trim() : metadataSv.nimi.trim()),
      });

      swedish.push({
        key: row.koodiArvo,
        value: metadataSv ? metadataSv.nimi.trim() : (metadataFi ? metadataFi.nimi.trim() : metadataEn.nimi.trim()),
      });
    });

    finnish.sort(sortByValue);
    english.sort(sortByValue);
    swedish.sort(sortByValue);

    const filteredFi = getUnique(finnish, "value");
    const filteredEn = getUnique(english, "value");
    const filteredSv = getUnique(swedish, "value");

    await setAsync(`${rediskey}.fi`, JSON.stringify(filteredFi));
    await setAsync(`${rediskey}.en`, JSON.stringify(filteredEn));
    await setAsync(`${rediskey}.sv`, JSON.stringify(filteredSv));
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
export const getLukionkurssit = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
export const getLukionkurssi = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const redisData = await getAsync(rediskey);

    if (redisData) {
      const input = JSON.parse(redisData);
      const row = input.find((e: any) => e.key === req.params.key);

      if (row !== undefined) {
        res.status(200).json(row);
      } else {
        res.sendStatus(406);
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
