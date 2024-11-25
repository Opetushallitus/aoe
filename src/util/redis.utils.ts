import * as redis from 'redis';
import { promisify } from 'util';
import config from '../config';
import { winstonLogger } from '../util';

import { setAsiasanat } from '../controllers/asiasanat';
import { setKoulutusasteet } from '../controllers/koulutusasteet';
import { setKohderyhmat } from '../controllers/kohderyhmat';
import { setKayttokohteet } from '../controllers/kayttokohteet';
import { setSaavutettavuudenTukitoiminnot } from '../controllers/saavutettavuuden-tukitoiminnot';
import { setSaavutettavuudenEsteet } from '../controllers/saavutettavuuden-esteet';
import { setKielet } from '../controllers/kielet';
import { setOrganisaatiot } from '../controllers/organisaatiot';
import { setTieteenalat } from '../controllers/tieteenalat';
import { setOppimateriaalityypit } from '../controllers/oppimateriaalityypit';
import { setPerusopetuksenOppiaineet } from '../controllers/perusopetus';
import { setLisenssit } from '../controllers/lisenssit';
import { setLukionkurssit } from '../controllers/lukionkurssit';
import { setLukionOppiaineetModuulit, setLukionTavoitteetSisallot } from '../controllers/lukio';
import {
  setAmmattikoulunTutkinnonOsat,
  setAmmattikoulunPerustutkinnot,
  setAmmattikoulunAmmattitutkinnot,
  setAmmattikoulunErikoisammattitutkinnot,
  setAmmattikoulunYTOaineet,
} from '../controllers/ammattikoulu';
import { setLukionVanhatOppiaineetKurssit } from '../controllers/vanha-lukio';
import { setTuvaOppiaineetTavoitteet } from '../controllers/tuva';

export const client = redis.createClient({
  host: config.REDIS_OPTIONS.host,
  port: config.REDIS_OPTIONS.port,
  password: config.REDIS_OPTIONS.pass,
});
export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);

export async function updateRedis(): Promise<void> {
  await setAsiasanat().catch((err) => winstonLogger.error('Setting YSO asiasanat failed in setAsiasanat(): %o', err));
  await setKoulutusasteet().catch((err) =>
    winstonLogger.error('Setting educational levels failed in setKoulutusasteet(): %o', err),
  );
  await setKohderyhmat().catch((err) =>
    winstonLogger.error('Setting educational roles failed in setKohderyhmat(): %o', err),
  );
  await setKayttokohteet().catch((err) =>
    winstonLogger.error('Setting educational uses failed in setKayttokohteet(): %o', err),
  );
  await setSaavutettavuudenTukitoiminnot().catch((err) =>
    winstonLogger.error('Setting accessibility features failed in setSaavutettavuudenTukitoiminnot(): %o', err),
  );
  await setSaavutettavuudenEsteet().catch((err) =>
    winstonLogger.error('Setting accessability hazards failed in setSaavutettavuudenEsteet(): %o', err),
  );
  await setKielet().catch((err) => winstonLogger.error('Setting languages failed in setKielet(): %o', err));
  await setOrganisaatiot().catch((err) =>
    winstonLogger.error('Setting organisations failed in setOrganisaatiot(): %o', err),
  );
  await setTieteenalat().catch((err) =>
    winstonLogger.error('Setting educational subjects of higher education failed in setTieteenalat(): %o', err),
  );
  await setOppimateriaalityypit().catch((err) =>
    winstonLogger.error('Setting learning resource types failed in setOppimateriaalityypit(): %o', err),
  );
  await setPerusopetuksenOppiaineet().catch((err) =>
    winstonLogger.error('Setting new data failed in setPerusopetuksenOppiaineet(): %o', err),
  );
  await setLisenssit().catch((err) => winstonLogger.error('Setting licenses failed in setLisenssit(): %o', err));
  await setLukionkurssit().catch((err) =>
    winstonLogger.error('Setting upper secondary school courses failed in setLukionkurssit(): %o', err),
  );
  await setLukionOppiaineetModuulit().catch((err) =>
    winstonLogger.error('Setting educational subjects and modules failed in setLukionOppiaineetModuulit(): %o', err),
  );
  await setLukionTavoitteetSisallot().catch((err) =>
    winstonLogger.error('Setting educational modules failed in setLukionTavoitteetSisallot(): %o', err),
  );
  await setAmmattikoulunPerustutkinnot().catch((err) =>
    winstonLogger.error('Setting educational subjects failed in setAmmattikoulunPerustutkinnot(): %o', err),
  );
  await setAmmattikoulunAmmattitutkinnot().catch((err) =>
    winstonLogger.error(
      'Setting further vocational qualifications failed in setAmmattikoulunAmmattitutkinnot(): %o',
      err,
    ),
  );
  await setAmmattikoulunErikoisammattitutkinnot().catch((err) =>
    winstonLogger.error(
      'Setting specialist vocational qualifications failed in setAmmattikoulunErikoisammattitutkinnot(): %o',
      err,
    ),
  );
  await setAmmattikoulunTutkinnonOsat().catch((err) =>
    winstonLogger.error(
      'Setting units of vocational education and competence requirements failed in setAmmattikoulunTutkinnonOsat(): %o',
      err,
    ),
  );
  await setAmmattikoulunYTOaineet().catch((err) =>
    winstonLogger.error('Setting common units of vocational education failed in setAmmattikoulunYTOaineet(): %o', err),
  );
  await setLukionVanhatOppiaineetKurssit().catch((err) =>
    winstonLogger.error(
      'Setting upper secondary school subjects and courses failed in setLukionVanhatOppiaineetKurssit(): %o',
      err,
    ),
  );
  await setTuvaOppiaineetTavoitteet().catch((err) =>
    winstonLogger.error(
      'Setting preparatory education subjects and objectives failed in setTuvaOppiaineetTavoitteet(): %o',
      err,
    ),
  );
}
