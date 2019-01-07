import { Request, Response } from "express";
import request from "request";
import { parseString, processors } from "xml2js";

function getResults(url: string) {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${process.env.FINTO_URL}${url}`,
      headers: {
        "Accept": "application/rdf+xml"
      }
    };

    request.get(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        const options = {
          tagNameProcessors: [processors.stripPrefix],
          attrNameProcessors: [processors.stripPrefix],
          valueProcessors: [processors.stripPrefix],
          attrValueProcessors: [processors.stripPrefix]
        };

        parseString(body, options, (error, result) => {
          if (error) {
            console.log(error);
          }

          resolve(result);
        });
      }
    });
  });
}

export const getYsoOntologia = (req: Request, res: Response) => {
  getResults("/yso/data")
    .then(data => {
      res.status(200).json({data});
    });
};
