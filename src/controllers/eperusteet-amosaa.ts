import { Request, Response } from "express";
import rp from "request-promise";

async function getData(endpoint: string, lang: string) {
  try {
    const options = {
      url: process.env.EPERUSTEET_AMOSAA_URL + endpoint,
      headers: {
        "Accept": "application/json"
      }
    };

    const body = await rp.get(options);
    const results = JSON.parse(body);

    return results.data.map((koodi: any) => {
      return {
        "arvo": koodi.perusteDiaarinumero,
        "selite": koodi.nimi[lang],
      };
    });
  } catch (error) {
    console.log(error);
  }
}

export const getOpetussuunnitelmat = async (req: Request, res: Response) => {
  res.status(200).json(await getData("/opetussuunnitelmat", "fi"));
};
