import { NextFunction, Request, Response } from "express";
import striptags from "striptags";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";

const endpoint = "perusteet";
const rediskey = "oppiaineet";
const params = "419550/perusopetus/oppiaineet";
const blacklist = [
  600171,
  855591,
  855592,
  855593,
  605639,
  692136,
  692131,
  605631,
  692130,
  605637,
  605634,
  605636,
  692139,
  712901,
  739612,
  739613,
  739610,
  739611,
  692132,
  692134,
];

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 */
export async function setPerusopetuksenOppiaineet(): Promise<any> {
  try {
    const results = await getDataFromApi(
      process.env.EPERUSTEET_SERVICE_URL,
      `/${endpoint}/`,
      { "Accept": "application/json" },
      params
    );
    let subjectIds: any[] = [];

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

    subjectIds = subjectIds.filter(id => blacklist.includes(id.key) === false);

    const subjects = subjectIds.map(async (row: any) => {
      const result = await getDataFromApi(
        process.env.EPERUSTEET_SERVICE_URL,
        `/${endpoint}/`,
        { "Accept": "application/json" },
        `${params}/${row.key}`
      );

      const gradeEntities = result.vuosiluokkakokonaisuudet.map((gradeEntity: any) => {
        const objectives: any[] = [];
        const contents: any[] = [];

        if (gradeEntity.tavoitteet.length > 0) {
          gradeEntity.tavoitteet.forEach((objective: any) => {
            const objectiveValue = objective.tavoite;

            if (objectiveValue.fi) {
              objectiveValue.fi = striptags(objectiveValue.fi);
            }

            if (objectiveValue.sv) {
              objectiveValue.sv = striptags(objectiveValue.sv);
            }

            objectives.push({
              key: objective.id,
              value: objectiveValue,
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
          tavoitteet: objectives,
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
  } catch (err) {
    console.error(err);
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
export const getPerusopetuksenOppiaineet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const redisData = await getAsync(rediskey);

    if (redisData) {
      const input = JSON.parse(redisData);

      const output = input.map((row: any) => {
        return {
          key: row.key,
          value: row.value[req.params.lang] != undefined ? row.value[req.params.lang] : row.value.fi,
          vuosiluokkakokonaisuudet: row.vuosiluokkakokonaisuudet,
        };
      });

      output.sort((a: any, b: any) => a.value.localeCompare(b.value, req.params.lang));

      if (output.length > 0) {
        res.status(200).json(output);
      } else {
        res.sendStatus(406);
      }
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};
