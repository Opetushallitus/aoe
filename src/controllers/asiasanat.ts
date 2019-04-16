import { NextFunction, Request, Response } from "express";
import { parseString, processors } from "xml2js";

import { getDataFromApi } from "./common";
import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();
const endpoint = "yso";
const rediskey = "asiasanat";

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 *
 * @todo Implement error handling
 */
export async function setAsiasanat(): Promise<any> {
  if (!client.exists(rediskey)) {
    try {
      const results = await getDataFromApi(process.env.FINTO_URL, `/${endpoint}/data`, { "Accept": "application/rdf+xml" });
      const data: object[] = [];

      const parseOptions = {
        tagNameProcessors: [processors.stripPrefix],
        attrNameProcessors: [processors.stripPrefix],
        valueProcessors: [processors.stripPrefix],
        attrValueProcessors: [processors.stripPrefix]
      };

      parseString(results, parseOptions, async (err, result) => {
        result.RDF.Concept.map((concept: any) => {
          const key = concept.$.about.substring(concept.$.about.lastIndexOf("/") + 1, concept.$.about.length);
          const labelFi = concept.prefLabel.find((e: any) => e.$.lang === "fi");
          const labelEn = concept.prefLabel.find((e: any) => e.$.lang === "en");
          const labelSv = concept.prefLabel.find((e: any) => e.$.lang === "sv");

          data.push({
            "key": key,
            "value": {
              "fi": labelFi !== undefined ? labelFi._ : undefined,
              "en": labelEn !== undefined ? labelEn._ : undefined,
              "sv": labelSv !== undefined ? labelSv._ : undefined,
            }
          });
        });

        await client.set(rediskey, JSON.stringify(data));
      });
    } catch (error) {
      console.error(error);
    }
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
export const getAsiasanat = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if (await client.exists(rediskey) !== true) {
    res.sendStatus(404);

    return next();
  }

  const input = JSON.parse(await client.get(rediskey));
  const output: object[] = [];

  input.map((row: any) => {
    output.push({
      "key": row.key,
      "value": row.value[req.params.lang] !== undefined ? row.value[req.params.lang] : row.value["fi"],
    });
  });

  if (output.length > 0) {
    res.status(200).json(output);
  } else {
    res.sendStatus(404);
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
export const getAsiasana = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if (await client.exists(rediskey) !== true) {
    res.sendStatus(404);

    return next();
  }

  const input = JSON.parse(await client.get(rediskey));
  const row = input.find((e: any) => e.key === req.params.key);
  let output: object;

  if (row !== undefined) {
    output = {
      "key": row.key,
      "value": row.value[req.params.lang] !== undefined ? row.value[req.params.lang] : row.value["fi"],
    };
  }

  if (output !== undefined) {
    res.status(200).json(output);
  } else {
    res.sendStatus(404);
  }
};
