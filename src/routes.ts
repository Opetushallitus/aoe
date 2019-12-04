import { Router } from "express";

import { getOrganisaatio, getOrganisaatiot } from "./controllers/organisaatiot";
import {
  getKoulutusaste,
  getKoulutusasteet,
} from "./controllers/koulutusasteet";
import { getKohderyhma, getKohderyhmat } from "./controllers/kohderyhmat";
import { getKayttokohde, getKayttokohteet } from "./controllers/kayttokohteet";
import { getSaavutettavuudenTukitoiminnot, getSaavutettavuudenTukitoiminto } from "./controllers/saavutettavuuden-tukitoiminnot";
import { getSaavutettavuudenEste, getSaavutettavuudenEsteet } from "./controllers/saavutettavuuden-esteet";
import { getKielet, getKieli } from "./controllers/kielet";
import { getAsiasana, getAsiasanat } from "./controllers/asiasanat";
import { getTieteenalat } from "./controllers/tieteenalat";
import { getOppimateriaalityypit, getOppimateriaalityyppi } from "./controllers/oppimateriaalityypit";
// import { getAmmatillisenTutkinnonosa, getAmmatillisenTutkinnonosat } from "./controllers/ammatillisen-tutkinnonosat";
import { getAmmatillisenTutkinnot, getAmmatillisenTutkinto } from "./controllers/ammatillisen-tutkinnot";
import {
  getPerusopetuksenOppiaineet,
  getPerusopetuksenSisaltoalueet,
  getPerusopetuksenTavoitteet,
} from "./controllers/perusopetuksen-oppiaineet";
import { getLisenssi, getLisenssit } from "./controllers/lisenssit";
import { getLukionkurssi, getLukionkurssit } from "./controllers/lukionkurssit";
import { getLukionModuulit, getLukionOppiaineet, getLukionSisallot, getLukionTavoitteet } from "./controllers/lukio";
import { getAmmattikoulunTutkinnonOsat, getAmmattikoulunTutkinnot } from "./controllers/ammattikoulu";

const router: Router = Router();

/**
 * Returns all asiasanat from redis database by given language
 * @group Asiasanat (yso ontologia)
 * @route GET /asiasanat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/asiasanat/:lang", getAsiasanat);

/**
 * Returns single asiasana from redis database by given id and language
 * @group Asiasanat (yso ontologia)
 * @route GET /asiasanat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/asiasanat/:key/:lang", getAsiasana);

/**
 * Returns all organisaatiot from redis database by given language
 * @group Organisaatiot
 * @route GET /organisaatiot/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/organisaatiot/:lang", getOrganisaatiot);

/**
 * Returns single koulutusaste from redis database by given id and language
 * @group Organisaatiot
 * @route GET /organisaatiot/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/organisaatiot/:key/:lang", getOrganisaatio);

/**
 * Returns all oppimateriaalityypit from redis database by given language
 * @group Oppimateriaalityypit
 * @route GET /oppimateriaalityypit/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/oppimateriaalityypit/:lang", getOppimateriaalityypit);

/**
 * Returns single oppimateriaalityyppi from redis database by given id and language
 * @group Oppimateriaalityypit
 * @route GET /oppimateriaalityypit/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/oppimateriaalityypit/:key/:lang", getOppimateriaalityyppi);

/**
 * Returns all koulutusasteet from redis database by given language
 * @group Koulutusasteet
 * @route GET /koulutusasteet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/koulutusasteet/:lang", getKoulutusasteet);

/**
 * Returns single koulutusaste from redis database by given id and language
 * @group Koulutusasteet
 * @route GET /koulutusasteet/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/koulutusasteet/:key/:lang", getKoulutusaste);

/**
 * Returns all tieteenalat from redis database by given language
 * @group Tieteenalat
 * @route GET /tieteenalat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/tieteenalat/:lang", getTieteenalat);

/**
 * Returns all kohderyhmat from redis database by given language
 * @group Kohderyhmät
 * @route GET /kohderyhmat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kohderyhmat/:lang", getKohderyhmat);

/**
 * Returns single kohderyhma from redis database by given id and language
 * @group Kohderyhmät
 * @route GET /kohderyhmat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kohderyhmat/:key/:lang", getKohderyhma);

/**
 * Returns all kayttokohteet from redis database by given language
 * @group Käyttökohteet (käyttö opetuksessa)
 * @route GET /kayttokohteet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kayttokohteet/:lang", getKayttokohteet);

/**
 * Returns single kayttokohde from redis database by given id and language
 * @group Käyttökohteet (käyttö opetuksessa)
 * @route GET /kayttokohteet/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kayttokohteet/:key/:lang", getKayttokohde);

/**
 * Returns all saavutettavuudentukitoiminnot from redis database by given language
 * @group Saavutettavuuden tukitoiminnot
 * @route GET /saavutettavuudentukitoiminnot/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudentukitoiminnot/:lang", getSaavutettavuudenTukitoiminnot);

/**
 * Returns single saavutettavuudentukitoiminto from redis database by given id and language
 * @group Saavutettavuuden tukitoiminnot
 * @route GET /saavutettavuudentukitoiminnot/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudentukitoiminnot/:key/:lang", getSaavutettavuudenTukitoiminto);

/**
 * Returns all saavutettavuudenesteet from redis database by given language
 * @group Saavutettavuuden esteet
 * @route GET /saavutettavuudenesteet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenesteet/:lang", getSaavutettavuudenEsteet);

/**
 * Returns single saavutettavuudeneste from redis database by given id and language
 * @group Saavutettavuuden esteet
 * @route GET /saavutettavuudenesteet/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenesteet/:key/:lang", getSaavutettavuudenEste);

/**
 * Returns all kielet from redis database by given language
 * @group Kielet
 * @route GET /kielet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kielet/:lang", getKielet);

/**
 * Returns single kieli from redis database by given id and language
 * @group Kielet
 * @route GET /kielet/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kielet/:key/:lang", getKieli);

/**
 * Returns all ammatillisentutkinnonosat from redis database by given language
 * @group Ammatillisen tutkinnonosat
 * @route GET /ammatillisentutkinnonosat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
// router.get("/ammatillisentutkinnonosat/:lang", getAmmatillisenTutkinnonosat);

/**
 * Returns single ammatillisen tutkinnonosa from redis database by given id and language
 * @group Ammatillisen tutkinnonosat
 * @route GET /ammatillisentutkinnonosat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
// router.get("/ammatillisentutkinnonosat/:key/:lang", getAmmatillisenTutkinnonosa);

/**
 * Returns all ammatillisentutkinnot from redis database by given language
 * @group Ammatillisen tutkinnot
 * @route GET /ammatillisentutkinnot/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/ammatillisentutkinnot/:lang", getAmmatillisenTutkinnot);

/**
 * Returns single ammatillisen tutkinto from redis database by given id and language
 * @group Ammatillisen tutkinnot
 * @route GET /ammatillisentutkinnot/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/ammatillisentutkinnot/:key/:lang", getAmmatillisenTutkinto);

/**
 * Returns all oppiaineet from redis database by given language
 * @group Perusopetus
 * @route GET /oppiaineet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/oppiaineet/:lang", getPerusopetuksenOppiaineet);

/**
 * Returns all tavoitteet from redis database by given ids and language
 * @group Perusopetus
 * @route GET /tavoitteet/{ids}/{lang}
 * @param {string} ids.path.required - List of basic study subject ids, separated by comma
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/tavoitteet/:ids/:lang", getPerusopetuksenTavoitteet);

/**
 * Returns all sisaltoalueet from redis database by given ids and language
 * @group Perusopetus
 * @route GET /sisaltoalueet/{ids}/{lang}
 * @param {string} ids.path.required - List of basic study subject ids, separated by comma
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/sisaltoalueet/:ids/:lang", getPerusopetuksenSisaltoalueet);

/**
 * Returns all lisenssit from redis database by given language
 * @group Lisenssit
 * @route GET /lisenssit/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/lisenssit/:lang", getLisenssit);

/**
 * Returns single lisenssi from redis database by given id and language
 * @group Lisenssit
 * @route GET /lisenssit/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/lisenssit/:key/:lang", getLisenssi);

/**
 * Returns all lukionkurssit from redis database by given language
 * @group Lukionkurssit
 * @route GET /lukionkurssit/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/lukionkurssit/:lang", getLukionkurssit);

/**
 * Returns single lukionkurssi from redis database by given id and language
 * @group Lukionkurssit
 * @route GET /lukionkurssit/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/lukionkurssit/:key/:lang", getLukionkurssi);

/**
 * Returns all lukio-oppiaineet from redis database by given language
 * @group Lukio (uusi ops)
 * @route GET /lukio-oppiaineet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/lukio-oppiaineet/:lang", getLukionOppiaineet);

/**
 * Returns all lukio-moduulit from redis database by given ids and language
 * @group Lukio (uusi ops)
 * @param {string} ids.path.required - List of upper secondary school subject ids, separated by comma
 * @route GET /lukio-moduulit/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/lukio-moduulit/:ids/:lang", getLukionModuulit);

/**
 * Returns all lukio-tavoitteet from redis database by given ids and language
 * @group Lukio (uusi ops)
 * @route GET /lukio-tavoitteet/{ids}/{lang}
 * @param {string} ids.path.required - List of upper secondary school module ids, separated by comma
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/lukio-tavoitteet/:ids/:lang", getLukionTavoitteet);

/**
 * Returns all lukio-sisallot from redis database by given ids and language
 * @group Lukio (uusi ops)
 * @route GET /lukio-sisallot/{ids}/{lang}
 * @param {string} ids.path.required - List of upper secondary school module ids, separated by comma
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/lukio-sisallot/:ids/:lang", getLukionSisallot);

/**
 * Returns all ammattikoulu-tutkinnot from redis database by given language
 * @group Ammattikoulu
 * @route GET /ammattikoulu-tutkinnot/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/ammattikoulu-tutkinnot/:lang", getAmmattikoulunTutkinnot);

/**
 * Returns all ammattikoulu-tutkinnon-osat from redis database by given ids and language
 * @group Ammattikoulu
 * @route GET /ammattikoulu-tutkinnon-osat/{ids}/{lang}
 * @param {string} ids.path.required - List of vocational degree ids, separated by comma
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/ammattikoulu-tutkinnon-osat/:ids/:lang", getAmmattikoulunTutkinnonOsat);

export default router;
