import {
  getAmmattikoulunAmmattitutkinnot,
  getAmmattikoulunErikoisammattitutkinnot,
  getAmmattikoulunPerustutkinnot,
  getAmmattikoulunTutkinnonOsat,
  getAmmattikoulunVaatimukset,
  getAmmattikoulunYTOaineet
} from '@/controllers/ref/ammattikoulu'
import { getAsiasana, getAsiasanat } from '@/controllers/ref/asiasanat'
import { getOppiaineetTieteenalatTutkinnot } from '@/controllers/ref/filters'
import { getKayttokohde, getKayttokohteet } from '@/controllers/ref/kayttokohteet'
import { getKieli, getKielet } from '@/controllers/ref/kielet'
import { getKohderyhma, getKohderyhmat } from '@/controllers/ref/kohderyhmat'
import { getKoulutusaste, getKoulutusasteet } from '@/controllers/ref/koulutusasteet'
import { getLisenssi, getLisenssit } from '@/controllers/ref/lisenssit'
import {
  getLukionModuulit,
  getLukionOppiaineet,
  getLukionSisallot,
  getLukionTavoitteet
} from '@/controllers/ref/lukio'
import { getLukionkurssi, getLukionkurssit } from '@/controllers/ref/lukionkurssit'
import {
  getOppimateriaalityypit,
  getOppimateriaalityyppi
} from '@/controllers/ref/oppimateriaalityypit'
import { getOrganisaatio, getOrganisaatiot } from '@/controllers/ref/organisaatiot'
import {
  getPerusopetuksenOppiaineet,
  getPerusopetuksenSisaltoalueet,
  getPerusopetuksenTavoitteet
} from '@/controllers/ref/perusopetus'
import { getSaavutettavuudenEste, getSaavutettavuudenEsteet } from '@/controllers/ref/saavutettavuuden-esteet'
import {
  getSaavutettavuudenTukitoiminnot,
  getSaavutettavuudenTukitoiminto
} from '@/controllers/ref/saavutettavuuden-tukitoiminnot'
import { getTieteenalat } from '@/controllers/ref/tieteenalat'
import { getTuvaOppiaineet, getTuvaTavoitteet } from '@/controllers/ref/tuva'
import { getLukionVanhatKurssit, getLukionVanhatOppiaineet } from '@/controllers/ref/vanha-lukio'
import { Router } from 'express'

/**
 * Reference API version 1.0 endpoints.
 *
 * Public prefix is mounted in app.ts as /ref/api/v1.
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  router.get('/asiasanat/:lang', getAsiasanat)
  router.get('/asiasanat/:key/:lang', getAsiasana)
  router.get('/organisaatiot/:lang', getOrganisaatiot)
  router.get('/organisaatiot/:key/:lang', getOrganisaatio)
  router.get('/oppimateriaalityypit/:lang', getOppimateriaalityypit)
  router.get('/oppimateriaalityypit/:key/:lang', getOppimateriaalityyppi)
  router.get('/koulutusasteet/:lang', getKoulutusasteet)
  router.get('/koulutusasteet/:key/:lang', getKoulutusaste)
  router.get('/tieteenalat/:lang', getTieteenalat)
  router.get('/kohderyhmat/:lang', getKohderyhmat)
  router.get('/kohderyhmat/:key/:lang', getKohderyhma)
  router.get('/kayttokohteet/:lang', getKayttokohteet)
  router.get('/kayttokohteet/:key/:lang', getKayttokohde)
  router.get('/saavutettavuudentukitoiminnot/:lang', getSaavutettavuudenTukitoiminnot)
  router.get('/saavutettavuudentukitoiminnot/:key/:lang', getSaavutettavuudenTukitoiminto)
  router.get('/saavutettavuudenesteet/:lang', getSaavutettavuudenEsteet)
  router.get('/saavutettavuudenesteet/:key/:lang', getSaavutettavuudenEste)
  router.get('/kielet/:lang', getKielet)
  router.get('/kielet/:key/:lang', getKieli)
  router.get('/oppiaineet/:lang', getPerusopetuksenOppiaineet)
  router.get('/tavoitteet/:ids/:lang', getPerusopetuksenTavoitteet)
  router.get('/sisaltoalueet/:ids/:lang', getPerusopetuksenSisaltoalueet)
  router.get('/lisenssit/:lang', getLisenssit)
  router.get('/lisenssit/:key/:lang', getLisenssi)
  router.get('/lukionkurssit/:lang', getLukionkurssit)
  router.get('/lukionkurssit/:key/:lang', getLukionkurssi)
  router.get('/lukio-vanha-oppiaineet/:lang', getLukionVanhatOppiaineet)
  router.get('/lukio-vanha-kurssit/:ids/:lang', getLukionVanhatKurssit)
  router.get('/lukio-oppiaineet/:lang', getLukionOppiaineet)
  router.get('/lukio-moduulit/:ids/:lang', getLukionModuulit)
  router.get('/lukio-tavoitteet/:ids/:lang', getLukionTavoitteet)
  router.get('/lukio-sisallot/:ids/:lang', getLukionSisallot)
  router.get('/ammattikoulu-tutkinnot/:lang', getAmmattikoulunPerustutkinnot)
  router.get('/ammattikoulu-yto-aineet/:lang', getAmmattikoulunYTOaineet)
  router.get('/ammattikoulu-tutkinnon-osat/:ids/:lang', getAmmattikoulunTutkinnonOsat)
  router.get('/ammattikoulu-vaatimukset/:ids/:lang', getAmmattikoulunVaatimukset)
  router.get('/ammattikoulu-ammattitutkinnot/:lang', getAmmattikoulunAmmattitutkinnot)
  router.get('/ammattikoulu-erikoisammattitutkinnot/:lang', getAmmattikoulunErikoisammattitutkinnot)
  router.get('/filters-oppiaineet-tieteenalat-tutkinnot/:lang', getOppiaineetTieteenalatTutkinnot)
  router.get('/tuva-oppiaineet/:lang', getTuvaOppiaineet)
  router.get('/tuva-tavoitteet/:ids/:lang', getTuvaTavoitteet)
}
