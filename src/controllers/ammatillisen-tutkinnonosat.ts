import { NextFunction, Request, Response } from "express";
import { createClient } from "redis";

import { getDataFromApi } from "./common";

const client = createClient();

const endpoint = "tutkinnonosat";
const rediskey = "ammatillisentutkinnonosat";

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
export async function setAmmatillisenTutkinnonosat(): Promise<any> {
  client.get(rediskey, async (error: any, data: any) => {
    if (!data) {
      const results = await getDataFromApi(process.env.KOODISTO_SERVICE_URL, `/${endpoint}/koodi`, { "Accept": "application/json" });
      const data: Array<any> = [];

      results.map((result: any) => {
        const metadataFi = result.metadata.find((e: any) => e.kieli.toLowerCase() === "fi");
        const metadataEn = result.metadata.find((e: any) => e.kieli.toLowerCase() === "en");
        const metadataSv = result.metadata.find((e: any) => e.kieli.toLowerCase() === "sv");

        data.push({
          key: result.koodiArvo,
          value: {
            fi: metadataFi ? metadataFi.nimi : undefined,
            en: metadataEn ? metadataEn.nimi : undefined,
            sv: metadataSv ? metadataSv.nimi : undefined,
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
export const getAmmatillisenTutkinnonosat = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  client.get(rediskey, async (error: any, data: any) => {
    if (data) {
      const input = JSON.parse(data);
      const output: Array<any> = [];

      input.map((row: any) => {
        output.push({
          key: row.key,
          value: row.value[req.params.lang] !== undefined ? row.value[req.params.lang] : row.value.fi,
        });
      });

      if (output.length > 0) {
        res.status(200).json(output);
      } else {
        res.sendStatus(406);
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
export const getAmmatillisenTutkinnonosa = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
        res.sendStatus(406);
      }
    } else {
      res.sendStatus(404);

      return next();
    }
  });
};
