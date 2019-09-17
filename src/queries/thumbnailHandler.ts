import { Request, Response, NextFunction } from "express";
import { listenerCount } from "cluster";
const fs = require("fs");
const multer  = require("multer");

const storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
    destination: function(req: Request, file: any, cb: any) {
        console.log(process.env.THUMBNAIL_END_POINT);
        cb(undefined, process.env.THUMBNAIL_END_POINT);
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

async function downloadImage(req: Request, res: Response) {
    try {
        let query;
        query = "select filepath, originalfilename, mimetype from thumbnail where educationalmaterialid = $1;";
        console.log(query);
        const image = await db.one(query, [req.params.id]);
        const path = image.filepath.toString();
        const img = fs.readFileSync(path);
        res.writeHead(200, {
            "Content-Type": image.mimetype
            });
        res.end(img, "binary");
    }
    catch (err) {
        console.log(err);
        return res.status(400).send("Not found");
    }

}

async function uploadImage(req: Request, res: Response) {
    try {
        const contentType = req.headers["content-type"];
        if (contentType.startsWith("multipart/form-data")) {
            try {
                upload.single("image")(req , res, await async function() {
                    try {
                        const file = (<any>req).file;
                        let query;
                        query = "select filepath from thumbnail where educationalmaterialid = $1;";
                        console.log(query);
                        const oldImage = await db.one(query, [req.params.id]);
                        console.log(oldImage);
                        console.log(oldImage.size);
                        if (oldImage !== "undefined") {
                            console.log("removing thumbnail " + oldImage.filepath);
                            fs.unlink(oldImage.filepath, (err: any) => {
                                if (err) {
                                console.error(err);
                                }
                            });
                        }
                        query = "INSERT INTO thumbnail (filepath, originalfilename, filesize, mimetype, format, educationalmaterialid, filename) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (educationalmaterialid) DO " +
                            "UPDATE SET filepath = $1 , originalfilename = $2, filesize= $3, mimetype = $4, format =$5, filename = $7;";
                        console.log(query);
                        await db.any(query, [file.path, file.originalname, file.size, file.mimetype, file.encoding, req.params.id, file.filename]);
                        return res.status(200).send("Image upload done");
                    }
                    catch (err) {
                        console.log(err);
                        return res.status(500).send("upload failed");
                    }
                }
                );
            }
            catch (err) {
                console.log(err);
                return res.status(500).send("upload failed");
            }
            }
        else {
            return res.status(400).send("Not found");
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("error");
    }
}

module.exports = {
    uploadImage : uploadImage,
    downloadImage : downloadImage
};