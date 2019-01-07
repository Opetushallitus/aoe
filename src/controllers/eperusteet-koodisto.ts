import { Request, Response } from "express";
import request from "request";

function getResults(url: string) {
  return new Promise((resolve, reject) => {
    request.get(`${process.env.KOODISTO_SERVICE_URL}${url}`, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}

export const getTesti = (req: Request, res: Response) => {
  request.get(`${process.env.KOODISTO_SERVICE_URL}/tutkinto/koodi?onlyValidKoodis=false`, (error, response, body) => {
    if (error) {
      console.log(error);
    }

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

    res.status(200).json({ data });
  });
};

export const getLukionkurssit = (req: Request, res: Response) => {
  getResults("/lukionkurssit/koodi?onlyValidKoodis=false")
  .then(data => {
    res.status(200).json({data});
  });
};
