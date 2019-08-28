import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { sortByValue } from "../util/data.utils";
import { KeyValue } from "../models/key-value";

const endpoint = "organisaatio/v4";
const rediskey = "organisaatiot";
const params = "hae?aktiiviset=true&suunnitellut=false&lakkautetut=false";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 */
export async function setOrganisaatiot(): Promise<any> {
  try {
    const results = await getDataFromApi(
      process.env.ORGANISAATIO_SERVICE_URL,
      `/${endpoint}/`,
      {"Accept": "application/json"},
      params
    );

    const finnish: KeyValue<string, string>[] = [];
    const english: KeyValue<string, string>[] = [];
    const swedish: KeyValue<string, string>[] = [];

    results.organisaatiot.forEach(((organisation: any) => {
      finnish.push({
        key: organisation.oid,
        value: organisation.nimi.fi !== undefined ? organisation.nimi.fi : (organisation.nimi.sv !== undefined ? organisation.nimi.sv : organisation.nimi.en),
      });

      english.push({
        key: organisation.oid,
        value: organisation.nimi.en !== undefined ? organisation.nimi.en : (organisation.nimi.fi !== undefined ? organisation.nimi.fi : organisation.nimi.sv),
      });

      swedish.push({
        key: organisation.oid,
        value: organisation.nimi.sv !== undefined ? organisation.nimi.sv : (organisation.nimi.fi !== undefined ? organisation.nimi.fi : organisation.nimi.en),
      });
    }));

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
export const getOrganisaatiot = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
export const getOrganisaatio = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
