import { Request, Response } from "express";
import request from "request";

function getResults(url: string): Promise<Object[]> {
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
        resolve(body);
      }
    });
  });
}

export const getYsoOntologia = (req: Request, res: Response) => {
  getResults("/yso/data")
    .then(data => {
      res.status(200)
        .set("Content-type", "application/rdf+xml")
        .send(data);
    });
};
