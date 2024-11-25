import { getDataFromApi } from '../util/api.utils';
import { sortByTargetName } from '../util/data.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';
import { winstonLogger } from '../util';
import config from '../config';
import { Request, Response, NextFunction } from 'express';

const endpoint = 'external/peruste';
const rediskeyTuvaSubjects = 'tuva-oppiaineet';
const preporatoryEducationId = '7534950';
const rediskeyTuvaObjectives = 'tuva-tavoitteet';

export async function setTuvaOppiaineetTavoitteet(): Promise<void> {
  const finnishSubjects: AlignmentObjectExtended[] = [];
  const swedishSubjects: AlignmentObjectExtended[] = [];
  const finnishObjectives: AlignmentObjectExtended[] = [];
  const swedishObjectives: AlignmentObjectExtended[] = [];

  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.ePerusteet || 'not-defined',
    `/${endpoint}/`,
    {
      Accept: 'application/json',
      'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`,
    },
    `${preporatoryEducationId}`,
  );

  if (!results || !(results as any).koulutuksenOsat || (results as any).koulutuksenOsat.length < 1) {
    throw Error('No data from ePerusteet in setTuvaOppiaineetTavoitteet()');
  }

  (results as any).koulutuksenOsat.forEach((subject: any) => {
    if (!subject.id || (!subject.nimi?.fi && !subject.nimi?.sv)) {
      throw Error(
        'Creating new sets of educational subjects failed in setTuvaOppiaineetTavoitteet(): Missing required data',
      );
    }

    const targetNameFi: string = subject.nimi.fi || subject.nimi.sv;
    const targetNameSv: string = subject.nimi.sv || subject.nimi.fi;

    finnishSubjects.push({
      key: subject.id,
      source: 'preparatoryEducationSubjects',
      alignmentType: 'educationalSubject',
      targetName: targetNameFi,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${preporatoryEducationId}`,
    });

    swedishSubjects.push({
      key: subject.id,
      source: 'preparatoryEducationSubjects',
      alignmentType: 'educationalSubject',
      targetName: targetNameSv,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${preporatoryEducationId}`,
    });

    if (subject.tavoitteet?.length > 0) {
      subject.tavoitteet.forEach((objective: any) => {
        if (!objective._id || (!objective.fi && !objective.sv) || !subject.id) {
          throw Error('Creating new sets of objectives failed in setTuvaOppiaineetTavoitteet(): Missing required data');
        }

        finnishObjectives.push({
          key: objective._id,
          parent: {
            key: (subject as any).id,
            value: (subject as any).nimi.fi || (subject as any).nimi.sv,
          },
          source: 'preparatoryEducationObjectives',
          alignmentType: 'teaches',
          targetName: objective.fi || objective.sv,
          targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${preporatoryEducationId}`,
        });

        swedishObjectives.push({
          key: objective._id,
          parent: {
            key: (subject as any).id,
            value: (subject as any).nimi.sv || (subject as any).nimi.fi,
          },
          source: 'preparatoryEducationObjectives',
          alignmentType: 'teaches',
          targetName: objective.sv || objective.fi,
          targetUrl: `${config.EXTERNAL_API.ePerusteet}/${endpoint}/${preporatoryEducationId}`,
        });
      });
    }
  });

  try {
    finnishSubjects.sort(sortByTargetName);
    swedishSubjects.sort(sortByTargetName);
    await setAsync(`${rediskeyTuvaSubjects}.fi`, JSON.stringify(finnishSubjects));
    await setAsync(`${rediskeyTuvaSubjects}.sv`, JSON.stringify(swedishSubjects));
    await setAsync(`${rediskeyTuvaSubjects}.en`, JSON.stringify(finnishSubjects));
    await setAsync(`${rediskeyTuvaObjectives}.fi`, JSON.stringify(finnishObjectives));
    await setAsync(`${rediskeyTuvaObjectives}.sv`, JSON.stringify(swedishObjectives));
    await setAsync(`${rediskeyTuvaObjectives}.en`, JSON.stringify(finnishObjectives));
  } catch (err) {
    throw Error(err);
  }
}

export const getTuvaOppiaineet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<AlignmentObjectExtended[]> => {
  try {
    const data: string = await getAsync(`${rediskeyTuvaSubjects}.${req.params.lang.toLowerCase()}`);

    if (data) {
      res.status(200).json(JSON.parse(data)).end();
      return;
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Getting educational subjects failed in getTuvaOppiaineet()');
  }
};

export const getTuvaTavoitteet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<AlignmentObjectExtended[]> => {
  try {
    const redisData: AlignmentObjectExtended[] = JSON.parse(
      await getAsync(`${rediskeyTuvaObjectives}.${req.params.lang.toLowerCase()}`),
    );
    const ids: string[] = req.params.ids.split(',');

    const data: AlignmentObjectExtended[] = redisData
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
    winstonLogger.error('Getting educational objectives failed in getTuvaTavoitteet()');
  }
};
