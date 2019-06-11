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
  const results = await getDataFromApi(
    process.env.EPERUSTEET_SERVICE_URL,
    `/${endpoint}/`,
    { "Accept": "application/json" },
    params
  );
  const subjectIds: any[] = [];

  results.forEach((result: any) => {
    if (result.oppimaarat === undefined) {
      subjectIds.push({
        key: result.id,
      });
    } else {
      result.oppimaarat.forEach((oppimaara: any) => {
        subjectIds.push({
          key: oppimaara.id,
        });
      });
    }
  });

  const subjects = subjectIds.map(async (row: any) => {
    const result = await getDataFromApi(
      process.env.EPERUSTEET_SERVICE_URL,
      `/${endpoint}/`,
      { "Accept": "application/json" },
      `${params}/${row.key}`
    );

    const gradeEntities = result.vuosiluokkakokonaisuudet.map((gradeEntity: any) => {
      const targets: any[] = [];
      const contents: any[] = [];

      if (gradeEntity.tavoitteet.length > 0) {
        gradeEntity.tavoitteet.forEach((target: any) => {
          targets.push({
            key: target.id,
            value: target.tavoite,
          });
        });
      }

      if (gradeEntity.sisaltoalueet.length > 0) {
        gradeEntity.sisaltoalueet.forEach((content: any) => {
          contents.push({
            key: content.id,
            value: content.nimi,
          });
        });
      }

      return {
        key: gradeEntity.id,
        vuosiluokkakokonaisuus: gradeEntity._vuosiluokkaKokonaisuus,
        tavoitteet: targets,
        sisaltoalueet: contents,
      };
    });

    return {
      key: result.id,
      code: result.koodiArvo,
      value: {
        fi: result.nimi.fi,
        sv: result.nimi.sv,
      },
      vuosiluokkakokonaisuudet: gradeEntities,
    };
  });

  await setAsync(rediskey, JSON.stringify(await Promise.all(subjects)));
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
        vuosiluokkakokonaisuudet: row.vuosiluokkakokonaisuudet,
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
