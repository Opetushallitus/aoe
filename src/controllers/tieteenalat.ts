import { NextFunction, Request, Response } from "express";
import { createClient } from "redis";

import { getDataFromApi } from "../util/api.utils";

const client = createClient();

const endpoint = "tieteenala";
const rediskey = "tieteenalat";

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
export async function setTieteenalat(): Promise<any> {
  client.get(rediskey, async (error: any, data: any) => {
    if (!data) {
      const results = await getDataFromApi(process.env.KOODISTO_SERVICE_URL, `/${endpoint}/koodi`, { "Accept": "application/json" });
      const data: Array<any> = [];

      data.push({
        key: "1",
        value: {
          fi: "Luonnontieteet",
          // en: "",
          // sv: "",
        },
        children: []
      });

      data.push({
        key: "2",
        value: {
          fi: "Tekniikka",
          // en: "",
          // sv: "",
        },
        children: []
      });

      data.push({
        key: "3",
        value: {
          fi: "Lääke- ja terveystieteet",
          // en: "",
          // sv: "",
        },
        children: []
      });

      data.push({
        key: "4",
        value: {
          fi: "Maatalous- ja metsätieteet",
          // en: "",
          // sv: "",
        },
        children: []
      });

      data.push({
        key: "5",
        value: {
          fi: "Yhteiskuntatieteet",
          // en: "",
          // sv: "",
        },
        children: []
      });

      data.push({
        key: "6",
        value: {
          fi: "Humanistiset tieteet",
          // en: "",
          // sv: "",
        },
        children: []
      });

      results.map((result: any) => {
        const metadataFi = result.metadata.find((e: any) => e.kieli.toLowerCase() === "fi");
        const metadataEn = result.metadata.find((e: any) => e.kieli.toLowerCase() === "en");
        const metadataSv = result.metadata.find((e: any) => e.kieli.toLowerCase() === "sv");

        const parent = data.find((e: any) => e.key === result.koodiArvo.charAt(0));

        parent.children.push({
          key: result.koodiArvo,
          value: {
            fi: metadataFi.nimi.trim(),
            en: metadataEn.nimi.trim(),
            sv: metadataSv.nimi.trim(),
          }
        });
      });

      data.sort((a: any, b: any) => a.key - b.key);

      data.map((parent: any) => {
        parent.children.sort((a: any, b: any) => a.key - b.key);
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
export const getTieteenalat = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  client.get(rediskey, async (error: any, data: any) => {
    if (data) {
      const input = JSON.parse(data);
      const output: Array<any> = [];

      input.map((row: any) => {
        const children = row.children.map((child: any) => {
          return {
            key: child.key,
            value: child.value[req.params.lang]
          };
        });

        output.push({
          key: row.key,
          value: row.value[req.params.lang] !== undefined ? row.value[req.params.lang] : row.value.fi,
          children: children,
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
export const getTieteenala = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  client.get(rediskey, async (error: any, data: any) => {
    if (data) {
      const input = JSON.parse(data);
      const row = input.find((e: any) => e.key === req.params.key);
      let output: object;

      if (row !== undefined) {
        output = {
          key: row.key,
          value: row.value[req.params.lang] !== undefined ? row.value[req.params.lang] : row.value.fi,
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
