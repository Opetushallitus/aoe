import { Router } from "express";

import { deleteKey, getData } from "./controllers/common";
import { getTieteenalat } from "./controllers/tilastokeskus";

const router: Router = Router();

// GET routes
router.get("/:key/:lang", getData);
router.get("/tieteenalat", getTieteenalat);

// DELETE routes
router.delete("/redis/delete/:key", deleteKey);

export default router;
