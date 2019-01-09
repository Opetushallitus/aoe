import { Request, Response } from "express";
import request from "request";
import { parseString, processors } from "xml2js";

export const getYsoOntologia = (req: Request, res: Response) => {
  const options = {
    url: `${process.env.FINTO_URL}/yso/data`,
    headers: {
      "Accept": "application/rdf+xml"
    }
  };

  // TODO: Error handling
  request.get(options, (error, response, body) => {
    const options = {
      tagNameProcessors: [processors.stripPrefix],
      attrNameProcessors: [processors.stripPrefix],
      valueProcessors: [processors.stripPrefix],
      attrValueProcessors: [processors.stripPrefix]
    };

    parseString(body, options, (err, result) => {
      const data = result.RDF.Concept.map((concept: any) => {
        const labels: any = {};

        concept.prefLabel.forEach((label: any) => {
          labels[label.$.lang] = label._;
        });

        return {
          "concept": labels
        };
      });

      res.status(response.statusCode).json({data});
    });
  });
};
