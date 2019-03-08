import rp from "request-promise";

import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();

export async function setOpetussuunnitelmat() {
  try {
    let data: object[] = [];
    const pageSize: number = 100;
    let page: number = 0;
    let getResults: boolean = true;

    while (getResults) {
      let body = await rp.get({
        url: `${process.env.EPERUSTEET_AMOSAA_URL}/opetussuunnitelmat?sivukoko=${pageSize}&sivu=${page}`,
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
        "key": koodi.peruste.diaarinumero,
        "value": {
          "fi": koodi.peruste.nimi["fi"],
          "en": koodi.peruste.nimi["en"],
          "sv": koodi.peruste.nimi["sv"],
        }
      };
    });

    await client.set("opetussuunnitelmat", JSON.stringify(data));
  } catch (error) {
    console.log(error);
  }
}
