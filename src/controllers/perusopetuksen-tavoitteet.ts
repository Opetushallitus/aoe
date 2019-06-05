import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";

const endpoint = "perusteet";
const rediskey = "oppiaineet";
const params = "419550/perusopetus/oppiaineet";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 *
 * @todo Implement error handling
 */
export async function setPerusopetuksenOppiaineet(): Promise<any> {
  // commented out until figured out how this works

  /*const results = await getDataFromApi(
    process.env.EPERUSTEET_SERVICE_URL,
    `/${endpoint}/`,
    { "Accept": "application/json" },
    params
  );
  const data: any[] = [];

  results.forEach((result: any) => {
    if (result.oppimaarat === undefined) {
      data.push({
        key: result.id,
        code: result.koodiArvo,
        value: {
          fi: result.nimi.fi,
          sv: result.nimi.sv,
        },
      });
    } else {
      result.oppimaarat.forEach((oppimaara: any) => {
        data.push({
          key: oppimaara.id,
          code: result.koodiArvo,
          value: {
            fi: oppimaara.nimi.fi,
            sv: oppimaara.nimi.sv,
          },
        });
      });
    }
  });*/

  // temp for testing purposes

  const data = [
    { key: 466344 },
    { key: 466346 },
    { key: 466347 },
  ];

  const oppiaineet: any[] = [];

  data.forEach(async (row: any) => {
    const result = await getDataFromApi(
      process.env.EPERUSTEET_SERVICE_URL,
      `/${endpoint}/`,
      { "Accept": "application/json" },
      `${params}/${row.key}`
    );

    const vuosiluokkakokonaisuudet = result.vuosiluokkakokonaisuudet.map((vlk: any) => {
      const tavoitteet: any[] = [];
      const sisaltoalueet: any[] = [];

      vlk.tavoitteet.forEach((tavoite: any) => {
        tavoitteet.push({
          key: tavoite.id,
          value: {
            fi: tavoite.tavoite.fi,
            sv: tavoite.tavoite.sv,
          },
        });
      });

      return {
        key: vlk.id,
        value: {
          fi: vlk.tehtava.otsikko.fi,
          sv: vlk.tehtava.otsikko.sv,
        },
        tavoitteet: tavoitteet,
        sisaltoalueet: sisaltoalueet,
      };
    });

    console.log(vuosiluokkakokonaisuudet);
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
export const getPerusopetuksenOppiaineet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
