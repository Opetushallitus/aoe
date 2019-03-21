import { Request, Response, NextFunction } from "express";

const connection = require("./../db");
const pgp = connection.pgp;
const db = connection.db;
// const dbHelpers = require("./../databaseHelpers");

async function getMaterial(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        // let params = { };

        query = "SELECT * FROM educationalmaterial order by id desc limit 100;";
        const data = await db.any(query);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.status(500).send("getting materials not succeeded");
    }
}

async function getMaterialData(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        // let params = { };

        query = "SELECT * FROM educationalmaterial WHERE id = '" + req.params.id + "' limit 100;";
        const data = await db.any(query);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.status(500).send("error when getting material data");
    }
}

async function getUserMaterial(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        // let params = { };
        query = "SELECT * FROM educationalmaterial WHERE usersid = '" + req.params.userid + "' limit 1000;";
        const data = await db.any(query);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.sendStatus(500);
    }
}
async function postMaterial(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        const params = req.params;

        query = "insert into educationalmaterial (materialName,slug,CreatedAt,PublishedAt,UpdatedAt,Description,TechnicalName,author,organization,publisher,timeRequired,agerangeMin,agerangeMax,UsersId) values ('matskun nimi 3','slugi kolmas',to_date('1900-01-01', 'YYYY-MM-DD'),to_date('1900-01-01', 'YYYY-MM-DD'),to_date('1900-01-01', 'YYYY-MM-DD'),'" + req.query.materialName + "','tekninen nimi','tekijä','CSC',123,'300','1','12','" + req.query.usersid + "');";
        const data = await db.any(query);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.sendStatus(500);
    }
}

async function updateMaterial(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        const params = req.params;

        query = "UPDATE educationalmaterial SET (materialName,slug,CreatedAt,PublishedAt,UpdatedAt,Description,TechnicalName,author,organization,publisher,timeRequired,agerangeMin,agerangeMax) = ('matskun nimi 3','slugi kolmas',to_date('1900-01-01', 'YYYY-MM-DD'),to_date('1900-01-01', 'YYYY-MM-DD'),to_date('1900-01-01', 'YYYY-MM-DD'),'" + req.query.materialName + "','tekninen nimi','tekijä','CSC',123,'300','1','12') where id='" + req.params.id + "';";
        console.log(query);
        const data = await db.any(query);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.sendStatus(500);
    }
}

async function createUser(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        console.log(req.body);
        query = "insert into users (firstname , lastname, username, preferredlanguage,preferredtargetname,preferredalignmenttype )values ('" + req.body.firstname + "','" + req.body.lastname + "','" + req.body.username + "','nimi','target','aligment');";
        const data = await db.any(query);
        res.status(200).json("user creted");
    }
    catch (err ) {
        console.log(err);
        res.status(500).send("vikaan meni");
    }
}

async function updateUser(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        query = "update users set (preferredlanguage,preferredtargetname,preferredalignmenttype ) = ('" + req.body.preferredlanguage + "','" + req.body.preferredtargetname + "','" + req.body.preferredalignmenttype + "') where id = '" + req.params.id + "';";
        console.log(query);
        const data = await db.any(query);
        res.status(200).json("user updated");
    }
    catch (err ) {
        console.log(err);
        res.status(500).send("update failed");
    }
}

async function getUser(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        query = "SELECT * FROM users where id = '" + req.params.id + "';";
        console.log(query);
        const data = await db.any(query);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.status(500).send("update failed");
    }
}


module.exports = {
    getMaterial : getMaterial,
    getMaterialData : getMaterialData,
    postMaterial : postMaterial,
    getUserMaterial : getUserMaterial,
    updateMaterial : updateMaterial,
    createUser : createUser,
    updateUser : updateUser,
    getUser : getUser
};