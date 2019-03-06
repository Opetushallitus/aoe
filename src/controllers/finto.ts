import { Request, Response } from "express";
import rp from "request-promise";
import { parseString, processors } from "xml2js";

import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();

client.select(0);

export async function setYsoData(endpoint: string) {
  try {
    const options = {
      url: `${process.env.FINTO_URL}${endpoint}`,
      headers: {
        "Accept": "application/rdf+xml"
      }
    };

    const body = await rp.get(options);

    const parseOptions = {
      tagNameProcessors: [processors.stripPrefix],
      attrNameProcessors: [processors.stripPrefix],
      valueProcessors: [processors.stripPrefix],
      attrValueProcessors: [processors.stripPrefix]
    };

    await new Promise((resolve, reject) => {
      parseString(body, parseOptions, (err, result) => {
        if (err) {
          reject(err);
        } else {
          result.RDF.Concept.map(async (concept: any) => {
            const key = concept.$.about.substring(concept.$.about.lastIndexOf("/") + 1, concept.$.about.length);
            const labelFi = concept.prefLabel.find((e: any) => e.$.lang === "fi");
            const labelEn = concept.prefLabel.find((e: any) => e.$.lang === "en");
            const labelSv = concept.prefLabel.find((e: any) => e.$.lang === "sv");

            await this.client.setToRedis(key, { fi: labelFi._, en: labelEn._, sv: labelSv._ });
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
}

async function getYsoData(endpoint: string) {
  return await client.getAllFromRedis();
}

async function getKeyword(key: string) {
  if (await client.exists(key)) {
    return await client.getFromRedis(key);
  }
}


export const getYsoOntologia = async (req: Request, res: Response) => {
  res.status(200).json(await getYsoData("/yso/data"));
};

export const getYsoKeyword = async (req: Request, res: Response) => {
  const data = await getKeyword(req.params.key);
  res.status(200).json(data);
};
