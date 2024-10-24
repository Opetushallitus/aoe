import { getDataFromApi } from '../util/api.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { sortByTargetName } from '../util/data.utils';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';
import { winstonLogger } from '../util';
import config from '../config';
import { NextFunction, Request, Response } from 'express';

const endpoint = 'external/peruste';
const rediskeySubjects = 'lukio-uusi-oppiaineet';
const rediskeyModules = 'lukio-uusi-moduulit';
const rediskeyObjectives = 'lukio-uusi-tavoitteet';
const rediskeyContents = 'lukio-uusi-sisallot';
const params = '6828810/lops2019/oppiaineet';

export async function setLukionOppiaineetModuulit(): Promise<void> {
  const finnishSubjects: AlignmentObjectExtended[] = [];
  const swedishSubjects: AlignmentObjectExtended[] = [];
  const finnishModules: AlignmentObjectExtended[] = [];
  const swedishModules: AlignmentObjectExtended[] = [];

  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.ePerusteet,
    `/${endpoint}/`,
    {
      Accept: 'application/json',
      'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`,
    },
    params,
  );

  if (!results || results.length < 1) {
    winstonLogger.error('No data from eperusteet in setLukionOppiaineetModuulit()');
    return;
  }

  for (const row of results) {
    if (!row.id) {
      winstonLogger.error(
        'Failed to get educational subject in setLukionOppiaineetModuulit(): Missing required request params',
      );
      return;
    }

    const subject: Record<string, unknown>[] = await getDataFromApi(
      config.EXTERNAL_API.ePerusteet,
      `/${endpoint}/`,
      {
        Accept: 'application/json',
        'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`,
      },
      `${params}/${row.id}`,
    );

    if (!subject || !(subject as any).id || (!(subject as any).nimi?.fi && !(subject as any).nimi?.sv)) {
      winstonLogger.error(
        'Creating new sets of educational subjects failed in setLukionOppiaineetModuulit(): Missing required data',
      );
      return;
    }

    if ((subject as any).moduulit?.length > 0) {
      finnishSubjects.push({
        key: (subject as any).id,
        source: 'upperSecondarySchoolSubjectsNew',
        alignmentType: 'educationalSubject',
        targetName: (subject as any).nimi.fi || (subject as any).nimi.sv,
        targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${params}/${(subject as any).id}`,
      });

      swedishSubjects.push({
        key: (subject as any).id,
        source: 'upperSecondarySchoolSubjectsNew',
        alignmentType: 'educationalSubject',
        targetName: (subject as any).nimi.sv || (subject as any).nimi.fi,
        targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${params}/${(subject as any).id}`,
      });

      for (const module of (subject as any).moduulit) {
        if (!module.id || (!module.nimi?.fi && !module.nimi?.sv)) {
          throw Error('Missing required data for subject modules in setLukionOppiaineetModuulit()');
        }

        finnishModules.push({
          key: module.id,
          parent: {
            key: (subject as any).id,
            value: (subject as any).nimi.fi || (subject as any).nimi.sv,
          },
          source: 'upperSecondarySchoolModulesNew',
          alignmentType: 'educationalSubject',
          targetName: module.nimi.fi || module.nimi.sv,
          targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${params}/${(subject as any).id}/moduulit/${
            module.id
          }`,
        });

        swedishModules.push({
          key: module.id,
          parent: {
            key: (subject as any).id,
            value: (subject as any).nimi.sv || (subject as any).nimi.fi,
          },
          source: 'upperSecondarySchoolModulesNew',
          alignmentType: 'educationalSubject',
          targetName: module.nimi.sv || module.nimi.fi,
          targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${params}/${(subject as any).id}/moduulit/${
            module.id
          }`,
        });
      }
    }

    if ((subject as any).oppimaarat?.length > 0) {
      for (const row of (subject as any).oppimaarat) {
        if (!row.id) {
          winstonLogger.error(
            'Getting course data failed in setLukionOppiaineetModuulit(): Missing required request params',
          );
          return;
        }

        const course: Record<string, unknown>[] = await getDataFromApi(
          config.EXTERNAL_API.ePerusteet,
          `/${endpoint}/`,
          {
            Accept: 'application/json',
            'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`,
          },
          `${params}/oppimaarat/${row.id}`,
        );

        if (
          !course ||
          !(course as any).id ||
          !(course as any).moduulit ||
          (!(course as any).nimi?.fi && !(course as any).nimi?.sv)
        ) {
          winstonLogger.error(
            'Creating new sets of courses and modules failed in setLukionOppiaineetModuulit(): Missing required data',
          );
          return;
        }

        finnishSubjects.push({
          key: (course as any).id,
          parent: {
            key: (subject as any).id,
            value: (subject as any).nimi.fi || (subject as any).nimi.sv,
          },
          source: 'upperSecondarySchoolSubjectsNew',
          alignmentType: 'educationalSubject',
          targetName: (course as any).nimi.fi || (course as any).nimi.sv,
          targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${params}/oppimaarat/${(course as any).id}`,
        });

        swedishSubjects.push({
          key: (course as any).id,
          parent: {
            key: (subject as any).id,
            value: (subject as any).nimi.sv || (subject as any).nimi.en,
          },
          source: 'upperSecondarySchoolSubjectsNew',
          alignmentType: 'educationalSubject',
          targetName: (course as any).nimi.sv || (course as any).nimi.fi,
          targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${params}/oppimaarat/${(course as any).id}`,
        });

        for (const module of (course as any).moduulit) {
          if (!module.id || (!module.nimi?.fi && !module.nimi?.sv)) {
            throw Error('Missing required data for course modules in setLukionOppiaineetModuulit()');
          }
          finnishModules.push({
            key: module.id,
            parent: {
              key: (course as any).id,
              value: (course as any).nimi.fi || (course as any).nimi.sv,
            },
            source: 'upperSecondarySchoolModulesNew',
            alignmentType: 'educationalSubject',
            targetName: module.nimi.fi || module.nimi.sv,
            targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${params}/oppimaarat/${
              (course as any).id
            }/moduulit/${module.id}`,
          });

          swedishModules.push({
            key: module.id,
            parent: {
              key: (course as any).id,
              value: (course as any).nimi.sv || (course as any).nimi.fi,
            },
            source: 'upperSecondarySchoolModulesNew',
            alignmentType: 'educationalSubject',
            targetName: module.nimi.sv || module.nimi.fi,
            targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${params}/oppimaarat/${
              (course as any).id
            }/moduulit/${module.id}`,
          });
        }
      }
    }
  }

  try {
    if (
      finnishSubjects.length < JSON.parse(await getAsync(`${rediskeySubjects}.fi`))?.length ||
      swedishSubjects.length < JSON.parse(await getAsync(`${rediskeySubjects}.sv`))?.length ||
      finnishModules.length < JSON.parse(await getAsync(`${rediskeyModules}.fi`))?.length ||
      swedishModules.length < JSON.parse(await getAsync(`${rediskeyModules}.sv`))?.length
    ) {
      winstonLogger.error('Creating new sets of subjects and modules failed in setLukionOppiaineetModuulit()');
      return;
    }

    finnishSubjects.sort(sortByTargetName);
    swedishSubjects.sort(sortByTargetName);

    await setAsync(`${rediskeySubjects}.fi`, JSON.stringify(finnishSubjects));
    await setAsync(`${rediskeySubjects}.sv`, JSON.stringify(swedishSubjects));
    await setAsync(`${rediskeySubjects}.en`, JSON.stringify(finnishSubjects));
    await setAsync(`${rediskeyModules}.fi`, JSON.stringify(finnishModules));
    await setAsync(`${rediskeyModules}.sv`, JSON.stringify(swedishModules));
    await setAsync(`${rediskeyModules}.en`, JSON.stringify(finnishModules));
  } catch (err) {
    throw Error(err);
  }
}

export const getLukionOppiaineet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<AlignmentObjectExtended[]> => {
  try {
    const data: AlignmentObjectExtended[] = JSON.parse(
      await getAsync(`${rediskeySubjects}.${req.params.lang.toLowerCase()}`),
    ).map((subject: AlignmentObjectExtended) => {
      if (subject.parent) {
        subject.parent = subject.parent.value;
      }

      return subject;
    });

    if (data) {
      res.status(200).json(data).end();
      return;
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Getting educational subjects failed in getLukionOppiaineet()');
  }
};

export const getLukionModuulit = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<AlignmentObjectExtended[]> => {
  try {
    const ids: string[] = req.params.ids.split(',');

    const data: AlignmentObjectExtended[] = JSON.parse(
      await getAsync(`${rediskeyModules}.${req.params.lang.toLowerCase()}`),
    )
      .filter((module: AlignmentObjectExtended) => ids.includes(module.parent.key.toString()))
      .map((module: AlignmentObjectExtended) => {
        module.parent = module.parent.value;

        return module;
      });

    if (data.length > 0) {
      res.status(200).json(data).end();
      return;
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Getting educational modules failed in getLukionModuulit()');
  }
};

export async function setLukionTavoitteetSisallot(): Promise<void> {
  const finnishObjectives: AlignmentObjectExtended[] = [];
  const swedishObjectives: AlignmentObjectExtended[] = [];
  const finnishContents: AlignmentObjectExtended[] = [];
  const swedishContents: AlignmentObjectExtended[] = [];
  let modules: { id: string; subjectId: number }[] = [];

  try {
    modules = JSON.parse(await getAsync(`${rediskeyModules}.fi`)).map((m: AlignmentObjectExtended) => {
      return {
        id: m.key,
        subjectId: m.parent.key,
      };
    });
  } catch (err) {
    throw Error(err);
  }

  for (const module of modules) {
    if (!module.id || !module.subjectId) {
      winstonLogger.error(
        'Getting module objectives and contents failed in setLukionTavoitteetSisallot(): Missing required request params',
      );
      return;
    }
    const conditions = [
      6832790, 6834385, 6832794, 6832792, 6832796, 6832793, 6834389, 6834387, 6835372, 6832791, 6834388, 6835370,
      6832795, 6834386, 6832797,
    ];
    const urlParam: string = conditions.some((el: number) => module.subjectId === el)
      ? `${params}`
      : `${params}/oppimaarat`;

    const results: Record<string, unknown>[] = await getDataFromApi(
      config.EXTERNAL_API.ePerusteet,
      `/${endpoint}/`,
      {
        Accept: 'application/json',
        'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`,
      },
      `${urlParam}/${module.subjectId}/moduulit/${module.id}`,
    );

    if (
      !results ||
      !(results as any).id ||
      (!(results as any).nimi?.fi && !(results as any).nimi?.sv) ||
      (!(results as any).tavoitteet?.tavoitteet && !(results as any).sisallot)
    ) {
      winstonLogger.error(
        'Creating new sets of objectives and contents failed in setLukionTavoitteetSisallot(): Missing required data',
      );
      return;
    }

    (results as any).tavoitteet?.tavoitteet?.forEach((objective: any) => {
      if (!objective._id || (!objective.fi && !objective.sv)) {
        throw Error('Missing required data for objectives in setLukionTavoitteetSisallot()');
      }
      finnishObjectives.push({
        key: objective._id,
        parent: {
          key: (results as any).id,
          value: (results as any).nimi.fi || (results as any).nimi.sv,
        },
        source: 'upperSecondarySchoolObjectivesNew',
        alignmentType: 'teaches',
        targetName: objective.fi || objective.sv,
      });

      swedishObjectives.push({
        key: objective._id,
        parent: {
          key: (results as any).id,
          value: (results as any).nimi.sv || (results as any).nimi.fi,
        },
        source: 'upperSecondarySchoolObjectivesNew',
        alignmentType: 'teaches',
        targetName: objective.sv || objective.fi,
      });
    });

    (results as any).sisallot?.forEach((contentObject: any) => {
      if (!contentObject.sisallot) {
        throw Error('Missing required data for contents in setLukionTavoitteetSisallot()');
      }
      contentObject.sisallot.forEach((content: any) => {
        if (!content._id || (!content.fi && !content.sv)) {
          throw Error('Missing content specific info in setLukionTavoitteetSisallot()');
        }
        finnishContents.push({
          key: content._id,
          parent: {
            key: (results as any).id,
            value: (results as any).nimi.fi || (results as any).nimi.sv,
          },
          source: 'upperSecondarySchoolContentsNew',
          alignmentType: 'teaches',
          targetName: content.fi || content.sv,
        });

        swedishContents.push({
          key: content._id,
          parent: {
            key: (results as any).id,
            value: (results as any).nimi.sv || (results as any).nimi.fi,
          },
          source: 'upperSecondarySchoolContentsNew',
          alignmentType: 'teaches',
          targetName: content.sv || content.fi,
        });
      });
    });
  }

  try {
    await setAsync(`${rediskeyObjectives}.fi`, JSON.stringify(finnishObjectives));
    await setAsync(`${rediskeyObjectives}.sv`, JSON.stringify(swedishObjectives));
    await setAsync(`${rediskeyObjectives}.en`, JSON.stringify(finnishObjectives));
    await setAsync(`${rediskeyContents}.fi`, JSON.stringify(finnishContents));
    await setAsync(`${rediskeyContents}.sv`, JSON.stringify(swedishContents));
    await setAsync(`${rediskeyContents}.en`, JSON.stringify(finnishContents));
  } catch (err) {
    throw Error(err);
  }
}

export const getLukionTavoitteet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<AlignmentObjectExtended[]> => {
  try {
    const ids: string[] = req.params.ids.split(',');

    const data: AlignmentObjectExtended[] = JSON.parse(
      await getAsync(`${rediskeyObjectives}.${req.params.lang.toLowerCase()}`),
    )
      .filter((objective: AlignmentObjectExtended) => ids.includes(objective.parent.key.toString()))
      .map((objective: AlignmentObjectExtended) => {
        objective.parent = objective.parent.value;

        return objective;
      });

    if (data.length > 0) {
      res.status(200).json(data).end();
      return;
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Getting objectives failed in getLukionTavoitteet()');
  }
};

export const getLukionSisallot = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<AlignmentObjectExtended[]> => {
  try {
    const ids: string[] = req.params.ids.split(',');

    const data: AlignmentObjectExtended[] = JSON.parse(
      await getAsync(`${rediskeyContents}.${req.params.lang.toLowerCase()}`),
    )
      .filter((content: AlignmentObjectExtended) => ids.includes(content.parent.key.toString()))
      .map((content: AlignmentObjectExtended) => {
        content.parent = content.parent.value;

        return content;
      });

    if (data.length > 0) {
      res.status(200).json(data).end();
      return;
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Getting educational contents failed in getLukionSisallot()');
  }
};
