import { Router } from "express";

// Legacy
import { deleteKey, getData } from "./controllers/common";
import { getTieteenalat } from "./controllers/tilastokeskus";

// Refactored
import { getKoulutusaste, getKoulutusasteet, getKoulutusasteetChildren } from "./controllers/koulutusasteet";
import { getKohderyhma, getKohderyhmat } from "./controllers/kohderyhmat";

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

// router.get("/opiskelumuodot/:lang");
// router.get("/opiskelumuodot/:key/:lang");

// router.get("/saavutettavuudentukitoiminnot/:lang");
// router.get("/saavutettavuudentukitoiminnot/:key/:lang");

// router.get("/saavutettavuudenavustavatteknologiat/:lang");
// router.get("/saavutettavuudenavustavatteknologiat/:key/:lang");

// router.get("/saavutettavuudenkayttotavat/:lang");
// router.get("/saavutettavuudenkayttotavat/:key/:lang");

// router.get("/saavutettavuudenesteet/:lang");
// router.get("/saavutettavuudenesteet/:key/:lang");

// router.get("/kielet/:lang");
// router.get("/kielet/:key/:lang");

export default router;
