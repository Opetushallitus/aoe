import { Request, Response, NextFunction } from "express";



const connection = require("./../db");
const pgp = connection.pgp;
const db = connection.db;
// const dbHelpers = require("./../databaseHelpers");

async function getMaterial(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        // let params = { };

        query = "SELECT * FROM educationalmaterial where obeleted != 1 order by id desc limit 100;";
        const data = await db.any(query);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.status(500).send("getting materials not succeeded");
    }
}

async function getMaterialData(req: Request , res: Response , next: NextFunction) {

    db.task(async (t: any) => {
        const queries: any = [];
        let query;
        query = "SELECT * FROM educationalmaterial WHERE id = $1 and obsoleted != '1';";
        let response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from materialname where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from materialdescription where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from educationalaudience where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from learningresourcetype where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from accessibilityfeature where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from accessibilityhazard where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from keyword where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from educationallevel where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from educationaluse where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from publisher where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from author where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from isbasedon where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from inlanguage where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select * from aligmentobject where educationalmaterialid = $1;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "select m.id, link, priority, filepath, originalfilename, filesize, mimetype, format, filekey, filebucket from material m left join record r on m.id = r.materialid where m.educationalmaterialid = $1 and m.obsoleted = 0;";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "SELECT users.id, users.firstname, users.lastname FROM educationalmaterial INNER JOIN users ON educationalmaterial.usersid = users.id WHERE educationalmaterial.id = $1 and educationalmaterial.obsoleted != '1';";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        query = "SELECT dn.id, dn.displayname, dn.language, dn.materialid FROM material m right join materialdisplayname dn on m.id = dn.materialid where m.educationalmaterialid = $1 and m.obsoleted != '1';";
        response = await t.any(query, [req.params.id]);
        queries.push(response);

        return t.batch(queries);
    })
    .then((data: any) => {
        const jsonObj: any = {};
        jsonObj.id = data[0][0].id;
        jsonObj.materials = data[15];
        jsonObj.owner = data[16];
        jsonObj.name = data[1];
        jsonObj.thumbnail = data[0][0].thumbnail;
        jsonObj.createdAt = data[0][0].createdat;
        jsonObj.updatedAt = data[0][0].updatedat;
        jsonObj.publishedAt = data[0][0].publishedat;
        jsonObj.archivedAt = data[0][0].archivedat;
        jsonObj.author = data[11];
        jsonObj.publisher = data[10];
        jsonObj.description = data[2];
        jsonObj.keywords = data[7];
        jsonObj.learningResourceType = data[4];
        jsonObj.timeRequired = data[0][0].timerequired;
        const typicalAgeRange: any = {};
        typicalAgeRange.min = data[0][0].agerangemin;
        typicalAgeRange.max = data[0][0].agerangemax;
        jsonObj.typicalAgeRange = typicalAgeRange;
        jsonObj.educationalAlignment = data[14];
        jsonObj.educationalUse = data[9];
        jsonObj.inLanguage = data[13];
        jsonObj.accessibilityFeature = data[5];
        jsonObj.accessibilityHazard = data[6];
        jsonObj.licenseInformation = data[0][0].licensecode;
        jsonObj.isBasedOn = data[12];
        jsonObj.materialDisplayName = data[17];
        res.status(200).json(jsonObj);
    })
    .catch((error: any) => {
        res.sendStatus(400);
    });
}

async function getUserMaterial(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        // let params = { };
        query = "SELECT * FROM educationalmaterial WHERE usersid = $1 and obsoleted != '1' limit 1000;";
        const data = await db.any(query, [req.params.userid]);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.sendStatus(500);
    }
}

async function deleteMaterial(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        let data;
        query = "update educationalmaterial SET obsoleted = '1' WHERE id = $1;";
        data = await db.any(query, [req.params.id]);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.sendStatus(500);
    }
}

async function deleteRecord(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        let data;
        query = "update material SET obsoleted = '1' WHERE id = $1;";
        data = await db.any(query, [req.params.fileid]);
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

        query = "insert into educationalmaterial (materialName,slug,CreatedAt,PublishedAt,UpdatedAt,TechnicalName,timeRequired,agerangeMin,agerangeMax,UsersId) values ('matskun nimi 3','slugi',to_date('1900-01-01', 'YYYY-MM-DD'),to_date('1900-01-01', 'YYYY-MM-DD'),to_date('1900-01-01', 'YYYY-MM-DD'),'" + req.query.materialName + "','tekninen nimi','300','1','12','" + req.query.usersid + "') RETURNING id;";
        const data = await db.any(query);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.sendStatus(500);
    }
}

async function updateMaterial(req: Request , res: Response , next: NextFunction) {
    db.tx(async (t: any) => {
        let query;
        const queries: any = [];
        // let params = req.params;
        const materialname = req.body.materialname;
        const nameparams = [];
        let response;
        let arr = req.body.materialname;
        if (arr === undefined || arr.length === 0) {
            query = "DELETE FROM materialname where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
        }
        else {
            for (let i = 1; i <= arr.length; i++) {
                nameparams.push("('" + arr[i - 1].lang + "')");
            }
            console.log(queries);
            // find values to be deleted
            query = "select id from (select * from materialname where educationalmaterialid = $1) as i left join" +
            "(select t.lang from ( values " + nameparams.join(",") + " ) as t(lang)) as a on i.language = a.lang where a.lang is null;";
            console.log(query);
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
            for (const element of response) {
                query = "DELETE FROM materialname where id = " + element.id + ";";
                console.log(query);
                queries.push(await t.any(query));
            }
            for (const element of materialname) {
                query = "INSERT INTO materialname (materialname, language, slug, educationalmaterialid) VALUES ($1,$2,$3,$4) ON CONFLICT (language,educationalmaterialid) DO " +
                        "UPDATE SET materialname = $1 , slug = $1;";
                console.log(query);
                queries.push(await t.any(query, [element.text, element.lang, element.text, req.params.id]));
            }
        }
        const dnow = Date.now() / 1000.0;
        query = "UPDATE educationalmaterial SET (PublishedAt,UpdatedAt,timeRequired,agerangeMin,agerangeMax) = ($1,to_timestamp($2),$3,$4,$5) where id=$6;";
        console.log(query, [req.body.publishedAt, dnow]);
        queries.push(await t.any(query, [req.body.publishedAt, dnow, req.body.timeRequired, req.body.timeRequired, req.body.typicalAgeRange.min, req.body.typicalAgeRange.max, req.params.id]));
        console.log(queries);
// description
        const descparams = [];
        const descArr = req.body.description;
        if (descArr === undefined || descArr.length === 0) {
            query = "DELETE FROM learningresourcetype where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
        }
        else {
            for (let i = 1; i <= descArr.length; i++) {
                descparams.push("('" + descArr[i - 1].lang + "')");
            }
            query = "select id from (select * from materialdescription where educationalmaterialid = $1) as i left join" +
            "(select t.lang from ( values " + descparams.join(",") + " ) as t(lang)) as a on i.language = a.lang where a.lang is null;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
            for (const element of response) {
                query = "DELETE FROM materialdescription where id = " + element.id + ";";
                console.log(query);
                queries.push(await t.any(query));
            }
            for (const element of descArr) {
                query = "INSERT INTO materialdescription (description, language, educationalmaterialid) VALUES ($1,$2,$3) ON CONFLICT (language,educationalmaterialid) DO " +
                        "UPDATE SET description = $1;";
                console.log(query);
                queries.push(await t.any(query, [element.text, element.lang, req.params.id]));
            }
        }
// educational audience
        const audienceparams = [];
        const audienceArr = req.body.educationalRole;
        if (audienceArr === undefined || audienceArr.length === 0) {
            query = "DELETE FROM learningresourcetype where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
        }
        else {
            for (let i = 1; i <= audienceArr.length; i++) {
                audienceparams.push("('" + audienceArr[i - 1].value + "')");
            }
            query = "select id from (select * from educationalaudience where educationalmaterialid = $1) as i left join" +
            "(select t.role from ( values " + audienceparams.join(",") + " ) as t(role)) as a on i.educationalrole = a.role where a.role is null;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
            for (const element of response) {
                query = "DELETE FROM educationalaudience where id = " + element.id + ";";
                console.log(query);
                queries.push(await t.any(query));
            }
            for (const element of audienceArr) {
                query = "INSERT INTO educationalaudience (educationalrole, educationalmaterialid) VALUES ($1,$2) ON CONFLICT (educationalrole,educationalmaterialid) DO " +
                        "UPDATE SET educationalrole = $1;";
                console.log(query);
                queries.push(await t.any(query, [element.value, req.params.id]));
            }
        }
        // educationalUse
        const educationalUseParams = [];
        const educationalUseArr = req.body.educationalUse;
        if (educationalUseArr === undefined || educationalUseArr.length === 0) {
            query = "DELETE FROM learningresourcetype where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
        }
        else {
            for (let i = 1; i <= educationalUseArr.length; i++) {
                educationalUseParams.push("('" + educationalUseArr[i - 1].value + "')");
            }
            query = "select id from (select * from educationaluse where educationalmaterialid = $1) as i left join" +
            "(select t.value from ( values " + educationalUseParams.join(",") + " ) as t(value)) as a on i.value = a.value where a.value is null;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
            console.log(response);
            for (const element of response) {
                query = "DELETE FROM educationaluse where id = " + element.id + ";";
                console.log(query);
                queries.push(await t.any(query));
            }
            for (const element of educationalUseArr) {
                query = "INSERT INTO educationaluse (value, educationalmaterialid) VALUES ($1,$2) ON CONFLICT (value,educationalmaterialid) DO NOTHING;";
                console.log(query);
                queries.push(await t.any(query, [element.value, req.params.id]));
            }
        }
        // learningResourceType
        const learningResourceTypeParams = [];
        const learningResourceTypeArr = req.body.learningResourceType;
        if (learningResourceTypeArr === undefined || learningResourceTypeArr.length === 0) {
            query = "DELETE FROM learningresourcetype where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
        }
        else {
            for (let i = 1; i <= learningResourceTypeArr.length; i++) {
                learningResourceTypeParams.push("('" + learningResourceTypeArr[i - 1].value + "')");
            }
            query = "select id from (select * from learningresourcetype where educationalmaterialid = $1) as i left join" +
            "(select t.value from ( values " + learningResourceTypeParams.join(",") + " ) as t(value)) as a on i.value = a.value where a.value is null;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
            console.log(response);
            for (const element of response) {
                query = "DELETE FROM learningresourcetype where id = " + element.id + ";";
                console.log(query);
                queries.push(await t.any(query));
            }
            for (const element of learningResourceTypeArr) {
                query = "INSERT INTO learningresourcetype (value, educationalmaterialid) VALUES ($1,$2) ON CONFLICT (value,educationalmaterialid) DO NOTHING;";
                console.log(query);
                queries.push(await t.any(query, [element.value, req.params.id]));
            }
        }
        // inLanguage
        const inLanguageParams = [];
        const inLanguageArr = req.body.inLanguage;
        if (inLanguageArr === undefined || inLanguageArr.length === 0) {
            query = "DELETE FROM inlanguage where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
        }
        else {
            for (let i = 1; i <= inLanguageArr.length; i++) {
                inLanguageParams.push("('" + inLanguageArr[i - 1].value + "')");
            }
            query = "select id from (select * from inlanguage where educationalmaterialid = $1) as i left join" +
            "(select t.inlanguage from ( values " + inLanguageParams.join(",") + " ) as t(inlanguage)) as a on i.inlanguage = a.inlanguage where a.inlanguage is null;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
            for (const element of response) {
                query = "DELETE FROM inlanguage where id = " + element.id + ";";
                console.log(query);
                queries.push(await t.any(query));
            }
            for (const element of inLanguageArr) {
                query = "INSERT INTO inlanguage (inlanguage, url, educationalmaterialid) VALUES ($1,$2,$3) ON CONFLICT (inlanguage, educationalmaterialid) DO NOTHING;";
                console.log(query);
                queries.push(await t.any(query, [element.value, element.url, req.params.id]));
            }
        }
        // keywords
        let params = [];
        arr = req.body.keywords;
        if (arr === undefined || arr.length === 0) {
            query = "DELETE FROM keyword where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
        }
        else {
        for (let i = 1; i <= arr.length; i++) {
            params.push("('" + arr[i - 1].value + "')");
        }
            query = "select id from (select * from keyword where educationalmaterialid = $1) as i left join" +
            "(select t.value from ( values " + params.join(",") + " ) as t(value)) as a on i.value = a.value where a.value is null;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
            for (const element of response) {
                query = "DELETE FROM keyword where id = " + element.id + ";";
                console.log(query);
                queries.push(await t.any(query));
            }
            for (const element of arr) {
                query = "INSERT INTO keyword (value, educationalmaterialid, keyurl) VALUES ($1,$2,$3) ON CONFLICT (value, educationalmaterialid) DO NOTHING;";
                console.log(query);
                queries.push(await t.any(query, [element.value, req.params.id, element.key]));
            }
        }
        // publisher
        params = [];
        arr = req.body.publisher;
        if (arr === undefined || arr.length === 0) {
            query = "DELETE FROM publisher where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
        }
        else {
            for (let i = 1; i <= arr.length; i++) {
                params.push("('" + arr[i - 1] + "')");
            }
            query = "select id from (select * from publisher where educationalmaterialid = $1) as i left join" +
            "(select t.name from ( values " + params.join(",") + " ) as t(name)) as a on i.name = a.name where a.name is null;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
            for (const element of response) {
                query = "DELETE FROM publisher where id = " + element.id + ";";
                console.log(query);
                queries.push(await t.any(query));
            }
            for (const element of arr) {
                query = "INSERT INTO publisher (name, educationalmaterialid) VALUES ($1,$2) ON CONFLICT (name, educationalmaterialid) DO NOTHING;";
                console.log(query);
                queries.push(await t.any(query, [element, req.params.id]));
            }
        }
        // isBasedOn
        params = [];
        arr = req.body.isBasedOn;
        if (arr === undefined || arr.length === 0) {
            query = "DELETE FROM isbasedon where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
        }
        else {
            query = "SELECT * from isbasedon where educationalmaterialid = $1;";
            response  = await t.any(query, [req.params.id]);
            queries.push(response);
            for (const element of response) {
                let toBeDeleted = true;
                for (let i = 0; arr.length > i; i += 1 ) {
                    if ( element.author === arr[i].author && element.materialname === arr[i].materialname) {
                        toBeDeleted = false;
                    }
                }
                if (toBeDeleted) {
                    query = "DELETE FROM isbasedon where id = " + element.id + ";";
                    console.log(query);
                    queries.push(await t.any(query));
                }
            }
            for (const element of arr) {
                query = "INSERT INTO isbasedon (author, materialname, url, aoeid, educationalmaterialid) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (author, materialname, educationalmaterialid) DO NOTHING;";
                console.log(query);
                const resp = await t.any(query, [element.author, element.materialname, element.url, element.aoeid, req.params.id]);
                queries.push(resp);
            }
        }
            // await updateAligmentObject(req, res, next);

            arr = req.body.educationalAlignment;

            if (arr === undefined || arr.length === 0) {
                query = "DELETE FROM aligmentobject where educationalmaterialid = $1;";
                response  = await t.any(query, [req.params.id]);
                queries.push(response);
            }
            else {
                query = "SELECT * from aligmentobject where educationalmaterialid = $1;";
                response  = await t.any(query, [req.params.id]);
                queries.push(response);
                for (const element of response) {
                    let toBeDeleted = true;
                    for (let i = 0; arr.length > i; i += 1 ) {
                        if ( element.alignmenttype === arr[i].alignmentType && element.targetname === arr[i].targetName && element.source === arr[i].source) {
                            toBeDeleted = false;
                        }
                    }
                    if (toBeDeleted) {
                        query = "DELETE FROM aligmentobject where id = " + element.id + ";";
                        console.log(query);
                        queries.push(await t.any(query));
                    }
                }
                const cs = new pgp.helpers.ColumnSet(["alignmenttype", "targetname", "source", "educationalmaterialid"], {table: "aligmentobject"});
                // data input values:
                // console.log(arr);
                const values: any = [];
                for ( let i = 0; i < arr.length; i += 1) {
                    arr[i].educationalmaterialid = req.params.id;
                }
                arr.forEach(async (element: any) =>  {
                    const obj = {alignmenttype : element.alignmentType, targetname : element.targetName , source : element.source , educationalmaterialid : req.params.id};
                    values.push(obj);
                });
                // console.log(arr);
                console.log(values);
                query = pgp.helpers.insert(values, cs) + " ON CONFLICT (alignmentType, targetName, source, educationalmaterialid) DO NOTHING;";
                console.log(query);
                queries.push(t.any(query));
                for (const element of arr) {
                    query = "INSERT INTO aligmentobject (alignmentType, targetName, source, educationalmaterialid) VALUES ($1,$2,$3,$4) ON CONFLICT (alignmentType, targetName, source, educationalmaterialid) DO NOTHING;";
                    console.log(query);
                    queries.push(await t.any(query, [element.alignmentType, element.targetName, element.source, req.params.id]));
                }
            }
// author
        params = [];
        arr = req.body.author;
        query = "DELETE FROM author where educationalmaterialid = $1;";
        response  = await t.any(query, [req.params.id]);
        queries.push(response);

        for (const element of arr) {
            query = "INSERT INTO author (authorname, organization, educationalmaterialid) VALUES ($1,$2,$3);";
            console.log(query);
            queries.push(await t.any(query, [element.authorname, element.organization, req.params.id]));
          }

    // materialDisplayName
        params = [];
        arr = req.body.materialdisplayname;
        if (arr === undefined || arr.length === 0) {
            // query = "DELETE FROM materialdisplayname where materialid = $1;";
            // response  = await t.any(query, [req.params.id]);
            // queries.push(response);
        }
        else {
            for (let i = 1; i <= arr.length; i++) {
                params.push("(" + arr[i - 1].materialid + ",'" + arr[i - 1].lang + "')");
                console.log(arr[i - 1]);
            }
            query = "select dnid from (select dn.id as dnid, dn.language as language, material.id as mid from material left join materialdisplayname as dn on material.id = dn.materialid where educationalmaterialid = $1) as i left join" +
            "(select t.id,t.lang from ( values " + params.join(",") + " ) as t(id,lang)) as a on i.mid = a.id and i.language = a.lang where a.lang is null;";
            console.log(query);
            response  = await t.any(query, [req.params.id]);
            console.log(response);
            queries.push(response);
            for (const element of response) {
                query = "DELETE FROM materialdisplayname where id = " + element.dnid + ";";
                console.log(query);
                queries.push(await t.any(query));
            }
            for (const element of arr) {
                query = "INSERT INTO materialdisplayname (displayname, language, materialid) VALUES ($1,$2,$3) ON CONFLICT (language, materialid) DO UPDATE Set displayname = $1;";
                console.log(query);
                queries.push(await t.any(query, [element.text, element.lang, element.materialid]));
            }
        }
        return t.batch(queries);
    })
    .then ((data: any) => {
        res.status(200).json("data updated");
    })
    .catch ((err: Error) => {
        console.log(err);
        res.sendStatus(400);
    });
}

async function createUser(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        console.log(req.body);
        if (req.body.username === undefined) {
            res.status(500).send("username undefined");
        }
        query = "insert into users (firstname , lastname, username, preferredlanguage,preferredtargetname,preferredalignmenttype )values ($1,$2,$3,'','','') RETURNING id;";
        const data = await db.any(query, [req.body.firstname, req.body.lastname, req.body.username]);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.status(500).send(err);
    }
}

async function updateUser(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        query = "update users set (firstname, lastname, preferredlanguage,preferredtargetname,preferredalignmenttype ) = ($1,$2,$3,$4,$5) where id = $6;";
        console.log(query);
        const data = await db.any(query, [req.body.firstname, req.body.lastname, req.body.preferredlanguage, req.body.preferredtargetname, req.body.preferredalignmenttype, req.params.id]);
        res.status(200).json("user updated");
    }
    catch (err ) {
        console.log(err);
        res.status(500).send("update failed");
    }
}

async function updateTermsOfUsage(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        query = "update users set termsofusage = '1' where id = $1;";
        console.log(query);
        const data = await db.any(query, [req.params.id]);
        res.status(200).json("terms of usage updated");
    }
    catch (err ) {
        console.log(err);
        res.status(500).send("update failed");
    }
}

async function getUser(req: Request , res: Response , next: NextFunction) {
    try {
        let query;
        query = "SELECT * FROM users where id = $1;";
        console.log(query);
        const data = await db.any(query, [req.params.id]);
        res.status(200).json(data);
    }
    catch (err ) {
        console.log(err);
        res.status(500).send("update failed");
    }
}

async function insertEducationalMaterial(obj: any, func: any) {
    await db.any("BEGIN");
    try {
        const response = await insertIntoEducationalMaterial(obj.educationalmaterial[0]);
        const materialid = response[0].id;
        let mkey = "MaterialName";
        for (const num in obj[mkey]) {
            await insertIntoMaterialName(obj[mkey][num], materialid);
        }
        mkey = "Description";
        for (const num in obj[mkey]) {
            await insertIntoMaterialDescription(obj[mkey][num], materialid);
        }
        mkey = "EducationalAudience";
        for (const num in obj[mkey]) {
            await insertIntoEducationalAudience(obj[mkey][num], materialid);
        }
        mkey = "LearningResourceType";
        for (const num in obj[mkey]) {
            await insertIntoLearningResourceType(obj[mkey][num], materialid);
        }
        mkey = "AccessibilityFeature";
        for (const num in obj[mkey]) {
            await insertIntoAccessibilityFeature(obj[mkey][num], materialid);
        }
        mkey = "AccessibilityHazard";
        for (const num in obj[mkey]) {
            await insertIntoAccessibilityHazard(obj[mkey][num], materialid);
        }
        mkey = "KeyWord";
        for (const num in obj[mkey]) {
            await insertIntoKeyWord(obj[mkey][num], materialid);
        }
        mkey = "EducationalLevel";
        for (const num in obj[mkey]) {
            await insertIntoEducationalLevel(obj[mkey][num], materialid);
        }
        mkey = "EducationalUse";
        for (const num in obj[mkey]) {
            await insertIntoEducationalUse(obj[mkey][num], materialid);
        }
        mkey = "Publisher";
        for (const num in obj[mkey]) {
            await insertIntoPublisher(obj[mkey][num], materialid);
        }
        mkey = "InLanguage";
        for (const num in obj[mkey]) {
            await insertIntoInLanguage(obj[mkey][num], materialid);
        }
        mkey = "AligmentObject";
        for (const num in obj[mkey]) {
            await insertIntoAligmentObject(obj[mkey][num], materialid);
        }
        mkey = "Material";
        for (const num in obj[mkey]) {
            await insertIntoMaterial(obj[mkey][num], materialid);
        }
        mkey = "Author";
        for (const num in obj[mkey]) {
            await insertIntoAuthor(obj[mkey][num], materialid);
        }
        await db.any("COMMIT");
        func(undefined, "Success");
    }
    catch (err ) {
        await db.any("ROLLBACK");
        console.log(err);
        func(err);
    }
}

async function insertIntoEducationalMaterial(obj: any) {
    const materialData = {
        technicalname : obj.technicalname,
        createdat : obj.createdat,
        // author : obj.author,
        // organization : obj.organization,
        publishedat : obj.publishedat,
        updatedat : obj.updatedat,
        archivedat : obj.archivedat,
        timerequired : obj.timerequired,
        agerangemin : obj.agerangemin,
        agerangemax : obj.agerangemax,
        usersid : obj.usersid,
        licensecode : obj.licensecode,
        originalpublishedat : obj.originalpublishedat
    };
    const query = pgp.helpers.insert(materialData, undefined, "educationalmaterial") + "RETURNING id";
    console.log(query);
    const data = await db.any(query);
    return data;
}

async function insertIntoMaterialName(obj: any, materialid: any) {
    const data = {
        materialname : obj.MaterialName,
        language : obj.Language,
        slug : obj.Slug,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "materialname") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoMaterialDescription(obj: any, materialid: any) {
    const data = {
        description : obj.Description,
        language : obj.Language,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "materialdescription") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoEducationalAudience(obj: any, materialid: any) {
    const data = {
        educationalrole : obj.EducationalRole,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "educationalaudience") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoLearningResourceType(obj: any, materialid: any) {
    const data = {
        value : obj.value,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "learningresourcetype") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoAuthor(obj: any, materialid: any) {
    const data = {
        authorname : obj.authorname,
        organization : obj.organization,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "author") + "RETURNING id";
    await db.any(query);
}

async function insertIntoAccessibilityFeature(obj: any, materialid: any) {
    const data = {
        value : obj.value,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "accessibilityfeature") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoAccessibilityHazard(obj: any, materialid: any) {
    const data = {
        value : obj.value,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "accessibilityhazard") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoKeyWord(obj: any, materialid: any) {
    const data = {
        value : obj.value,
        keyurl : "",
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "keyword") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoEducationalLevel(obj: any, materialid: any) {
    const data = {
        value : obj.value,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "educationallevel") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoEducationalUse(obj: any, materialid: any) {
    const data = {
        value : obj.value,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "educationaluse") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoPublisher(obj: any, materialid: any) {
    const data = {
        name : obj.name,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "publisher") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoInLanguage(obj: any, materialid: any) {
    const data = {
        inlanguage : obj.name,
        url : "",
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "inlanguage") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoAligmentObject(obj: any, materialid: any) {
    const data = {
        alignmenttype : obj.alignmenttype,
        targetname : obj.targetname,
        source : obj.source,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "aligmentobject") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoMaterial(obj: any, materialid: any) {
    const data = {
        // materialname : obj.materialname,
        link : obj.link,
        priority : obj.priority,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "material") + "RETURNING id";
    console.log(query);
    await db.any(query);
}


module.exports = {
    getMaterial : getMaterial,
    getMaterialData : getMaterialData,
    postMaterial : postMaterial,
    getUserMaterial : getUserMaterial,
    updateMaterial : updateMaterial,
    createUser : createUser,
    updateUser : updateUser,
    getUser : getUser,
    deleteMaterial : deleteMaterial,
    deleteRecord : deleteRecord,
    insertEducationalMaterial : insertEducationalMaterial,
    updateTermsOfUsage : updateTermsOfUsage
};