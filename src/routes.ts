import { Router } from "express";

import { deleteKey, getData } from "./controllers/common";

const router: Router = Router();

// GET routes
router.get("/:key/:lang", getData);

// DELETE routes
router.delete("/redis/delete/:key", deleteKey);

export default router;
