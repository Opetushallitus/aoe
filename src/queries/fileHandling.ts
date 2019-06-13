import { Request, Response, NextFunction } from "express";
import { forEach } from "async";
const AWS = require("aws-sdk");
const globalLog = require("global-request-logger");
globalLog.initialize();

const fs = require("fs");
const path = require("path");

// File upload dependencies
const multer  = require("multer");
// const upload = multer({ dest: "temp/"});


const storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
    destination: function(req: Request, file: any, cb: any) {
        cb(undefined, "temp/");
    },
    filename: function(req: Request, file: any, cb: any) {
        cb(undefined, "onko" + "-" + Date.now());
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
                    const location = await uploadFileToStorage(("./" + files[0].path), files[0].filename, res);
                    console.log("location: " + location);
                    result = await insertDataToMaterialTable(files, result[0].id, location);
                    await insertDataToRecordTable(files, result);
                    // fs.unlink("./" + files[0].path);
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
                    const location = await uploadFileToStorage(("./" + files[0].path), files[0].filename, res);
                    console.log("location: " + location);
                    result = await insertDataToMaterialTable(files, req.params.id, location);
                    console.log("result: " + result);
                    await insertDataToRecordTable(files, result);
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

async function insertDataToRecordTable(files: any, materialID: any) {
    let query;
    const str = Object.keys(files).map(function(k) {return "('" + files[k].path +
     "','" + files[k].originalname +
     "','" + files[k].size +
     "','" + files[k].mimetype +
     "','" + files[k].encoding +
      "','" + materialID[k].id + "')"; }).join(",");
    query = "insert into record (filePath, originalfilename, filesize, mimetype, format, materialid) values " + str + " returning id;";
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
        s3.listObjects(params2, function(err: any, data: any) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
        // const filePath = "./temp/0b66fed4e0fafdbd1298107681b305d4";
        const bucketName = process.env.BUCKET_NAME;
        const key = filename;
        // const key = "testfile2";
        // const uploadFile = (filePath, bucketName, key) => {
        fs.readFile(filePath, async (err: any, data: any) => {
            if (err) console.error(err);
        try {
            const base64data = Buffer.from(data, "binary2");
            const params = {
                Bucket: bucketName,
                Key: key,
                Body: base64data
            };
            s3.upload(params, (err: any, data: any) => {
                if (err) {
                    console.error(`Upload Error ${err}`);
                    res.status(500).send("error during upload");
                }

                if (data) {
                    console.log("Upload Completed");
                    console.log(data);
                    resolve(data.Location);
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

module.exports = {
    uploadMaterial: uploadMaterial,
    uploadFileToMaterial : uploadFileToMaterial,
    uploadFileToStorage : uploadFileToStorage
};