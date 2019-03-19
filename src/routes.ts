import { Router } from "express";

import { deleteKey, getData } from "./controllers/common";
import { getTieteenalat } from "./controllers/tilastokeskus";
import { getKoulutusaste, getKoulutusasteet, getKoulutusasteetChildren } from "./controllers/koulutusasteet";

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
// router.get("/asiasanat/:lang/:key");
//
// router.get("/oppimateriaalityypit/:lang");
// router.get("/oppimateriaalityypit/:lang/:key");

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
// router.get("/tieteenalat/:lang/:key");
// router.get("/tieteenalat/:lang/koulutusasteet/:koulutusasteet");
//
// router.get("/kohderyhmat/:lang");
// router.get("/kohderyhmat/:lang/:key");
//
// router.get("/opiskelumuodot/:lang");
// router.get("/opiskelumuodot/:lang/:key");
//
// router.get("/saavutettavuudentukitoiminnot/:lang");
// router.get("/saavutettavuudentukitoiminnot/:lang/:key");
//
// router.get("/saavutettavuudenavustavatteknologiat/:lang");
// router.get("/saavutettavuudenavustavatteknologiat/:lang/:key");
//
// router.get("/saavutettavuudenkayttotavat/:lang");
// router.get("/saavutettavuudenkayttotavat/:lang/:key");
//
// router.get("/saavutettavuudenesteet/:lang");
// router.get("/saavutettavuudenesteet/:lang/:key");
//
// router.get("/kielet/:lang");
// router.get("/kielet/:lang/:key");

export default router;
