import { Request, Response } from "express";
import rp from "request-promise";

async function getData(endpoint: string, lang: string) {
  try {
    const options = {
      url: `${process.env.KOODISTO_SERVICE_URL}${endpoint}`,
      headers: {
        "Accept": "application/json"
      }
    };

    const body = await rp.get(options);
    const results = JSON.parse(body);

    return results.map((koodi: any) => {
      const metadata = koodi.metadata.find((e: any) => e.kieli.toLowerCase() === lang);

      return {
        "arvo": koodi.koodiUri,
        "selite": metadata ? metadata.nimi : undefined,
      };
    });
  } catch (error) {
    console.log(error);
  }
}

export const getLukionkurssit = async (req: Request, res: Response) => {
  res.status(200).json(await getData("/lukionkurssit/koodi?onlyValidKoodis=false", "sv"));
};
