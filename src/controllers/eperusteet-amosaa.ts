import { Request, Response } from "express";
import request from "request";

function getResults(url: string, lang: string): Promise<Object[]> {
  return new Promise((resolve, reject) => {
    request.get(`${process.env.EPERUSTEET_AMOSAA_URL}${url}`, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        const results = JSON.parse(body);

        const data = results.data.map((koodi: any) => {
          return {
            "arvo": koodi.id,
            "selite": koodi.nimi[lang]
          };
        });

        resolve(data);
      }
    });
  });
}

export const getOpetussuunnitelmat = (req: Request, res: Response) => {
  getResults("/opetussuunnitelmat", "fi")
    .then(data => {
      res.status(200).json(data);
    });
};
