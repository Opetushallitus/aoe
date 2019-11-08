import { Request, Response, NextFunction } from "express";
const connection = require("./../db");
// const db = connection.db;
const DB = connection.db;

// On first time login, we need to insert userData into database

// On first, and every subsequent login we need to pass userdata into session
// Might send just oidcDATA only, then unpack ID, depending on the format it arrives in

function populateSession(oidcID: any, oidcDATA: any, req: Request) {
    if (!oidcID) {
        console.log("No ID was passed, cannot initialize session values");
    }
    else if (oidcID === db.select("Select userdata with ID, if exists, only pass to session, else also insert") ) {
            // Still to be determined how this flow actually works, depending on how
    // oidc return the values, probably has to be initialized via the login route somehow

    // Specify this in the app.ts file.


    // This is how we assign values to the session, do this with name, profile, email etc. this
    // is just one example.
    req.session.userdata.name === oidcDATA.name;
    }
    else {
        // Here we use the oidcDATA to insert all userinformation to the database, might have to
        // unpack the data depending on how it is received from the login page
        db.INSERT("Insert all userinformation gathered from OIDC into the database");
            // This is how we assign values to the session, do this with name, profile, email etc. this
    // is just one example.
    req.session.userdata.name === oidcDATA.name;
    }

}

module.exports = {
    populateSession: populateSession,
};