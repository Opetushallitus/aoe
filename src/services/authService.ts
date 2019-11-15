import { Request, Response, NextFunction } from "express";
const connection = require("./../db");
// const db = connection.db;
const db = connection.db;

function checkAuthenticated (req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.sendStatus(401);
    }
}

function getUserData(req: Request) {

    // First we assure that the user actually exists before we decide to retrieve
    // the userData
    if (!isUser) {
        console.log("User did not exist, therefore we cannot get userData");
}
    else {

    // Temporary example of how the userData will look
    // We construct an object from data from the session, this data can also
    // be acquired straight from the req.session

    // Maybe redundant since the information is accessible straight from the req.session
    const userData = {
        openid: req.session.userdata.name,
        profile: "placeholder",
        email: "placeholder",
        adress: "placeholder",
        phone: "placeholder",
        offline_access: "placeholder",

    };
    return userData;
    }
}





function isUser(req: Request) {
    // Checking that the user actually exists, for this, the userdata has to be present
    // in the session data
        if (!req.session.userdata.id) {
            return false;
        }
        else if (req.session.userdata.id === db.select("Here we look if ID exist in db, ie. user exists and matches. DO QUERY HERE")) {
            return true;
        }
        else {
            return false;
        }
}

async function hasAccesstoPublication(id: any, req: Request) {
    const query = "SELECT UsersUserName from EducationalMaterial WHERE id = " + id + "";
    const result = await db.oneOrNone(query);
    if (req.session.userdata.oidcid === result) {
        return true;
    }
    else {
        return false;
    }
}


module.exports = {
    isUser: isUser,
    getUserData: getUserData,
    hasAccesstoPublication,
    checkAuthenticated: checkAuthenticated
    // hasAccess: hasAccess,
};