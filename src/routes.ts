import { Router } from "express";

// Legacy
import { deleteKey, getData } from "./controllers/common";
import { getTieteenalat } from "./controllers/tilastokeskus";

// Refactored
import { getKoulutusaste, getKoulutusasteet, getKoulutusasteetChildren } from "./controllers/koulutusasteet";
import { getKohderyhma, getKohderyhmat } from "./controllers/kohderyhmat";
import { getKayttokohde, getKayttokohteet } from "./controllers/kayttokohteet";
import { getSaavutettavuudenTukitoiminnot, getSaavutettavuudenTukitoiminto } from "./controllers/saavutettavuudentukitoiminnot";
import {
  getSaavutettavuudenAvustavaTeknologia,
  getSaavutettavuudenAvustavatTeknologiat
} from "./controllers/saavutettavuudenavustavatteknologiat";
import { getSaavutettavuudenKayttotapa, getSaavutettavuudenKayttotavat } from "./controllers/saavutettavuudenkayttotavat";
import { getSaavutettavuudenEste, getSaavutettavuudenEsteet } from "./controllers/saavutettavuudenesteet";

const router: Router = Router();

// GET routes
/**
 * Palauttaa tietueen redis tietokannasta
 * @route GET /{key}/{lang}
 * @param {string} key.path.required - Redis key
 * @param {string} lang.path.required - ISO 639-1 standardin mukainen langtunnus
 * @returns {object} 200 - OK
 * @returns {error} 404 - Not Found
 */
router.get("/legacy/:key/:lang", getData);

/**
 * @typedef Koodi
 * @property {string} key.required - esim. "key": "p10"
 * @property {string} value.required - esim. "value": "ympäristötietoisuus"
 */

/**
 * Palauttaa tilastokeskuksen laatimat tieteenalat
 * @route GET /tieteenalat
 * @returns {Array.<Tieteenalat>} 200 - OK
 * @returns {error} 404 - Not Found
 */
router.get("/legacy/tieteenalat", getTieteenalat);

/**
 * @typedef Tieteenalat
 * @property {integer} koodi.required
 * @property {string} nimike.required
 * @property {Array.<Tieteenala>} tieteenalat
 */

/**
 * @typedef Tieteenala
 * @property {integer} koodi.required
 * @property {string} nimike.required
 * @property {Array.<Tieteenala>} tieteenalat
 */

// DELETE routes
/**
 * Poistaa tietueen redis tietokannasta
 * @route DELETE /redis/delete/{key}
 * @param {string} key.path.required - Redis key
 * @returns {object} 200 - OK
 * @returns {error} 404 - Not Found
 */
router.delete("/redis/delete/:key", deleteKey);

// Refactor everything

// router.get("/asiasanat/:lang");
// router.get("/asiasanat/:key/:lang");

// router.get("/oppimateriaalityypit/:lang");
// router.get("/oppimateriaalityypit/:key/:lang");

/**
 * Returns all koulutusasteet from redis database by given language
 * @group koulutusasteet
 * @route GET /koulutusasteet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/koulutusasteet/:lang", getKoulutusasteet);

/**
 * Returns single koulutusaste from redis database by given id and language
 * @group koulutusasteet
 * @route GET /koulutusasteet/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/koulutusasteet/:key/:lang", getKoulutusaste);

/**
 * Returns child koulutusasteet from redis database by given id and language
 * @group koulutusasteet
 * @route GET /koulutusasteet/children/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/koulutusasteet/children/:key/:lang", getKoulutusasteetChildren);

// router.get("/tieteenalat/:lang");
// router.get("/tieteenalat/:key/:lang");

/**
 * Returns all kohderyhmat from redis database by given language
 * @group kohderyhmat
 * @route GET /kohderyhmat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kohderyhmat/:lang", getKohderyhmat);

/**
 * Returns single kohderyhma from redis database by given id and language
 * @group kohderyhmat
 * @route GET /kohderyhmat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kohderyhmat/:key/:lang", getKohderyhma);

/**
 * Returns all kayttokohteet from redis database by given language
 * @group kayttokohteet
 * @route GET /kayttokohteet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kayttokohteet/:lang", getKayttokohteet);

/**
 * Returns single kayttokohde from redis database by given id and language
 * @group kayttokohteet
 * @route GET /kayttokohteet/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/kayttokohteet/:key/:lang", getKayttokohde);

/**
 * Returns all saavutettavuudentukitoiminnot from redis database by given language
 * @group saavutettavuudentukitoiminnot
 * @route GET /saavutettavuudentukitoiminnot/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudentukitoiminnot/:lang", getSaavutettavuudenTukitoiminnot);

/**
 * Returns single saavutettavuudentukitoiminto from redis database by given id and language
 * @group saavutettavuudentukitoiminnot
 * @route GET /saavutettavuudentukitoiminnot/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudentukitoiminnot/:key/:lang", getSaavutettavuudenTukitoiminto);

/**
 * Returns all saavutettavuudenavustavatteknologiat from redis database by given language
 * @group saavutettavuudenavustavatteknologiat
 * @route GET /saavutettavuudenavustavatteknologiat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenavustavatteknologiat/:lang", getSaavutettavuudenAvustavatTeknologiat);

/**
 * Returns single saavutettavuudenavustavateknologia from redis database by given id and language
 * @group saavutettavuudenavustavatteknologiat
 * @route GET /saavutettavuudenavustavatteknologiat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenavustavatteknologiat/:key/:lang", getSaavutettavuudenAvustavaTeknologia);

/**
 * Returns all saavutettavuudenkayttotavat from redis database by given language
 * @group saavutettavuudenkayttotavat
 * @route GET /saavutettavuudenkayttotavat/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenkayttotavat/:lang", getSaavutettavuudenKayttotavat);

/**
 * Returns single saavutettavuudenkayttotapa from redis database by given id and language
 * @group saavutettavuudenkayttotavat
 * @route GET /saavutettavuudenkayttotavat/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenkayttotavat/:key/:lang", getSaavutettavuudenKayttotapa);

/**
 * Returns all saavutettavuudenesteet from redis database by given language
 * @group saavutettavuudenesteet
 * @route GET /saavutettavuudenesteet/{lang}
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenesteet/:lang", getSaavutettavuudenEsteet);

/**
 * Returns single saavutettavuudeneste from redis database by given id and language
 * @group saavutettavuudenesteet
 * @route GET /saavutettavuudenesteet/{key}/{lang}
 * @param {string} key.path.required - ID
 * @param {string} lang.path.required - ISO 639-1 language code
 */
router.get("/saavutettavuudenesteet/:key/:lang", getSaavutettavuudenEste);

// router.get("/kielet/:lang");
// router.get("/kielet/:key/:lang");

export default router;
