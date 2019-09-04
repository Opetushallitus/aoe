import { NextFunction, Request, Response } from "express";
import striptags from "striptags";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { AlignmentObjectExtended } from "../models/alignment-object-extended";
import { sortByTargetName } from "../util/data.utils";

const endpoint = "perusteet";
const rediskey = "oppiaineet";
const params = "419550/perusopetus/oppiaineet";
// const blacklist = [
//   600171,
//   855591,
//   855592,
//   855593,
//   605639,
//   692136,
//   692131,
//   605631,
//   692130,
//   605637,
//   605634,
//   605636,
//   692139,
//   712901,
//   739612,
//   739613,
//   739610,
//   739611,
//   692132,
//   692134,
// ];

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

    // subjectIds = subjectIds.filter(id => blacklist.includes(id.key) === false);

    const subjects = subjectIds.map(async (row: any) => {
      const result = await getDataFromApi(
        process.env.EPERUSTEET_SERVICE_URL,
        `/${endpoint}/`,
        { "Accept": "application/json" },
        `${params}/${row.key}`
      );

      const finnishGradeEntities = result.vuosiluokkakokonaisuudet.map((gradeEntity: any) => {
        const objectives: AlignmentObjectExtended[] = [];
        const contents: AlignmentObjectExtended[] = [];

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
              source: "basicStudyObjectives",
              alignmentType: "teaches",
              targetName: objectiveValue.fi ? objectiveValue.fi : objectiveValue.sv,
            });
          });
        }

        if (gradeEntity.sisaltoalueet.length > 0) {
          gradeEntity.sisaltoalueet.forEach((content: any) => {
            if (content.nimi.fi) {
              content.nimi.fi = striptags(content.nimi.fi);
            }

            if (content.nimi.sv) {
              content.nimi.sv = striptags(content.nimi.sv);
            }

            contents.push({
              key: content.id,
              source: "basicStudyContents",
              alignmentType: "teaches",
              targetName: content.nimi.fi ? content.nimi.fi : content.nimi.sv,
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
        source: "basicStudySubjects",
        alignmentType: "educationalSubject",
        targetName: result.nimi.fi,
        vuosiluokkakokonaisuudet: finnishGradeEntities,
      };
    });

    const finnish = await Promise.all(subjects);
    finnish.sort(sortByTargetName);

    await setAsync(`${rediskey}.fi`, JSON.stringify(finnish));
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
    // const redisData = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);
    const redisData = await getAsync(`${rediskey}.fi`);

    if (redisData) {
      res.status(200).json(JSON.parse(redisData));
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};
