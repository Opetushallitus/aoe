import { NextFunction, Request, Response } from "express";
import { createClient } from "redis";

import { getDataFromApi } from "../util/api.utils";

const client = createClient(process.env.REDIS_URL);

const endpoint = "perusteet";
const rediskey = "oppiaineet";
const params = "419550/perusopetus/oppiaineet";

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
export async function setPerusopetuksenOppiaineet(): Promise<any> {
  client.get(rediskey, async (error: any, data: any) => {
    if (!data) {
      const results = await getDataFromApi(
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
            value: {
              fi: result.nimi.fi,
              sv: result.nimi.sv,
            },
            vuosiluokkakokonaisuudet: [],
          });
        } else {
          result.oppimaarat.forEach((oppimaara: any) => {
            data.push({
              key: oppimaara.id,
              value: {
                fi: oppimaara.nimi.fi,
                sv: oppimaara.nimi.sv,
              },
              vuosiluokkakokonaisuudet: [],
            });
          });
        }
      });

      data.forEach(async (row: any) => {
        const results = await getDataFromApi(
          process.env.EPERUSTEET_SERVICE_URL,
          `/${endpoint}/`,
          { "Accept": "application/json" },
          `${params}/${row.key}/vuosiluokkakokonaisuudet`
        );
        const vuosiluokkakokonaisuudet: any[] = [];

        results.forEach((result: any) => {
          const tavoitteet: any[] = [];
          const sisaltoalueet: any[] = [];

          result.tavoitteet.forEach((tavoite: any) => {
            tavoitteet.push({
              key: tavoite.id,
              value: {
                fi: tavoite.tavoite.fi,
                sv: tavoite.tavoite.sv,
              }
            });
          });

          result.sisaltoalueet.forEach((sisaltoalue: any) => {
            sisaltoalueet.push({
              key: sisaltoalue.id,
              value: {
                fi: sisaltoalue.nimi.fi,
                sv: sisaltoalue.nimi.sv,
              }
            });
          });

          vuosiluokkakokonaisuudet.push({
            key: result._vuosiluokkaKokonaisuus,
            tavoitteet: tavoitteet,
            sisaltoalueet: sisaltoalueet,
          });
        });

        // parent.vuosiluokkakokonaisuudet = vuosiluokkakokonaisuudet;
      });

      // @ts-ignore
      // await client.setex(rediskey, process.env.REDIS_EXPIRE_TIME, JSON.stringify(data));
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
export const getPerusopetuksenOppiaineet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  client.get(rediskey, async (error: any, data: any) => {
    if (data) {
      const input = JSON.parse(data);
      const output: any[] = [];

      input.map((row: any) => {
        output.push({
          key: row.key,
          value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value.fi,
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
