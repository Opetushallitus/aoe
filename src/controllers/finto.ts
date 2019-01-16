import { Request, Response } from "express";
import rp from "request-promise";
import { parseString, processors } from "xml2js";

async function getData(endpoint: string, lang: string) {
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

    return await new Promise((resolve, reject) => {
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
    });
  } catch (error) {
    console.log(error);
  }
}

export const getYsoOntologia = async (req: Request, res: Response) => {
  res.status(200).json(await getData("/yso/data", "fi"));
};
