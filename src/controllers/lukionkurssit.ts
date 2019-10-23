import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { getUnique, sortByTargetName } from "../util/data.utils";
import { AlignmentObjectExtended } from "../models/alignment-object-extended";

const endpoint = "lukionkurssit";
const rediskey = "lukionkurssit";
const params = "koodi";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 */
export async function setLukionkurssit(): Promise<any> {
  try {
    const results = await getDataFromApi(
      process.env.KOODISTO_SERVICE_URL,
      `/${endpoint}/`,
      {
        "Accept": "application/json",
        "Caller-Id": `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`
      },
      params
    );

    const finnish: AlignmentObjectExtended[] = [];
    const english: AlignmentObjectExtended[] = [];
    const swedish: AlignmentObjectExtended[] = [];

    results.forEach((row: any) => {
      const metadataFi = row.metadata.find((e: any) => e.kieli.toLowerCase() === "fi");
      const metadataEn = row.metadata.find((e: any) => e.kieli.toLowerCase() === "en");
      const metadataSv = row.metadata.find((e: any) => e.kieli.toLowerCase() === "sv");

      finnish.push({
        key: row.koodiArvo,
        source: "upperSecondarySchoolSubjects",
        alignmentType: "educationalSubject",
        targetName: metadataFi ? metadataFi.nimi.trim() : (metadataSv ? metadataSv.nimi.trim() : metadataEn.nimi.trim()),
      });

      english.push({
        key: row.koodiArvo,
        source: "upperSecondarySchoolSubjects",
        alignmentType: "educationalSubject",
        targetName: metadataEn ? metadataEn.nimi.trim() : (metadataFi ? metadataFi.nimi.trim() : metadataSv.nimi.trim()),
      });

      swedish.push({
        key: row.koodiArvo,
        source: "upperSecondarySchoolSubjects",
        alignmentType: "educationalSubject",
        targetName: metadataSv ? metadataSv.nimi.trim() : (metadataFi ? metadataFi.nimi.trim() : metadataEn.nimi.trim()),
      });
    });

    finnish.sort(sortByTargetName);
    english.sort(sortByTargetName);
    swedish.sort(sortByTargetName);

    const filteredFi = getUnique(finnish, "targetName");
    const filteredEn = getUnique(english, "targetName");
    const filteredSv = getUnique(swedish, "targetName");

    await setAsync(`${rediskey}.fi`, JSON.stringify(filteredFi));
    await setAsync(`${rediskey}.en`, JSON.stringify(filteredEn));
    await setAsync(`${rediskey}.sv`, JSON.stringify(filteredSv));
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
export const getLukionkurssit = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const redisData = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

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
 * Get single row from redis database key-value
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<any>}
 */
export const getLukionkurssi = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const redisData = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      const input = JSON.parse(redisData);
      const row = input.find((e: any) => e.key.toLowerCase() === req.params.key.toLowerCase());

      if (row !== undefined) {
        res.status(200).json(row);
      } else {
        res.sendStatus(404);
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
