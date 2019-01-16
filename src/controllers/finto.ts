import { Request, Response } from "express";
import rp from "request-promise";
import { parseString, processors } from "xml2js";

import { RedisWrapper } from "../utils/redis-wrapper";

const client = new RedisWrapper();

async function getData(endpoint: string, lang: string, key: string) {
  if (await client.exists(key)) {
    return await client.getFromRedis(key);
  } else {
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

      const data = await new Promise((resolve, reject) => {
        parseString(body, parseOptions, (err, result) => {
          if (err) {
            reject(err);
          } else {
            const data: object[] = [];

            result.RDF.Concept.map((concept: any) => {
              const label = concept.prefLabel.find((e: any) => e.$.lang === lang);

              data.push({
                "arvo": concept.$.about,
                "selite": label._,
              });
            });

            resolve(data);
          }
        });

        return data;
      });

      console.log(data);

      await client.setToRedis(key, data);

      return client.getFromRedis(key);
    } catch (error) {
      console.log(error);
    }
  }
}

export const getYsoOntologia = async (req: Request, res: Response) => {
  res.status(200).json(await getData("/yso/data", "fi", "yso"));
};
