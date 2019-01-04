import { Request, Response } from "express";
import request from "request";

export let getTesti = (req: Request, res: Response) => {
  request.get("https://virkailija.opintopolku.fi/koodisto-service/rest/json/tutkinto/koodi?onlyValidKoodis=false", (error, response, body) => {
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
