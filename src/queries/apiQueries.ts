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
    try {
        let query;
        // let params = { };
        query = "SELECT * FROM educationalmaterial WHERE id = '" + req.params.id + "' and obsoleted != '1' limit 100;";
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
        query = "SELECT * FROM educationalmaterial WHERE usersid = '" + req.params.userid + "' and obsoleted != '1' limit 1000;";
        const data = await db.any(query);
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
        query = "update educationalmaterial SET obsoleted = '1' WHERE id = '" + req.params.id + "';";
        data = await db.any(query);
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
        query = "update material SET obsoleted = '1' WHERE id = '" + req.params.materialid + "';";
        data = await db.any(query);
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
        mkey = "AccessibilityAPI";
        for (const num in obj[mkey]) {
            await insertIntoAccessibilityAPI(obj[mkey][num], materialid);
        }
        mkey = "AccessibilityControl";
        for (const num in obj[mkey]) {
            await insertIntoAccessibilityControl(obj[mkey][num], materialid);
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
        author : obj.author,
        organization : obj.organization,
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

// async function insertIntoAccessibility(obj: any, materialid: any) {
//     const data = {
//         value : obj.value,
//         property : obj.property,
//         educationalmaterialid : materialid
//     };
//     const query = pgp.helpers.insert(data, undefined, "accessibility") + "RETURNING id";
//     await db.any(query);
// }

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

async function insertIntoAccessibilityAPI(obj: any, materialid: any) {
    const data = {
        value : obj.value,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "accessibilityapi") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoAccessibilityControl(obj: any, materialid: any) {
    const data = {
        value : obj.value,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "accessibilitycontrol") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoKeyWord(obj: any, materialid: any) {
    const data = {
        value : obj.value,
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
        educationalframework : obj.educationalframework,
        targetdescription : obj.targetdescription,
        targetname : obj.targetname,
        targeturl : obj.targeturl,
        educationalmaterialid : materialid
    };
    const query = pgp.helpers.insert(data, undefined, "aligmentobject") + "RETURNING id";
    console.log(query);
    await db.any(query);
}

async function insertIntoMaterial(obj: any, materialid: any) {
    const data = {
        materialname : obj.materialname,
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
    insertEducationalMaterial : insertEducationalMaterial
};