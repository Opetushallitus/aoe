import { NextFunction, Request, Response } from "express";
import striptags from "striptags";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { AlignmentObjectExtended } from "../models/alignment-object-extended";
import { sortByTargetName } from "../util/data.utils";

const endpoint = "perusteet";
const rediskeySubjects = "oppiaineet";
const rediskeyObjectives = "tavoitteet";
const rediskeyContents = "sisaltoalueet";
const params = "419550/perusopetus/oppiaineet";

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
      {
        "Accept": "application/json",
        "Caller-Id": `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`
      },
      params
    );

    const subjectIds: any[] = [];
    const finnishSubjects: AlignmentObjectExtended[] = [];
    const swedishSubjects: AlignmentObjectExtended[] = [];
    const finnishObjectives: AlignmentObjectExtended[] = [];
    const swedishObjectives: AlignmentObjectExtended[] = [];
    const finnishContents: AlignmentObjectExtended[] = [];
    const swedishContents: AlignmentObjectExtended[] = [];

    results.forEach((result: any) => {
      if (result.oppimaarat) {
        subjectIds.push({
          key: result.id,
        });

        result.oppimaarat.forEach((oppimaara: any) => {
          subjectIds.push({
            key: oppimaara.id,
            parent: result.id,
          });
        });
      } else {
        subjectIds.push({
          key: result.id,
          parent: 999,
        });
      }
    });

    const subjects: any[] = [{
      key: 999,
      name: {
        fi: "Muut oppiaineet",
        sv: "Muut oppiaineet"
      },
    }];

    for (const row of subjectIds) {
      try {
        const result = await getDataFromApi(
          process.env.EPERUSTEET_SERVICE_URL,
          `/${endpoint}/`,
          { "Accept": "application/json" },
          `${params}/${row.key}`
        );

        subjects.push({
          ...row,
          name: result.nimi,
        });

        result.vuosiluokkakokonaisuudet.forEach((gradeEntity: any) => {
          if (gradeEntity.tavoitteet.length > 0) {
            gradeEntity.tavoitteet.forEach((objective: any) => {
              const objectiveValue = objective.tavoite;

              if (objectiveValue.fi) {
                objectiveValue.fi = striptags(objectiveValue.fi).trim();
              }

              if (objectiveValue.sv) {
                objectiveValue.sv = striptags(objectiveValue.sv).trim();
              }

              finnishObjectives.push({
                key: objective.id,
                parent: {
                  key: result.id,
                  value: result.nimi.fi ? result.nimi.fi : result.nimi.sv,
                },
                gradeEntity: gradeEntity.id,
                source: "basicStudyObjectives",
                alignmentType: "teaches",
                targetName: objectiveValue.fi ? objectiveValue.fi : objectiveValue.sv,
                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${result.id}`,
              });

              swedishObjectives.push({
                key: objective.id,
                parent: {
                  key: result.id,
                  value: result.nimi.sv ? result.nimi.sv : result.nimi.fi,
                },
                gradeEntity: gradeEntity.id,
                source: "basicStudyObjectives",
                alignmentType: "teaches",
                targetName: objectiveValue.sv ? objectiveValue.sv : objectiveValue.fi,
                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${result.id}`,
              });
            });
          }

          if (gradeEntity.sisaltoalueet.length > 0) {
            gradeEntity.sisaltoalueet.forEach((content: any) => {
              if (content.nimi.fi) {
                content.nimi.fi = striptags(content.nimi.fi).trim();
              }

              if (content.nimi.sv) {
                content.nimi.sv = striptags(content.nimi.sv).trim();
              }

              finnishContents.push({
                key: content.id,
                parent: {
                  key: result.id,
                  value: result.nimi.fi ? result.nimi.fi : result.nimi.sv,
                },
                gradeEntity: gradeEntity.id,
                source: "basicStudyContents",
                alignmentType: "teaches",
                targetName: content.nimi.fi ? content.nimi.fi : content.nimi.sv,
                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${result.id}`,
              });

              swedishContents.push({
                key: content.id,
                parent: {
                  key: result.id,
                  value: result.nimi.sv ? result.nimi.sv : result.nimi.fi,
                },
                gradeEntity: gradeEntity.id,
                source: "basicStudyContents",
                alignmentType: "teaches",
                targetName: content.nimi.sv ? content.nimi.sv : content.nimi.fi,
                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${result.id}`,
              });
            });
          }
        });
      } catch (err) {
        console.error(err);
      }
    }

    await Promise.all(subjects).then(data => {
      data.forEach(subject => {
        const childrenFi = data
          .filter(e => e.parent === subject.key)
          .map<AlignmentObjectExtended>(child => {
            return {
              key: child.key,
              source: "basicStudySubjects",
              alignmentType: "educationalSubject",
              targetName: child.name.fi ? child.name.fi : child.name.sv,
              targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${child.key}`,
            };
          })
          .sort(sortByTargetName);

        const childrenSv = data
          .filter(e => e.parent === subject.key)
          .map<AlignmentObjectExtended>(child => {
            return {
              key: child.key,
              source: "basicStudySubjects",
              alignmentType: "educationalSubject",
              targetName: child.name.sv ? child.name.sv : child.name.fi,
              targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${child.key}`,
            };
          })
          .sort(sortByTargetName);

        if (!subject.parent) {
          finnishSubjects.push({
            key: subject.key,
            source: "basicStudySubjects",
            alignmentType: "educationalSubject",
            targetName: subject.name.fi ? subject.name.fi : subject.name.sv,
            children: childrenFi,
          });

          swedishSubjects.push({
            key: subject.key,
            source: "basicStudySubjects",
            alignmentType: "educationalSubject",
            targetName: subject.name.sv ? subject.name.sv : subject.name.fi,
            children: childrenSv,
          });
        }
      });
    });

    finnishSubjects.sort(sortByTargetName);
    swedishSubjects.sort(sortByTargetName);

    await setAsync(`${rediskeySubjects}.fi`, JSON.stringify(finnishSubjects));
    await setAsync(`${rediskeySubjects}.sv`, JSON.stringify(swedishSubjects));

    finnishObjectives
      .sort(sortByTargetName)
      .sort((a, b) => a.gradeEntity - b.gradeEntity);

    swedishObjectives
      .sort(sortByTargetName)
      .sort((a, b) => a.gradeEntity - b.gradeEntity);

    await setAsync(`${rediskeyObjectives}.fi`, JSON.stringify(finnishObjectives));
    await setAsync(`${rediskeyObjectives}.sv`, JSON.stringify(swedishObjectives));

    finnishContents
      .sort(sortByTargetName)
      .sort((a, b) => a.gradeEntity - b.gradeEntity);

    swedishContents
      .sort(sortByTargetName)
      .sort((a, b) => a.gradeEntity - b.gradeEntity);

    await setAsync(`${rediskeyContents}.fi`, JSON.stringify(finnishContents));
    await setAsync(`${rediskeyContents}.sv`, JSON.stringify(swedishContents));
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
    const redisData = await getAsync(`${rediskeySubjects}.${req.params.lang.toLowerCase()}`);

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

/**
 * Get data from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<any>}
 */
export const getPerusopetuksenTavoitteet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const redisData = JSON.parse(await getAsync(`${rediskeyObjectives}.${req.params.lang.toLowerCase()}`));
    const ids = req.params.ids.split(",");

    const data = redisData
      .filter((objective: AlignmentObjectExtended) => ids.includes(objective.parent.key.toString()))
      .map((objective: AlignmentObjectExtended) => {
        objective.parent = objective.parent.value;

        return objective;
      });

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

/**
 * Get data from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<any>}
 */
export const getPerusopetuksenSisaltoalueet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const redisData = JSON.parse(await getAsync(`${rediskeyContents}.${req.params.lang.toLowerCase()}`));
    const ids = req.params.ids.split(",");

    const data = redisData
      .filter((content: AlignmentObjectExtended) => ids.includes(content.parent.key.toString()))
      .map((content: AlignmentObjectExtended) => {
        content.parent = content.parent.value;

        return content;
      });

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};
