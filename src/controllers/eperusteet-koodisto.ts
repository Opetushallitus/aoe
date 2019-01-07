import { Request, Response } from "express";
import request from "request";

function getResults(url: string): Promise<Object[]> {
  return new Promise((resolve, reject) => {
    request.get(`${process.env.KOODISTO_SERVICE_URL}${url}`, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        const results = JSON.parse(body);

        const data = results.map((koodi: any) => {
          const metadata: any = {};

          koodi.metadata.forEach((obj: any) => {
            metadata[obj.kieli.toLowerCase()] = obj.nimi;
          });

          return {
            "koodiUri": koodi.koodiUri,
            "metadata": metadata
          };
        });

        resolve(data);
      }
    });
  });
}

export const getLukionkurssit = (req: Request, res: Response) => {
  getResults("/lukionkurssit/koodi?onlyValidKoodis=false")
    .then(data => {
      res.status(200).json({data});
    });
};
