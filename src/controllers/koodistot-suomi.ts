import RedisWrapper from "../utils/redis-wrapper";
import { getDataFromApi } from "./common";

const client = new RedisWrapper();

export async function setKohderyhmat() {
  try {
    const results = await getDataFromApi(process.env.KOODISTOT_SUOMI_URL, "/EducationalRole/codes/?format=json", { "Accept": "application/json" });
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

    await client.set("kohderyhmat", JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
}

export async function setSaavutettavuusEsteet() {
  try {
    const results = await getDataFromApi(process.env.KOODISTOT_SUOMI_URL, "/SaavutettavuusEsteet/codes/?format=json", { "Accept": "application/json" });
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

    await client.set("saavutettavuusesteet", JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
}

export async function setSaavutettavuusKayttotavat() {
  try {
    const results = await getDataFromApi(process.env.KOODISTOT_SUOMI_URL, "/SaavutettavuusKayttotavat/codes/?format=json", { "Accept": "application/json" });
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

    await client.set("saavutettavuuskayttotavat", JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
}

export async function setSaavutettavuusTukitoiminnot() {
  try {
    const results = await getDataFromApi(process.env.KOODISTOT_SUOMI_URL, "/SaavutettavuusTukitoiminnot/codes/?format=json", { "Accept": "application/json" });
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

    await client.set("saavutettavuustukitoiminnot", JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
}

export async function setSaavutettavuusAvustavatTeknologiat() {
  try {
    const results = await getDataFromApi(process.env.KOODISTOT_SUOMI_URL, "/SaavutettavuusAvustavatTeknologiat/codes/?format=json", { "Accept": "application/json" });
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

    await client.set("saavutettavuusavustavatteknologiat", JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
}
