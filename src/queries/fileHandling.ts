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
                    let result = await insertDataToEducationalMaterialTable(req);
                    const id = result;

                    console.log(files);
                    const obj: any = await uploadFileToStorage(("./" + files[0].path), files[0].filename, res);
                    result = await insertDataToMaterialTable(files, result[0].id, obj.Location);
                    await insertDataToRecordTable(files, result, obj.Key, obj.Bucket);
                    fs.unlink("./" + files[0].path, (err: any) => {
                        if (err) {
                          console.error(err);
                        }
                      });
                    res.status(200).json(id);
                } catch (e) {
                    console.log(e);
                    return res.status(500).send("Failure in file upload");
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
                    let result;
                    const obj: any = await uploadFileToStorage(("./" + files[0].path), files[0].filename, res);
                    result = await insertDataToMaterialTable(files, req.params.id, obj.Location);
                    console.log("result: " + result);
                    await insertDataToRecordTable(files, result, obj.Key, obj.Bucket);
                    console.log("files: " + files);
                    fs.unlink("./" + files[0].path);
                    res.status(200).send("Files uploaded: " + files.length);
                } catch (e) {
                    console.log(e);
                    return res.status(500).send("Failure in file upload");
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

// async function insertDataToAuthorTable(req: Request, materialID: String) {
//     const cs = new pgp.helpers.ColumnSet(["authorname", "organization", "educationalmaterialid"], {table: "author"});

//     // data input values:
//     const values = req.body.author;
//     for (let i = 0; i < values.length; i += 1) {
//         values[i]["educationalmaterialid"] = materialID;
//     }
//     // generating a multi-row insert query:
//     const query = pgp.helpers.insert(values, cs);
//     console.log(query);
//     const data = await db.any(query);
//     return data;
// }

async function insertDataToMaterialTable(files: any, materialID: String, location: any) {
    let query;
    const str = Object.keys(files).map(function(k) {return "('" + files[k].originalname + "','" + location + "','" + materialID + "')"; }).join(",");
    console.log(str);
    query = "insert into material (materialname, link, educationalmaterialid) values " + str + " returning id;";
    console.log(query);
    const data = await db.any(query);
    return data;
}

async function insertDataToRecordTable(files: any, materialID: any, fileKey: any, fileBucket: any) {
    let query;
    const str = Object.keys(files).map(function(k) {return "('" + files[k].path +
     "','" + files[k].originalname +
     "','" + files[k].size +
     "','" + files[k].mimetype +
     "','" + files[k].encoding +
     "','" + fileKey +
     "','" + fileBucket +
      "','" + materialID[k].id + "')"; }).join(",");
    query = "insert into record (filePath, originalfilename, filesize, mimetype, format, fileKey, fileBucket, materialid) values " + str + " returning id;";
    console.log(query);
    const data = await db.any(query);
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
            console.log(req.body);
            const filename = req.body.key;
            const key = filename;
            try {
                const params = {
                    Bucket: bucketName,
                    Key: key
                };
                res.attachment(key);
                console.log(s3.getObject(params));
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