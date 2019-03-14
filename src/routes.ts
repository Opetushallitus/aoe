import { Router } from "express";

import { deleteKey, getData } from "./controllers/common";
import { getTieteenalat } from "./controllers/tilastokeskus";

const router: Router = Router();

// GET routes
/**
 * Palauttaa tietueen redis tietokannasta
 * @route GET /{avain}/{kieli}
 * @param {string} avain.path.required - Redis avain
 * @param {string} kieli.path.required - ISO 639-1 standardin mukainen kielitunnus
 * @returns {object} 200 - OK
 * @returns {error} 404 - Not Found
 */
router.get("/:key/:lang", getData);

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
router.get("/tieteenalat", getTieteenalat);

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
 * @route DELETE /redis/delete/{avain}
 * @param {string} avain.path.required - Redis avain
 * @returns {object} 200 - OK
 * @returns {error} 404 - Not Found
 */
router.delete("/redis/delete/:key", deleteKey);

export default router;
