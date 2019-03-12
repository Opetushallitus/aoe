import { Router } from "express";

import { deleteKey, getData } from "./controllers/common";

const router: Router = Router();

// Get routes

/**
 * Palauttaa lukionkurssit
 * @route GET /koodisto-service/lukionkurssit
 * @group Koodisto service
 * @param {string} language.path - language in ISO 639-1
 * @returns {object} 200 - OK
 */
router.get("/koodisto-service/:key/:lang?", getData);

router.get("/amosaa/:key/:lang?", getData);

router.get("/finto/:key/:lang?", getData);

// Delete routes
router.delete("/redis/delete/:key", deleteKey);

export default router;
