import { Request, Response, NextFunction } from "express";
import { listenerCount } from "cluster";
const fs = require("fs");
const multer  = require("multer");
const aws = require("aws-sdk");
const fh = require("./fileHandling");

const storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
    destination: function(req: Request, file: any, cb: any) {
        console.log(process.env.THUMBNAIL_END_POINT);
        cb(undefined, process.env.THUMBNAIL_END_POINT);
    },
    filename: function(req: Request, file: any, cb: any) {
        const ext = file.originalname.substring(file.originalname.lastIndexOf("."), file.originalname.length);
        // let str = file.originalname.substring(0, file.originalname.lastIndexOf("."));
        // str = str.replace(/[^a-zA-Z0-9]/g, "");
        cb(undefined, "thumbnail" + "-" + Date.now() + ext);
    }
});
const upload = multer({storage}); // provide the return value from
// Database connection
const connection = require("./../db");
const db = connection.db;

async function uploadImage(req: Request, res: Response) {
    try {
        const contentType = req.headers["content-type"];
        if (contentType.startsWith("multipart/form-data")) {
            await upload.single("image")(req , res, await async function() {
                try {
                    const file = (<any>req).file;
                    console.log(file);
                    if (file == undefined) {
                        return res.status(400).send("No file sent");
                    }
                    try {
                        const obj: any = await fh.uploadFileToStorage((file.path), file.filename, process.env.THUMBNAIL_BUCKET_NAME);
                        let query;
                        query = "update thumbnail set obsoleted = 1 where educationalmaterialid = $1 and obsoleted = 0;";
                        console.log(query);
                        await db.none(query, [req.params.id]);
                        query = "INSERT INTO thumbnail (filepath, originalfilename, filesize, mimetype, format, educationalmaterialid, filename, fileKey, fileBucket) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);";
                        console.log(query, [obj.Location, file.originalname, file.size, file.mimetype, file.encoding, req.params.id, file.filename, obj.Key, obj.Bucket]);
                        await db.any(query, [obj.Location, file.originalname, file.size, file.mimetype, file.encoding, req.params.id, file.filename, obj.Key, obj.Bucket]);
                    }
                    catch (err) {
                        console.log(err);
                        return res.status(500).send("upload failed");
                    }
                    res.status(200).json({"status" : "Image upload done"});
                    fs.unlink(file.path, (err: any) => {
                        if (err) {
                        console.error(err);
                        }
                    });
                }
                catch (err) {
                    console.log(err);
                    return res.status(500).send("upload failed");
                }
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("error");
    }
}

module.exports = {
    uploadImage : uploadImage
};