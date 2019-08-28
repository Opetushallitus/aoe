import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { Children, EducationLevel } from "../models/data";

const endpoint = "edtech/codeschemes/Koulutusaste";
const rediskey = "koulutusasteet";
const params = "codes/?format=json";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 */
export async function setKoulutusasteet(): Promise<any> {
  try {
    const results = await getDataFromApi(
      process.env.KOODISTOT_SUOMI_URL,
      `/${endpoint}/`,
      { "Accept": "application/json" },
      params
    );

    const finnish: EducationLevel[] = [];
    const english: EducationLevel[] = [];
    const swedish: EducationLevel[] = [];

    const data = results.results.map((result: any) => {
      return {
        key: result.id,
        parent: ("broaderCode" in result) ? result.broaderCode.id : undefined,
        value: {
          fi: result.prefLabel.fi,
          en: result.prefLabel.en,
          sv: result.prefLabel.sv,
        }
      };
    });

    data.forEach((row: any) => {
      const childrenArray = data.filter((e: any) => e.parent === row.key);
      const childrenFi: Children[] = [];
      const childrenEn: Children[] = [];
      const childrenSv: Children[] = [];

      childrenFi.push({
        key: row.key,
        value: row.value.fi !== undefined ? row.value.fi : (row.value.sv !== undefined ? row.value.sv : row.value.en),
      });

      childrenEn.push({
        key: row.key,
        value: row.value.en !== undefined ? row.value.en : (row.value.fi !== undefined ? row.value.fi : row.value.sv),
      });

      childrenSv.push({
        key: row.key,
        value: row.value.sv !== undefined ? row.value.sv : (row.value.fi !== undefined ? row.value.fi : row.value.en),
      });

      childrenArray.forEach((child: any) => {
        childrenFi.push({
          key: child.key,
          value: child.value.fi !== undefined ? child.value.fi : (child.value.sv !== undefined ? child.value.sv : child.value.en),
        });

        childrenEn.push({
          key: child.key,
          value: child.value.en !== undefined ? child.value.en : (child.value.fi !== undefined ? child.value.fi : child.value.sv),
        });

        childrenSv.push({
          key: child.key,
          value: child.value.sv !== undefined ? child.value.sv : (child.value.fi !== undefined ? child.value.fi : child.value.en),
        });
      });

      if (row.parent === undefined) {
        finnish.push({
          key: row.key,
          value: row.value.fi !== undefined ? row.value.fi : (row.value.sv !== undefined ? row.value.sv : row.value.en),
          children: childrenFi,
        });

        english.push({
          key: row.key,
          value: row.value.en !== undefined ? row.value.en : (row.value.fi !== undefined ? row.value.fi : row.value.sv),
          children: childrenEn,
        });

        swedish.push({
          key: row.key,
          value: row.value.sv !== undefined ? row.value.sv : (row.value.fi !== undefined ? row.value.fi : row.value.en),
          children: childrenSv,
        });
      }
    });

    await setAsync(`${rediskey}.fi`, JSON.stringify(finnish));
    await setAsync(`${rediskey}.en`, JSON.stringify(english));
    await setAsync(`${rediskey}.sv`, JSON.stringify(swedish));
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
export const getKoulutusasteet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
export const getKoulutusaste = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const redisData = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      const input = JSON.parse(redisData);
      const row = input.find((e: any) => e.key === req.params.key);

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
