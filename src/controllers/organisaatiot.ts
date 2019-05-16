import { NextFunction, Request, Response } from "express";
import { createClient } from "redis";

import { getDataFromApi } from "../util/api.utils";

const client = createClient(process.env.REDIS_URL);

const endpoint = "organisaatio";
const rediskey = "organisaatiot";
const params = "hae?vainAktiiviset=true&vainLakkautetut=false&suunnitellut=false";

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
export async function setOrganisaatiot(): Promise<any> {
  client.get(rediskey, async (error: any, data: any) => {
    if (!data) {
      const results = await getDataFromApi(process.env.ORGANISAATIO_SERVICE_URL, `/${endpoint}/`, { "Accept": "application/json" }, params);
      const data: object[] = [];

      results.organisaatiot.map((result: any) => {
        data.push({
          "key": result.oid,
          "value": {
            "fi": result.nimi.fi != undefined ? result.nimi.fi : undefined,
            "en": result.nimi.en != undefined ? result.nimi.en : undefined,
            "sv": result.nimi.sv != undefined ? result.nimi.sv : undefined,
          }
        });
      });

      await client.set(rediskey, JSON.stringify(data));
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
export const getOrganisaatiot = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  client.get(rediskey, async (error: any, data: any) => {
    if (data) {
      const input = JSON.parse(data);
      const output: object[] = [];

      input.map((row: any) => {
        let value: string;

        if (row.value[req.params.lang] === undefined) {
          value = row.value.fi || row.value.en || row.value.sv;
        } else {
          value = row.value[req.params.lang];
        }

        output.push({
          "key": row.key,
          "value": value,
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
export const getOrganisaatio = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  client.get(rediskey, async (error: any, data: any) => {
    if (data) {
      const input = JSON.parse(data);
      const row = input.find((e: any) => e.key === req.params.key);
      let output: object;

      if (row != undefined) {
        let value: string;

        if (row.value[req.params.lang] === undefined) {
          value = row.value.fi || row.value.en || row.value.sv;
        } else {
          value = row.value[req.params.lang];
        }

        output = {
          "key": row.key,
          "value": value,
        };
      }

      if (output != undefined) {
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
