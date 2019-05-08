import { NextFunction, Request, Response } from "express";
import { createClient } from "redis";

import { getDataFromApi } from "./common";

const client = createClient();

const endpoint = "edtech/codeschemes/SaavutettavuusTukitoiminnot";
const rediskey = "saavutettavuudentukitoiminnot";

client.on("error", (error: any) => {
  console.error(error);
});

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 *
 * @todo Implement error handling
 */
export async function setSaavutettavuudenTukitoiminnot(): Promise<any> {
  client.get(rediskey, async (error: any, data: any) => {
    if (!data) {
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

      // @ts-ignore
      await client.setex(rediskey, process.env.REDIS_EXPIRE_TIME, JSON.stringify(data));
    }
  });
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
  client.get(rediskey, async (error: any, data: any) => {
    if (data) {
      const input = JSON.parse(data);
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
    } else {
      res.sendStatus(404);

      return next();
    }
  });
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
  client.get(rediskey, async (error: any, data: any) => {
    if (data) {
      const input = JSON.parse(data);
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
    } else {
      res.sendStatus(404);

      return next();
    }
  });
};
