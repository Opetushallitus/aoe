async function createMaterialObject(indata: any) {
    let obj: any = {};
    let data = await createEducationalMaterialObject(indata);
    obj = Object.assign(obj, data);
    data = await createMaterialNameObject(indata);
    obj = Object.assign(obj, data);
    data = await createDescriptionObject(indata);
    obj = Object.assign(obj, data);
    data = await createEducationalAudienceObject(indata);
    obj = Object.assign(obj, data);
    data = await createLearningResourceTypeObject(indata);
    obj = Object.assign(obj, data);
    data = await createAccessibilityObject(indata);
    obj = Object.assign(obj, data);
    data = await createKeyWordObject(indata);
    obj = Object.assign(obj, data);
    data = await createEducationalLevelObject(indata);
    obj = Object.assign(obj, data);
    data = await createEducationalUseObject(indata);
    obj = Object.assign(obj, data);
    data = await createPublisherObject(indata);
    obj = Object.assign(obj, data);
    data = await createAligmentObjectObject(indata);
    obj = Object.assign(obj, data);
    return obj;
}

async function createPropertyNameList(obj: any, str: String) {
    const list: any = [];
    Object.getOwnPropertyNames(obj).forEach(
        function (val: any, idx, array) {
            if (val.includes(str)) {
                list.push(val);
            }
          }
    );
    return list;
}

async function createEducationalMaterialObject(indata: any) {
    const obj: any = {};
    const key = "educationalmaterial";
    obj[key] = [];
    const date = new Date(Date.now());
    const materialData = {
        technicalname : indata.nimi,
        createdat : date,
        author : indata.tekija,
        organization : indata.organisaatio,
        publishedat : date,
        updatedat : date,
        timerequired : indata.timerequired || 0,
        agerangemin : indata.agerangemin || 1,
        agerangemax : indata.agerangemax || 99,
        usersid : 1,
        licensecode : indata.lisenssi
    };
    obj[key].push(materialData);
    return obj;
}
function createMaterialNameObject(indata: any) {
    const obj: any = {};
    const key = "MaterialName";
    obj[key] = [];
    if (indata.nimi) {
        const data = {
            MaterialName : indata.nimi,
            Language : "fi",
            Slug : indata.nimi
        };
        obj[key].push(data);
    }
    if (indata.nimi_englanti) {
        const data = {
            MaterialName : indata.nimi_englanti,
            Language : "en",
            Slug : indata.nimi_englanti
        };
        obj[key].push(data);
    }
    if (indata.nimi_ruotsi) {
        const data = {
            MaterialName : indata.nimi_ruotsi,
            Language : "sv",
            Slug : indata.nimi_ruotsi
        };
        obj[key].push(data);
    }
    return obj;
}

function createDescriptionObject(indata: any) {
    const obj: any = {};
    const key = "Description";
    obj[key] = [];
    if (indata.kuvaus) {
        const data = {
            Description : indata.kuvaus,
            Language : "fi"
        };
        obj[key].push(data);
    }
    if (indata.kuvaus_englanti) {
        const data = {
            Description : indata.kuvaus_englanti,
            Language : "en"
        };
        obj[key].push(data);
    }
    if (indata.kuvaus_ruotsi) {
        const data = {
            Description : indata.kuvaus_ruotsi,
            Language : "sv"
        };
        obj[key].push(data);
    }
    return obj;
}

async function createEducationalAudienceObject(indata: any) {
    const obj: any = {};
    const key = "EducationalAudience";
    obj[key] = [];
    const kohderyhmaList: any = await createPropertyNameList(indata, "kohderyhma");
    for (let i = 0; i < kohderyhmaList.length; ++i) {
        const value = indata[kohderyhmaList[i]];
        const data = {
            EducationalRole : value
        };
        obj[key].push(data);
    }
    return obj;
}

async function createLearningResourceTypeObject(indata: any) {
    const obj: any = {};
    const key = "LearningResourceType";
    obj[key] = [];
    const list: any = await createPropertyNameList(indata, "oppimateriaalityyppi");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            value : value
        };
        obj[key].push(data);
    }
    return obj;
}
async function createAccessibilityObject(indata: any) {
    const obj: any = {};
    const key = "Accessibility";
    obj[key] = [];
    const list: any = await createPropertyNameList(indata, "saavutettavuus");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            value : value,
            property : "1"
        };
        obj[key].push(data);
    }
    return obj;
}

async function createKeyWordObject(indata: any) {
    const obj: any = {};
    const key = "KeyWord";
    obj[key] = [];
    const list: any = await createPropertyNameList(indata, "avainsana");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            value : value
        };
        obj[key].push(data);
    }
    return obj;
}

async function createEducationalLevelObject(indata: any) {
    const obj: any = {};
    const key = "EducationalLevel";
    obj[key] = [];
    const list: any = await createPropertyNameList(indata, "oppiaste");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            value : value
        };
        obj[key].push(data);
    }
    return obj;
}

async function createEducationalUseObject(indata: any) {
    const obj: any = {};
    const key = "EducationalUse";
    obj[key] = [];
    const list: any = await createPropertyNameList(indata, "kayttotapa");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            value : value
        };
        obj[key].push(data);
    }
    return obj;
}

async function createPublisherObject(indata: any) {
    const obj: any = {};
    const key = "Publisher";
    obj[key] = [];
    const list: any = await createPropertyNameList(indata, "julkaisia");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            name : value
        };
        obj[key].push(data);
    }
    return obj;
}

async function createAligmentObjectObject(indata: any) {
    const obj: any = {};
    const key = "AligmentObject";
    obj[key] = [];
    let list: any = await createPropertyNameList(indata, "opettaa");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            alignmenttype : "teaches",
            educationalframework : "koodistosta",
            targetdescription : "koodistosta",
            targetname : value,
            targeturl : "koodistosta"
        };
        obj[key].push(data);
    }
    list = await createPropertyNameList(indata, "arvioi");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            alignmenttype : "assesses",
            educationalframework : "koodistosta",
            targetdescription : "koodistosta",
            targetname : value,
            targeturl : "koodistosta"
        };
        obj[key].push(data);
    }
    list = await createPropertyNameList(indata, "vaikeustaso");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            alignmenttype : "complexitylevel",
            educationalframework : "koodistosta",
            targetdescription : "koodistosta",
            targetname : value,
            targeturl : "koodistosta"
        };
        obj[key].push(data);
    }
    list = await createPropertyNameList(indata, "koulutusaste");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            alignmenttype : "educationallevel",
            educationalframework : "koodistosta",
            targetdescription : "koodistosta",
            targetname : value,
            targeturl : "koodistosta"
        };
        obj[key].push(data);
    }
    list = await createPropertyNameList(indata, "alkutasovaatimus");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            alignmenttype : "prerequisite",
            educationalframework : "koodistosta",
            targetdescription : "koodistosta",
            targetname : value,
            targeturl : "koodistosta"
        };
        obj[key].push(data);
    }
    list = await createPropertyNameList(indata, "lukutaitovaatimus");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            alignmenttype : "readinglevel",
            educationalframework : "koodistosta",
            targetdescription : "koodistosta",
            targetname : value,
            targeturl : "koodistosta"
        };
        obj[key].push(data);
    }
    list = await createPropertyNameList(indata, "oppiaine");
    for (let i = 0; i < list.length; ++i) {
        const value = indata[list[i]];
        const data = {
            alignmenttype : "educationalsubject",
            educationalframework : "koodistosta",
            targetdescription : "koodistosta",
            targetname : value,
            targeturl : "koodistosta"
        };
        obj[key].push(data);
    }
    return obj;
}

module.exports = {
    createMaterialObject : createMaterialObject
};