import { Router } from "express";

import { getOrganisaatio, getOrganisaatiot } from "./controllers/organisaatiot";
import { getKoulutusaste, getKoulutusasteet, getKoulutusasteetChildren, getKoulutusasteetParents } from "./controllers/koulutusasteet";
import { getKohderyhma, getKohderyhmat } from "./controllers/kohderyhmat";
import { getKayttokohde, getKayttokohteet } from "./controllers/kayttokohteet";
import { getSaavutettavuudenTukitoiminnot, getSaavutettavuudenTukitoiminto } from "./controllers/saavutettavuuden-tukitoiminnot";
import {
  getSaavutettavuudenAvustavaTeknologia,
  getSaavutettavuudenAvustavatTeknologiat
} from "./controllers/saavutettavuuden-avustavatteknologiat";
import { getSaavutettavuudenKayttotapa, getSaavutettavuudenKayttotavat } from "./controllers/saavutettavuuden-kayttotavat";
import { getSaavutettavuudenEste, getSaavutettavuudenEsteet } from "./controllers/saavutettavuuden-esteet";
import { getKielet, getKieli } from "./controllers/kielet";
import { getAsiasana, getAsiasanat } from "./controllers/asiasanat";
import { getTieteenala, getTieteenalat } from "./controllers/tieteenalat";
import { getPeruskoulutuksenOppiaine, getPeruskoulutuksenOppiaineet } from "./controllers/peruskoulutuksen-oppiaineet";
import { getOppimateriaalityypit, getOppimateriaalityyppi } from "./controllers/oppimateriaalityypit";
import { getAmmatillisenTutkinnonosa, getAmmatillisenTutkinnonosat } from "./controllers/ammatillisen-tutkinnonosat";
import { getAmmatillisenTutkinnot, getAmmatillisenTutkinto } from "./controllers/ammatillisen-tutkinnot";
import { getPerusopetuksenOppiaineet } from "./controllers/perusopetuksen-tavoitteet";

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
 * Returns parent koulutusasteet from redis database by given language
 * @group Koulutusasteet
 * @route GET /koulutusasteet/parents/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/koulutusasteet/parents/:lang", getKoulutusasteetParents);

/**
 * Returns single koulutusaste from redis database by given id and language
 * @group Koulutusasteet
 * @route GET /koulutusasteet/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/koulutusasteet/:key/:lang", getKoulutusaste);

/**
 * Returns child koulutusasteet from redis database by given id and language
 * @group Koulutusasteet
 * @route GET /koulutusasteet/children/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/koulutusasteet/children/:key/:lang", getKoulutusasteetChildren);

/**
 * Returns all tieteenalat from redis database by given language
 * @group Tieteenalat
 * @route GET /tieteenalat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/tieteenalat/:lang", getTieteenalat);

/**
 * Returns single tieteenala from redis database by given id and language
 * @group Tieteenalat
 * @route GET /tieteenalat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/tieteenalat/:key/:lang", getTieteenala);

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
 * Returns all saavutettavuudenavustavatteknologiat from redis database by given language
 * @group Saavutettavuutta avustavat teknologiat
 * @route GET /saavutettavuudenavustavatteknologiat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenavustavatteknologiat/:lang", getSaavutettavuudenAvustavatTeknologiat);

/**
 * Returns single saavutettavuudenavustavateknologia from redis database by given id and language
 * @group Saavutettavuutta avustavat teknologiat
 * @route GET /saavutettavuudenavustavatteknologiat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenavustavatteknologiat/:key/:lang", getSaavutettavuudenAvustavaTeknologia);

/**
 * Returns all saavutettavuudenkayttotavat from redis database by given language
 * @group Saavutettavuuden käyttötavat
 * @route GET /saavutettavuudenkayttotavat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenkayttotavat/:lang", getSaavutettavuudenKayttotavat);

/**
 * Returns single saavutettavuudenkayttotapa from redis database by given id and language
 * @group Saavutettavuuden käyttötavat
 * @route GET /saavutettavuudenkayttotavat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenkayttotavat/:key/:lang", getSaavutettavuudenKayttotapa);

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
 * Returns all peruskoulutuksenoppiaineet from redis database by given language
 * @group Peruskoulutuksen oppiaineet
 * @route GET /peruskoulutuksenoppiaineet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/peruskoulutuksenoppiaineet/:lang", getPeruskoulutuksenOppiaineet);

/**
 * Returns single peruskoulutuksen oppiaine from redis database by given id and language
 * @group Peruskoulutuksen oppiaineet
 * @route GET /peruskoulutuksenoppiaineet/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/peruskoulutuksenoppiaineet/:key/:lang", getPeruskoulutuksenOppiaine);

/**
 * Returns all ammatillisentutkinnonosat from redis database by given language
 * @group Ammatillisen tutkinnonosat
 * @route GET /ammatillisentutkinnonosat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/ammatillisentutkinnonosat/:lang", getAmmatillisenTutkinnonosat);

/**
 * Returns single ammatillisen tutkinnonosa from redis database by given id and language
 * @group Ammatillisen tutkinnonosat
 * @route GET /ammatillisentutkinnonosat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/ammatillisentutkinnonosat/:key/:lang", getAmmatillisenTutkinnonosa);

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

export default router;
