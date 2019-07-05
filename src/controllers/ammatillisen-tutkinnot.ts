import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";

const endpoint = "perusteet";
const rediskey = "ammatillisentutkinnot";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 *
 * @todo Implement error handling
 */
export async function setAmmatillisenTutkinnot(): Promise<any> {
  const data: Array<object> = [];
  const results: Array<object> = [];
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

  results.map((result: any) => {
    data.push({
      key: result.id,
      value: {
        fi: result.nimi.fi,
        en: result.nimi.en,
        sv: result.nimi.sv,
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
export const getAmmatillisenTutkinnot = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const redisData = await getAsync(rediskey);

  if (redisData) {
    const input = JSON.parse(redisData);
    const output: any[] = [];

    input.map((row: any) => {
      output.push({
        key: row.key,
        value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value.fi,
      });
    });

    output.sort((a: any, b: any) => a.value.localeCompare(b.value));

    if (output.length > 0) {
      res.status(200).json(output);
    } else {
      res.sendStatus(406);
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
export const getAmmatillisenTutkinto = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
      res.sendStatus(406);
    }
  } else {
    res.sendStatus(404);

    return next();
  }
};
