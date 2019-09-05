import * as redis from "redis";
import { promisify } from "util";

import { setAsiasanat } from "../controllers/asiasanat";
import { setKoulutusasteet } from "../controllers/koulutusasteet";
import { setKohderyhmat } from "../controllers/kohderyhmat";
import { setKayttokohteet } from "../controllers/kayttokohteet";
import { setSaavutettavuudenTukitoiminnot } from "../controllers/saavutettavuuden-tukitoiminnot";
import { setSaavutettavuudenEsteet } from "../controllers/saavutettavuuden-esteet";
import { setKielet } from "../controllers/kielet";
import { setOrganisaatiot } from "../controllers/organisaatiot";
import { setTieteenalat } from "../controllers/tieteenalat";
import { setOppimateriaalityypit } from "../controllers/oppimateriaalityypit";
// import { setAmmatillisenTutkinnonosat } from "../controllers/ammatillisen-tutkinnonosat";
import { setAmmatillisenTutkinnot } from "../controllers/ammatillisen-tutkinnot";
import { setPerusopetuksenOppiaineet } from "../controllers/perusopetuksen-oppiaineet";
import { setLisenssit } from "../controllers/lisenssit";
import { setLukionkurssit } from "../controllers/lukionkurssit";

export const client = redis.createClient(process.env.REDIS_URL);
export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);

export async function updateRedis(): Promise<any> {
  await setAsiasanat();
  await setKoulutusasteet();
  await setKohderyhmat();
  await setKayttokohteet();
  await setSaavutettavuudenTukitoiminnot();
  await setSaavutettavuudenEsteet();
  await setKielet();
  await setOrganisaatiot();
  await setTieteenalat();
  await setOppimateriaalityypit();
  // await setAmmatillisenTutkinnonosat();
  await setAmmatillisenTutkinnot();
  await setPerusopetuksenOppiaineet();
  await setLisenssit();
  await setLukionkurssit();
}
