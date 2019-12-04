import { NextFunction, Request, Response } from "express";

import { getDataFromApi } from "../util/api.utils";
import { getAsync, setAsync } from "../util/redis.utils";
import { sortByTargetName } from "../util/data.utils";
import { AlignmentObjectExtended } from "../models/alignment-object-extended";

const endpoint = "perusteet";
const rediskeySubjects = "lukio-uusi-oppiaineet";
const rediskeyModules = "lukio-uusi-moduulit";
const rediskeyObjectives = "lukio-uusi-tavoitteet";
const rediskeyContents = "lukio-uusi-sisallot";
const params = "6828810/lops2019/oppiaineet";

export async function setLukionOppiaineet(): Promise<any> {
  try {
    const finnishSubjects: AlignmentObjectExtended[] = [];
    const swedishSubjects: AlignmentObjectExtended[] = [];

    const results = await getDataFromApi(
      process.env.EPERUSTEET_SERVICE_URL,
      `/${endpoint}/`,
      {
        "Accept": "application/json",
        "Caller-Id": `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`
      },
      params,
    );

    results.forEach((row: any) => {
      finnishSubjects.push({
        key: row.id,
        source: "upperSecondarySchoolSubjectsNew",
        alignmentType: "teaches",
        targetName: row.nimi.fi ? row.nimi.fi : row.nimi.sv,
        targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${row.id}`,
      });

      swedishSubjects.push({
        key: row.id,
        source: "upperSecondarySchoolSubjectsNew",
        alignmentType: "teaches",
        targetName: row.nimi.sv ? row.nimi.sv : row.nimi.fi,
        targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${row.id}`,
      });
    });

    finnishSubjects.sort(sortByTargetName);
    swedishSubjects.sort(sortByTargetName);

    await setAsync(`${rediskeySubjects}.fi`, JSON.stringify(finnishSubjects));
    await setAsync(`${rediskeySubjects}.sv`, JSON.stringify(swedishSubjects));
  } catch (err) {
    console.error(err);
  }
}

export const getLukionOppiaineet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const data = await getAsync(`${rediskeySubjects}.${req.params.lang.toLowerCase()}`);

    if (data) {
      res.status(200).json(JSON.parse(data));
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

export async function setLukionModuulit(): Promise<any> {
  try {
    const finnishModules: AlignmentObjectExtended[] = [];
    const swedishModules: AlignmentObjectExtended[] = [];

    const subjects: number[] = JSON.parse(await getAsync(`${rediskeySubjects}.fi`))
      .map((s: AlignmentObjectExtended) => s.key);

    for (const subject of subjects) {
      try {
        const results = await getDataFromApi(
          process.env.EPERUSTEET_SERVICE_URL,
          `/${endpoint}/`,
          {
            "Accept": "application/json",
            "Caller-Id": `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`
          },
          `${params}/${subject}`,
        );

        results.moduulit.forEach((module: any) => {
          finnishModules.push({
            key: module.id,
            parent: {
              key: subject,
              value: results.nimi.fi ? results.nimi.fi : results.nimi.sv,
            },
            source: "upperSecondarySchoolModulesNew",
            alignmentType: "teaches",
            targetName: module.nimi.fi ? module.nimi.fi : module.nimi.sv,
            targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${subject}/moduulit/${module.id}`,
          });

          swedishModules.push({
            key: module.id,
            parent: {
              key: subject,
              value: results.nimi.sv ? results.nimi.sv : results.nimi.fi,
            },
            source: "upperSecondarySchoolModulesNew",
            alignmentType: "teaches",
            targetName: module.nimi.sv ? module.nimi.sv : module.nimi.fi,
            targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${subject}/moduulit/${module.id}`,
          });
        });
      } catch (err) {
        console.error(err);
      }
    }

    await setAsync(`${rediskeyModules}.fi`, JSON.stringify(finnishModules));
    await setAsync(`${rediskeyModules}.sv`, JSON.stringify(swedishModules));
  } catch (err) {
    console.error(err);
  }
}

export const getLukionModuulit = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const ids = req.params.ids.split(",");

    const data = JSON.parse(await getAsync(`${rediskeyModules}.${req.params.lang.toLowerCase()}`))
      .filter((module: AlignmentObjectExtended) => ids.includes(module.parent.key.toString()))
      .map((module: AlignmentObjectExtended) => {
        module.parent = module.parent.value;

        return module;
      });

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

export async function setLukionTavoitteetSisallot(): Promise<any> {
  try {
    const finnishObjectives: AlignmentObjectExtended[] = [];
    const swedishObjectives: AlignmentObjectExtended[] = [];
    const finnishContents: AlignmentObjectExtended[] = [];
    const swedishContents: AlignmentObjectExtended[] = [];

    const modules = JSON.parse(await getAsync(`${rediskeyModules}.fi`))
      .map((m: AlignmentObjectExtended) => {
        return {
          id: m.key,
          subjectId: m.parent.key,
        };
      });

    for (const module of modules) {
      try {
        const results = await getDataFromApi(
          process.env.EPERUSTEET_SERVICE_URL,
          `/${endpoint}/`,
          {
            "Accept": "application/json",
            "Caller-Id": `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`
          },
          `${params}/${module.subjectId}/moduulit/${module.id}`,
        );

        results.tavoitteet.tavoitteet?.forEach((objective: any) => {
          finnishObjectives.push({
            key: objective._id,
            parent: {
              key: results.id,
              value: results.nimi.fi ? results.nimi.fi : results.nimi.sv,
            },
            source: "upperSecondarySchoolObjectivesNew",
            alignmentType: "teaches",
            targetName: objective.fi ? objective.fi : objective.sv,
          });

          swedishObjectives.push({
            key: objective._id,
            parent: {
              key: results.id,
              value: results.nimi.sv ? results.nimi.sv : results.nimi.fi,
            },
            source: "upperSecondarySchoolObjectivesNew",
            alignmentType: "teaches",
            targetName: objective.sv ? objective.sv : objective.fi,
          });
        });

        results.sisallot.sisallot?.forEach((content: any) => {
          finnishContents.push({
            key: content._id,
            parent: {
              key: results.id,
              value: results.nimi.fi ? results.nimi.fi : results.nimi.sv,
            },
            source: "upperSecondarySchoolContentsNew",
            alignmentType: "teaches",
            targetName: content.fi ? content.fi : content.sv,
          });

          swedishContents.push({
            key: content._id,
            parent: {
              key: results.id,
              value: results.nimi.sv ? results.nimi.sv : results.nimi.fi,
            },
            source: "upperSecondarySchoolContentsNew",
            alignmentType: "teaches",
            targetName: content.sv ? content.sv : content.fi,
          });
        });
      } catch (err) {
        console.error(err);
      }
    }

    await setAsync(`${rediskeyObjectives}.fi`, JSON.stringify(finnishObjectives));
    await setAsync(`${rediskeyObjectives}.sv`, JSON.stringify(swedishObjectives));
    await setAsync(`${rediskeyContents}.fi`, JSON.stringify(finnishContents));
    await setAsync(`${rediskeyContents}.sv`, JSON.stringify(swedishContents));
  } catch (err) {
    console.error(err);
  }
}

export const getLukionTavoitteet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const ids = req.params.ids.split(",");

    const data = JSON.parse(await getAsync(`${rediskeyObjectives}.${req.params.lang.toLowerCase()}`))
      .filter((objective: AlignmentObjectExtended) => ids.includes(objective.parent.key.toString()))
      .map((objective: AlignmentObjectExtended) => {
        objective.parent = objective.parent.value;

        return objective;
      });

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

export const getLukionSisallot = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const ids = req.params.ids.split(",");

    const data = JSON.parse(await getAsync(`${rediskeyContents}.${req.params.lang.toLowerCase()}`))
      .filter((content: AlignmentObjectExtended) => ids.includes(content.parent.key.toString()))
      .map((content: AlignmentObjectExtended) => {
        content.parent = content.parent.value;

        return content;
      });

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.sendStatus(404);

      return next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};
