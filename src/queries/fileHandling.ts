import { Request, Response, NextFunction } from "express";
import { forEach } from "async";
const AWS = require("aws-sdk");
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
        cb(undefined, "file" + "-" + Date.now() + ext);
    }
});

const upload = multer({storage}); // provide the return value from
// Database connection
const connection = require("./../db");
const db = connection.db;

const publicationFolder = "publications";
const savedFileName = "file.blob";

async function uploadMaterial(req: Request, res: Response) {
    try {
        const contentType = req.headers["content-type"];

        if (contentType.startsWith("multipart/form-data")) {
            upload.array("myFiles", 12)(req , res, async function() {
                try {
                    const files = (<any>req).files;
                    if (files.length == 0) {
                        return res.status(400).send("No file sent");
                    }
                    const emresp = await insertDataToEducationalMaterialTable(req);
                    // return 200 if success and continue sending files to pouta
                    res.status(200).json(emresp);
                    console.log(files);
                    try {
                        for (let i = 0; i < files.length; i++) {
                            const obj: any = await uploadFileToStorage(("./" + files[i].path), files[i].filename, res);
                            const result = await insertDataToMaterialTable(files[i], emresp[0].id, obj.Location);
                            await insertDataToRecordTable(files[i], result, obj.Key, obj.Bucket);
                            fs.unlink("./" + files[i].path, (err: any) => {
                                if (err) {
                                console.error(err);
                                }
                            });
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
                    res.status(200).send("Files uploaded: " + files.length);
                    try {
                        for (let i = 0; i < files.length; i++) {
                            const obj: any = await uploadFileToStorage(("./" + files[i].path), files[i].filename, res);
                            const result = await insertDataToMaterialTable(files[i], req.params.materialId, obj.Location);
                            await insertDataToRecordTable(files[i], result, obj.Key, obj.Bucket);
                            fs.unlink("./" + files[i].path, (err: any) => {
                                if (err) {
                                console.error(err);
                                }
                            });
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
    // const date = new Date();
    // console.log(date.toISOString());

    const query = "insert into educationalmaterial (PublishedAt,TechnicalName,timeRequired,agerangeMin,agerangeMax,UsersId,LicenseCode)" +
                    " values (to_date('1902-01-01', 'YYYY-MM-DD'),$1,$2,$3,$4,$5,$6) returning id;";
    const data = await db.any(query, [req.body.technicalname, req.body.timerequired, req.body.agerangemin, req.body.agerangemax, req.body.usersid, req.body.licensecode]);
    return data;
}

async function insertDataToMaterialTable(files: any, materialID: String, location: any) {
    let query;
    // const str = Object.keys(files).map(function(k) {return "('" + files[k].originalname + "','" + location + "','" + materialID + "')"; }).join(",");
    const str = "('" + files.originalname + "','" + location + "','" + materialID + "')";
    query = "insert into material (materialname, link, educationalmaterialid) values ($1,$2,$3) returning id;";
    console.log(query);
    const data = await db.one(query, [files.originalname, location, materialID]);
    return data;
}

async function insertDataToRecordTable(files: any, materialID: any, fileKey: any, fileBucket: any) {
    let query;
    query = "insert into record (filePath, originalfilename, filesize, mimetype, format, fileKey, fileBucket, materialid) values ($1,$2,$3,$4,$5,$6,$7,$8) returning id;";
    console.log(query);
    const data = await db.any(query, [files.path, files.originalname, files.size, files.mimetype, files.encoding, fileKey, fileBucket, materialID.id]);
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
            // s3.listObjects(params2, function(err: any, data: any) {
            //     if (err) console.log(err, err.stack); // an error occurred
            //     else     console.log(data);           // successful response
            // });
            // const filePath = "./temp/0b66fed4e0fafdbd1298107681b305d4";
            const bucketName = process.env.BUCKET_NAME;
            const key = filename;
            fs.readFile(filePath, async (err: any, data: any) => {
                if (err) console.error(err);
            try {
                // const base64data = Buffer.from(data, "binary2");
                const params = {
                    Bucket: bucketName,
                    Key: key,
                    Body: data
                    // base64data
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
            const config = {
                accessKeyId: process.env.USER_KEY,
                secretAccessKey: process.env.USER_SECRET,
                endpoint: process.env.POUTA_END_POINT,
                region: process.env.REGION
                };
            AWS.config.update(config);
            const s3 = new AWS.S3();
            const bucketName = process.env.BUCKET_NAME;
            // console.log(req.body);
            const filename = req.body.key;
            const key = filename;
            try {
                const params = {
                    Bucket: bucketName,
                    Key: key
                };
                res.attachment(key);
                // console.log(s3.getObject(params));
                const fileStream = s3.getObject(params).createReadStream();
                fileStream.pipe(res);
                // resolve();
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
    downloadFileFromStorage : downloadFileFromStorage
};