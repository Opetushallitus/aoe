import rp from "request-promise";

import RedisWrapper from "../utils/redis-wrapper";

const client = new RedisWrapper();

export async function setLukionkurssit() {
  try {
    const options = {
      url: `${process.env.KOODISTO_SERVICE_URL}/lukionkurssit/koodi`,
      headers: {
        "Accept": "application/json"
      }
    };

    const body = await rp.get(options);
    const results = JSON.parse(body);
    const data: object[] = [];

    results.map((koodi: any) => {
      const metadataFi = koodi.metadata.find((e: any) => e.kieli.toLowerCase() === "fi");
      const metadataEn = koodi.metadata.find((e: any) => e.kieli.toLowerCase() === "en");
      const metadataSv = koodi.metadata.find((e: any) => e.kieli.toLowerCase() === "sv");

      data.push({
        "key": koodi.koodiUri,
        "value": {
          "fi": metadataFi ? metadataFi.nimi : undefined,
          "en": metadataEn ? metadataEn.nimi : undefined,
          "sv": metadataSv ? metadataSv.nimi : undefined,
        }
      });
    });

    await client.set("lukionkurssit", JSON.stringify(data));
  } catch (error) {
    console.log(error);
  }
}
