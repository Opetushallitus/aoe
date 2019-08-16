import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { getUnique } from "../util/data.utils";

const endpoint = "lukionkurssit";
const rediskey = "lukionkurssit";
const params = "koodi";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 *
 * @todo Implement error handling
 */
export async function setLukionkurssit(): Promise<any> {
  const results = await getDataFromApi(
    process.env.KOODISTO_SERVICE_URL,
    `/${endpoint}/`,
    { "Accept": "application/json" },
    params
  );

  const data = results.map((row: any) => {
    const metadataFi = row.metadata.find((e: any) => e.kieli.toLowerCase() === "fi");
    const metadataEn = row.metadata.find((e: any) => e.kieli.toLowerCase() === "en");
    const metadataSv = row.metadata.find((e: any) => e.kieli.toLowerCase() === "sv");

    return {
      key: row.koodiArvo,
      value: {
        fi: metadataFi ? metadataFi.nimi.trim() : undefined,
        en: metadataEn ? metadataEn.nimi.trim() : undefined,
        sv: metadataSv ? metadataSv.nimi.trim() : undefined,
      }
    };
  });

  await setAsync(rediskey, JSON.stringify(data));
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
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);

    const data = input.map((row: any) => {
      return {
        key: row.key,
        value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value.fi,
      };
    });

    data.sort((a: any, b: any) => a.value.localeCompare(b.value, req.params.lang));

    const output = getUnique(data, "value");

    if (output.length > 0) {
      res.status(200).json(output);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);

    return next();
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
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);
    const row = input.find((e: any) => e.key.toLowerCase() === req.params.key.toLowerCase());
    let output: object;

    if (row != undefined) {
      output = {
        key: row.key,
        value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value["fi"],
      };

      res.status(200).json(output);
    } else {
      res.sendStatus(406);
    }
  } else {
    res.sendStatus(404);

    return next();
  }
};
