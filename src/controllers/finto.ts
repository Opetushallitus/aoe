import rp from "request-promise";
import { parseString, processors } from "xml2js";

import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();

export async function setYso() {
  try {
    const options = {
      url: `${process.env.FINTO_URL}/yso/data`,
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
      parseString(body, parseOptions, async (err, result) => {
        if (err) {
          reject(err);
        } else {
          const data: object[] = [];

          result.RDF.Concept.map(async (concept: any) => {
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

          await client.set("yso", JSON.stringify(data));
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
}
