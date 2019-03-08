import { Router } from "express";

import { deleteKey, getData } from "./controllers/common";

const router: Router = Router();

// Get routes
router.get("/koodisto-service/:key", getData);
router.get("/amosaa/:key", getData);
router.get("/finto/:key", getData);

// Patch routes
router.delete("/redis/delete/:key", deleteKey);

export default router;
