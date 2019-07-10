import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";

const endpoint = "kielikoodistoopetushallinto";
const rediskey = "kielet";
const params = "koodi";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 *
 * @todo Implement error handling
 */
export async function setKielet(): Promise<any> {
  const results = await getDataFromApi(
    process.env.KOODISTO_SERVICE_URL,
    `/${endpoint}/`,
    { "Accept": "application/json" },
    params
  );
  const data: any[] = [];

  results.map((result: any) => {
    const metadataFi = result.metadata.find((e: any) => e.kieli.toLowerCase() === "fi");
    const metadataEn = result.metadata.find((e: any) => e.kieli.toLowerCase() === "en");
    const metadataSv = result.metadata.find((e: any) => e.kieli.toLowerCase() === "sv");

    data.push({
      key: result.koodiArvo,
      value: {
        fi: metadataFi != undefined ? metadataFi.nimi : undefined,
        en: metadataEn != undefined ? metadataEn.nimi : undefined,
        sv: metadataSv != undefined ? metadataSv.nimi : undefined,
      }
    });
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
export const getKielet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);
    const output: any[] = [];

    input.map((row: any) => {
      output.push({
        key: row.key,
        value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value["fi"],
      });
    });

    output.sort((a: any, b: any) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()));

    // cherry pick FI, SV and EN to be in the front
    const fiIndex = output.findIndex((row: any) => row.key.toLowerCase() === "fi");
    output.splice(0, 0, output.splice(fiIndex, 1)[0]);

    const svIndex = output.findIndex((row: any) => row.key.toLowerCase() === "sv");
    output.splice(1, 0, output.splice(svIndex, 1)[0]);

    const enIndex = output.findIndex((row: any) => row.key.toLowerCase() === "en");
    output.splice(2, 0, output.splice(enIndex, 1)[0]);

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
export const getKieli = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);
    const row = input.find((e: any) => e.key === req.params.key);
    let output: object;

    if (row != undefined) {
      output = {
        key: row.key,
        value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value["fi"],
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
};
