import { Router } from "express";

import { getData } from "./controllers/common";
import * as redis from "./controllers/redis";

const router: Router = Router();

// Get routes
router.get("/koodisto-service/:key", getData);
router.get("/amosaa/:key", getData);
router.get("/finto/:key", getData);

// Patch routes
router.delete("/redis/delete/:key", redis.deleteKey);

export default router;
