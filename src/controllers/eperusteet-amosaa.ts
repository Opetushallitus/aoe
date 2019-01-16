import { Request, Response } from "express";
import rp from "request-promise";

async function getData(endpoint: string, lang: string) {
  try {
    const data: object[] = [];
    const pageSize: number = 100;
    let page: number = 0;
    let getResults: boolean = true;

    while (getResults) {
      let body = await rp.get({
        url: `${process.env.EPERUSTEET_AMOSAA_URL}${endpoint}?sivukoko=${pageSize}&sivu=${page}`,
        headers: {
          "Accept": "application/json"
        }
      });

      body = JSON.parse(body);
      await data.push.apply(data, body.data);
      page = body.sivu + 1;

      if (body.data.length < pageSize) {
        getResults = false;
      }
    }

    return data.map((koodi: any) => {
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
