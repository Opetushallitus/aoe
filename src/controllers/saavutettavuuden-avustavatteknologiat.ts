import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "./common";
import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();
const endpoint = "edtech/codeschemes/SaavutettavuusAvustavatTeknologiat";
const rediskey = "saavutettavuudenavustavatteknologiat";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 *
 * @todo Implement error handling
 */
export async function setSaavutettavuudenAvustavatTeknologiat(): Promise<any> {
  try {
    const results = await getDataFromApi(process.env.KOODISTOT_SUOMI_URL, `/${endpoint}/codes/?format=json`, { "Accept": "application/json" });
    const data: object[] = [];

    results.results.map((result: any) => {
      data.push({
        "key": result.id,
        "value": {
          "fi": result.prefLabel.fi,
          "en": result.prefLabel.en,
          "sv": result.prefLabel.sv,
        }
      });
    });

    await client.set(rediskey, JSON.stringify(data));
  } catch (error) {
    console.error(error);
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
export const getSaavutettavuudenAvustavatTeknologiat = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if (await client.exists(rediskey) !== true) {
    res.sendStatus(404);

    return next();
  }

  const input = JSON.parse(await client.get(rediskey));
  const output: object[] = [];

  input.map((row: any) => {
    output.push({
      "key": row.key,
      "value": row.value[req.params.lang] !== undefined ? row.value[req.params.lang] : row.value["fi"],
    });
  });

  if (output.length > 0) {
    res.status(200).json(output);
  } else {
    res.sendStatus(404);
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
export const getSaavutettavuudenAvustavaTeknologia = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if (await client.exists(rediskey) !== true) {
    res.sendStatus(404);

    return next();
  }

  const input = JSON.parse(await client.get(rediskey));
  const row = input.find((e: any) => e.key === req.params.key);
  let output: object;

  if (row !== undefined) {
    output = {
      "key": row.key,
      "value": row.value[req.params.lang] !== undefined ? row.value[req.params.lang] : row.value["fi"],
    };
  }

  if (output !== undefined) {
    res.status(200).json(output);
  } else {
    res.sendStatus(404);
  }
};
