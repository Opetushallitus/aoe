import { Request, Response, NextFunction } from "express";
import { forEach } from "async";
import { isArray } from "util";
const AWS = require("aws-sdk");
const s3Zip = require("s3-zip");
const globalLog = require("global-request-logger");
globalLog.initialize();

const fs = require("fs");
const path = require("path");

// File upload dependencies
const multer  = require("multer");

const storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
    destination: function(req: Request, file: any, cb: any) {
        cb(undefined, "uploads/");
    },
    filename: function(req: Request, file: any, cb: any) {
        const ext = file.originalname.substring(file.originalname.lastIndexOf("."), file.originalname.length);
        let str = file.originalname.substring(0, file.originalname.lastIndexOf("."));
        str = str.replace(/[^a-zA-Z0-9]/g, "");
        cb(undefined, str + "-" + Date.now() + ext);
    }
});

const upload = multer({storage}); // provide the return value from
// Database connection
const connection = require("./../db");
const db = connection.db;

async function uploadMaterial(req: Request, res: Response) {
    try {
        console.log(req.body);
        const contentType = req.headers["content-type"];
        if (contentType.startsWith("multipart/form-data")) {
            upload.array("myFiles", 12)(req , res, async function() {
                try {
                    const files = (<any>req).files;
                    const links = req.body.myFiles;
                    console.log("files: " + files);
                    console.log("links: " + links);
                    if (files === "undefined" || files.length == 0 && links === "undefined") {
                        return res.status(400).send("No file sent");
                    }
                    const emresp = await insertDataToEducationalMaterialTable(req);
                    const material = [];
                    if (typeof links !== "undefined") {
                        if (isArray(links)) {
                            for (let i = 0; i < links.length; i++) {
                                const result = await insertDataToMaterialTable(emresp[0].id, links[i]);
                                material.push({ "id" : result.id , "createdFrom" : links[i]});
                            }
                        }
                        else {
                            const result = await insertDataToMaterialTable(emresp[0].id, links);
                            material.push({ "id" : result.id , "createdFrom" : links});
                        }
                    }
                    const materialid = [];
                    if (typeof files !== "undefined") {
                        for (let i = 0; i < files.length; i++) {
                            const id = await insertDataToMaterialTable(emresp[0].id, "");
                            material.push({"id" : id.id, "createFrom" : files[i].originalname});
                            materialid.push(id);
                            const result = await insertDataToTempRecordTable(files[i], id.id);
                            }
                        }
                    console.log(materialid);
                    // return 200 if success and continue sending files to pouta
                    const resp: any = {};
                    resp.id = emresp[0].id;
                    resp.material = material;
                    res.status(200).json(resp);
                    console.log(files);
                    console.log(req.body);
                    try {
                        if (typeof files !== "undefined") {
                            for (let i = 0; i < files.length; i++) {
                                console.log(materialid[i].id);
                                const obj: any = await uploadFileToStorage(("./" + files[i].path), files[i].filename, res);
                                await insertDataToRecordTable(files[i], materialid[i].id, obj.Key, obj.Bucket, obj.Location);
                                await deleteDataFromTempRecordTable(files[i].filename, materialid[i].id);
                                fs.unlink("./" + files[i].path, (err: any) => {
                                    if (err) {
                                    console.error(err);
                                    }
                                });
                            }
                        }
                    }
                    catch (ex) {
                        console.log(ex);
                        console.log("error while sending files to pouta: " + JSON.stringify((<any>req).files));
                    }
                } catch (e) {
                    console.log(e);
                    if ( ! res.headersSent) {
                        return res.status(500).send("Failure in file upload");
                    }
                }
            }
            );
        }
        else {
            res.status(400).send("Not found");
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("error");
    }
}

async function uploadFileToMaterial(req: Request, res: Response) {
    try {
        const contentType = req.headers["content-type"];

        if (contentType.startsWith("multipart/form-data")) {
            upload.array("myFiles", 12)(req , res, async function() {
                try {

                    const files = (<any>req).files;
                    const links = req.body.myFiles;
                    if (files === "undefined" || files.length == 0 && links === "undefined") {
                        return res.status(400).send("No file sent");
                    }
                    const material = [];
                    if (typeof links !== "undefined") {
                        if (isArray(links)) {
                            for (let i = 0; i < links.length; i++) {
                                const result = await insertDataToMaterialTable(req.params.materialId, links[i]);
                                material.push({ "id" : result.id , "createdFrom" : links[i]});
                            }
                        }
                        else {
                            const result = await insertDataToMaterialTable(req.params.materialId, links);
                            material.push({ "id" : result.id , "createdFrom" : links});
                        }
                    }
                    const materialid = [];
                    if (typeof files !== "undefined") {
                        for (let i = 0; i < files.length; i++) {
                            const id = await insertDataToMaterialTable(req.params.materialId, "");
                            material.push({"id" : id.id, "createFrom" : files[i].originalname});
                            materialid.push(id);
                            const result = await insertDataToTempRecordTable(files[i], id.id);
                            }
                        }
                    const resp: any = {};
                    resp.id = req.params.materialI;
                    resp.material = material;
                    res.status(200).json(resp);
                    try {
                        if (typeof files !== "undefined") {
                            for (let i = 0; i < files.length; i++) {
                                const obj: any = await uploadFileToStorage(("./" + files[i].path), files[i].filename, res);
                                await insertDataToRecordTable(files[i], materialid[i].id, obj.Key, obj.Bucket, obj.Location);
                                await deleteDataFromTempRecordTable(files[i].filename, materialid[i].id);
                                fs.unlink("./" + files[i].path, (err: any) => {
                                    if (err) {
                                    console.error(err);
                                    }
                                });
                            }
                        }
                    }
                    catch (ex) {
                        console.log(ex);
                        console.log("error while sending files to pouta: " + JSON.stringify((<any>req).files));
                    }
                } catch (e) {
                    console.log(e);
                    if ( ! res.headersSent) {
                        return res.status(500).send("Failure in file upload");
                    }
                }
            }
            );
        }
        else {
            res.status(400).send("Not found");
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("error");
    }
}

async function insertDataToEducationalMaterialTable(req: Request) {
    const query = "insert into educationalmaterial (TechnicalName,UsersId)" +
                    " values ($1,$2) returning id;";
    const data = await db.any(query, [req.body.materialname, req.body.usersid]);
    return data;
}

async function insertDataToMaterialTable(materialID: String, location: any) {
    let query;
    // const str = Object.keys(files).map(function(k) {return "('" + files[k].originalname + "','" + location + "','" + materialID + "')"; }).join(",");
    // const str = "('" + files.originalname + "','" + location + "','" + materialID + "')";
    query = "insert into material (link, educationalmaterialid) values ($1,$2) returning id;";
    console.log(query);
    const data = await db.one(query, [location, materialID]);
    return data;
}

async function insertDataToRecordTable(files: any, materialID: any, fileKey: any, fileBucket: any, location: String) {
    let query;
    query = "insert into record (filePath, originalfilename, filesize, mimetype, format, fileKey, fileBucket, materialid) values ($1,$2,$3,$4,$5,$6,$7,$8) returning id;";
    console.log(query);
    const data = await db.any(query, [location, files.originalname, files.size, files.mimetype, files.encoding, fileKey, fileBucket, materialID]);
}

async function insertDataToTempRecordTable(files: any, materialId: any) {
    let query;
    query = "insert into temporaryrecord (filename, filepath, originalfilename, filesize, mimetype, format, materialid) values ($1,$2,$3,$4,$5,$6,$7) returning id;";
    console.log(query);
    console.log(materialId);
    const data = await db.any(query, [files.filename, files.path, files.originalname, files.size, files.mimetype, files.encoding, materialId]);
    return data;
}

async function deleteDataFromTempRecordTable(filename: any, materialId: any) {
    let query;
    query = "delete from temporaryrecord where filename = $1 and materialid = $2;";
    console.log(query);
    const data = await db.any(query, [filename, materialId]);
    return data;
}

async function uploadFileToStorage(filePath: String, filename: String, res: Response) {
    return new Promise(async resolve => {
        try {
            const util = require("util");
            const config = {
                accessKeyId: process.env.USER_KEY,
                secretAccessKey: process.env.USER_SECRET,
                endpoint: process.env.POUTA_END_POINT,
                region: process.env.REGION
                };
            AWS.config.update(config);
            const s3 = new AWS.S3();
            const params2 = {
                Bucket: process.env.BUCKET_NAME,
                MaxKeys: 2
            };
            const bucketName = process.env.BUCKET_NAME;
            const key = filename;
            fs.readFile(filePath, async (err: any, data: any) => {
                if (err) console.error(err);
            try {
                const params = {
                    Bucket: bucketName,
                    Key: key,
                    Body: data
                };
                const time = Date.now();
                s3.upload(params, (err: any, data: any) => {
                    if (err) {
                        console.error(`Upload Error ${err}`);
                        res.status(500).send("error during upload");
                    }

                    if (data) {
                        console.log((Date.now() - time) / 1000);
                        console.log("Upload Completed");
                        console.log(data);
                        resolve(data);
                    }
                });
            }
            catch (err) {
                res.status(500).send(err);
            }

            });
        }
        catch (err) {
            console.log(err);
            res.status(500).send("error");
        }
    });
}

async function downloadFile(req: Request, res: Response) {
    try {
        const data = await downloadFileFromStorage(req, res);
        res.status(200).send(data);
    }
    catch (err) {
        res.status(400).send("Failed to download file");
    }
}

async function downloadFileFromStorage(req: Request, res: Response) {
    return new Promise(async resolve => {
        try {
            const query = "select originalfilename from record where filekey = $1;";
            console.log(query);
            const response = await db.one(query, [req.body.key]);
            const config = {
                accessKeyId: process.env.USER_KEY,
                secretAccessKey: process.env.USER_SECRET,
                endpoint: process.env.POUTA_END_POINT,
                region: process.env.REGION
                };
            AWS.config.update(config);
            const s3 = new AWS.S3();
            const bucketName = process.env.BUCKET_NAME;
            // const filename = req.body.key;
            const key = req.body.key;
            try {
                const params = {
                    Bucket: bucketName,
                    Key: key
                };
                res.attachment(key);
                res.header("Content-Disposition", "attachment; filename=" + response.originalfilename);
                const fileStream = s3.getObject(params).createReadStream();
                fileStream.pipe(res);
            }
            catch (err) {
                res.status(500).send(err);
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send("error");
        }
    });
}

async function downloadMaterialFile(req: Request, res: Response) {
    try {
        const query = "select record.filekey, record.originalfilename from material right join record on record.materialid = material.id where educationalmaterialid = $1;";
        console.log(query);
        const response = await db.any(query, [req.params.materialId]);
        const keys = [];
        const archiveFiles = [];
        for (const element of response) {
            keys.push(element.filekey);
            archiveFiles.push(element.originalfilename);
        }
        console.log(keys, req.params.materialId);
        const data = await downloadAndZipFromStorage(req, res, keys, archiveFiles);
        res.status(200).send(data);
    }
    catch (err) {
        res.status(400).send("Failed to download file");
    }
}

async function downloadAndZipFromStorage(req: Request, res: Response, keys: any, archiveFiles: any) {
    return new Promise(async resolve => {
        try {
            const config = {
                accessKeyId: process.env.USER_KEY,
                secretAccessKey: process.env.USER_SECRET,
                endpoint: process.env.POUTA_END_POINT,
                region: process.env.REGION
                };
            AWS.config.update(config);
            const s3 = new AWS.S3();
            const bucketName = process.env.BUCKET_NAME;
            try {
                s3Zip
                .archive({ s3: s3, bucket: bucketName }, "", keys, archiveFiles)
                .pipe(res);
            }
            catch (err) {
                res.status(500).send(err);
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send("error");
        }
    });
}

module.exports = {
    uploadMaterial: uploadMaterial,
    uploadFileToMaterial : uploadFileToMaterial,
    uploadFileToStorage : uploadFileToStorage,
    downloadFile : downloadFile,
    downloadFileFromStorage : downloadFileFromStorage,
    downloadMaterialFile : downloadMaterialFile
};