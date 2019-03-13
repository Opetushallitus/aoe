import RedisWrapper from "../utils/redis-wrapper";
import { getDataFromApi } from "./common";

const client = new RedisWrapper();

export async function setKoodistotSuomi(endpoint: string, key: string) {
  try {
    const results = await getDataFromApi(process.env.KOODISTOT_SUOMI_URL, `/${endpoint}/codes/?format=json`, { "Accept": "application/json" });
    const data: object[] = [];

    results.results.map((result: any) => {
      data.push({
        "key": result.id,
        "value": {
          "fi": result.prefLabel.fi,
          "en": result.prefLabel.en,
          "sv": result.prefLabel.sv,
        }
      });
    });

    await client.set(key, JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
}
