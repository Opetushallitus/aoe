import { Request, Response } from "express";
import rp from "request-promise";

import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();

client.select(1);

async function getData(endpoint: string, lang: string, key: string) {
  if (await client.exists(key)) {
    return await client.getFromRedis(key);
  } else {
    try {
      let data: object[] = [];
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

        // we're on the last page, stop looping
        if (body.data.length < pageSize) {
          getResults = false;
        }
      }

      data = data.map((koodi: any) => {
        return {
          "arvo": koodi.perusteDiaarinumero,
          "selite": koodi.nimi[lang],
        };
      });

      await client.setToRedis(key, data);

      return await client.getFromRedis(key);
    } catch (error) {
      console.log(error);
    }
  }
}

export const getOpetussuunnitelmat = async (req: Request, res: Response) => {
  res.status(200).json(await getData("/opetussuunnitelmat", "fi", "opetussuunnitelmat"));
};
