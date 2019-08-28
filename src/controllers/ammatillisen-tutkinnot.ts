import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { getUnique, sortByValue } from "../util/data.utils";
import { KeyValue } from "../models/data";

const endpoint = "perusteet";
const rediskey = "ammatillisentutkinnot";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 */
export async function setAmmatillisenTutkinnot(): Promise<any> {
  try {
    const results: any[] = [];
    let page: number = 0;
    let getResults: boolean = true;

    while (getResults) {
      const pagedData = await getDataFromApi(
        process.env.EPERUSTEET_SERVICE_URL,
        `/${endpoint}/`,
        { "Accept": "application/json" },
        `?sivu=${page}&tuleva=true&siirtyma=true&voimassaolo=true&poistunut=true&koulutustyyppi=koulutustyyppi_1`
      );

      results.push.apply(results, pagedData.data);
      page = pagedData.sivu + 1;

      if (page >= pagedData.sivuja) {
        getResults = false;
      }
    }

    const finnish: KeyValue<number, string>[] = [];
    const english: KeyValue<number, string>[] = [];
    const swedish: KeyValue<number, string>[] = [];

    results.forEach((result: any) => {
      finnish.push({
        key: result.id,
        value: result.nimi.fi !== undefined ? result.nimi.fi : (result.nimi.sv !== undefined ? result.nimi.sv : result.nimi.en),
      });

      english.push({
        key: result.id,
        value: result.nimi.en !== undefined ? result.nimi.en : (result.nimi.fi !== undefined ? result.nimi.fi : result.nimi.sv),
      });

      swedish.push({
        key: result.id,
        value: result.nimi.sv !== undefined ? result.nimi.sv : (result.nimi.fi !== undefined ? result.nimi.fi : result.nimi.en),
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
export const getAmmatillisenTutkinnot = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
export const getAmmatillisenTutkinto = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
