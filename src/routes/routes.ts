import { Router, Request, Response } from "express";
import { NextFunction } from "connect";
const connection = require("./../db");
// const pgp = connection.pgp;
const db2 = connection.db;
const router: Router = Router();

// Importing db const from apiQueries.ts
 const db = require("../queries/apiQueries");

// File handling
 const fh = require("./../queries/fileHandling");
 const handler = require("./../metadataEngine/xlsxHandler");
//  const pouta = require("./../queries/pouta");
// post metadata
// post file
// get metadata
// get file
// put metadata
// get omat
// delete file
// delete metadata

router.post("/material/file", fh.uploadMaterial);
router.post("/material/file/:materialId", fh.uploadFileToMaterial);

router.get("/material", db.getMaterial);
router.get("/material/:id", db.getMaterialData);
router.get("/material/user/:userid", db.getUserMaterial);
router.put("/material/:id", db.updateMaterial);
// delete educational material
router.delete("/material/:id", db.deleteMaterial);
// delete link or record from educationalmaterial
router.delete("/material/file/:materialid/:fileid", db.deleteRecord);
router.post("/material", db.postMaterial);

router.post("/createUser", db.createUser);
router.put("/user/:id", db.updateUser);
router.get("/user/:id", db.getUser);

router.get("/upload", fh.uploadFileToStorage);
router.get("/download", fh.downloadFile);

router.post("/uploadXlsx" , handler.uploadXlsx);
export = router;