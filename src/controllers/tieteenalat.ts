import { getDataFromApi } from '../util/api.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';
import { winstonLogger } from '../util';
import config from '../config';
import { NextFunction, Request, Response } from 'express';

const endpoint = 'tieteenala';
const rediskey = 'tieteenalat';
const params = 'koodi';

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setTieteenalat(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.opintopolkuKoodistot,
    `/${endpoint}/`,
    {
      Accept: 'application/json',
      'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`,
    },
    params,
  );

  if (!results || (results as any).length < 1) {
    winstonLogger.error('No data from virkailija.opintopolku.fi koodistot in setTieteenalat()');
    return;
  }

  const finnishBranches: AlignmentObjectExtended[] = [
    {
      key: '1',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Luonnontieteet',
      children: [],
    },
    {
      key: '2',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Tekniikka',
      children: [],
    },
    {
      key: '3',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Lääke- ja terveystieteet',
      children: [],
    },
    {
      key: '4',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Maatalous- ja metsätieteet',
      children: [],
    },
    {
      key: '5',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Yhteiskuntatieteet',
      children: [],
    },
    {
      key: '6',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Humanistiset tieteet',
      children: [],
    },
  ];

  const englishBranches: AlignmentObjectExtended[] = [
    {
      key: '1',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Natural sciences',
      children: [],
    },
    {
      key: '2',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Engineering and technology',
      children: [],
    },
    {
      key: '3',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Medical and health sciences',
      children: [],
    },
    {
      key: '4',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Agriculture and forestry',
      children: [],
    },
    {
      key: '5',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Social sciences',
      children: [],
    },
    {
      key: '6',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Humanities',
      children: [],
    },
  ];

  const swedishBranches: AlignmentObjectExtended[] = [
    {
      key: '1',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Naturvetenskaper',
      children: [],
    },
    {
      key: '2',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Teknik',
      children: [],
    },
    {
      key: '3',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Medicin och hälsovetenskaper',
      children: [],
    },
    {
      key: '4',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Jordbruks- och skogsvetenskaper',
      children: [],
    },
    {
      key: '5',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Samhällsvetenskaper',
      children: [],
    },
    {
      key: '6',
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: 'Humanistiska vetenskaper',
      children: [],
    },
  ];

  results.forEach((result: any) => {
    const metadataFi = result.metadata?.find((e: any) => e.kieli.toLowerCase() === 'fi');
    const parentFi = finnishBranches.find((e: any) => e.key === result.koodiArvo.charAt(0));

    const metadataEn = result.metadata?.find((e: any) => e.kieli.toLowerCase() === 'en');
    const parentEn = englishBranches.find((e: any) => e.key === result.koodiArvo.charAt(0));

    const metadataSv = result.metadata?.find((e: any) => e.kieli.toLowerCase() === 'sv');
    const parentSv = swedishBranches.find((e: any) => e.key === result.koodiArvo.charAt(0));

    if (!result.koodiArvo || !result.resourceUri || !metadataFi?.nimi || !metadataEn?.nimi || !metadataSv?.nimi) {
      throw Error('Creating new sets of subjects failed in setTieteenalat(): Missing required data');
    }

    parentFi.children.push({
      key: result.koodiArvo,
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: metadataFi.nimi.trim(),
      targetUrl: result.resourceUri,
    });

    parentEn.children.push({
      key: result.koodiArvo,
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: metadataEn.nimi.trim(),
      targetUrl: result.resourceUri,
    });

    parentSv.children.push({
      key: result.koodiArvo,
      source: 'branchesOfScience',
      alignmentType: 'educationalSubject',
      targetName: metadataSv.nimi.trim(),
      targetUrl: result.resourceUri,
    });
  });

  try {
    finnishBranches.sort((a: any, b: any) => a.key - b.key);
    englishBranches.sort((a: any, b: any) => a.key - b.key);
    swedishBranches.sort((a: any, b: any) => a.key - b.key);

    finnishBranches.forEach((parent: any) => {
      parent.children.sort((a: any, b: any) => a.key - b.key);
    });

    englishBranches.forEach((parent: any) => {
      parent.children.sort((a: any, b: any) => a.key - b.key);
    });

    swedishBranches.forEach((parent: any) => {
      parent.children.sort((a: any, b: any) => a.key - b.key);
    });

    await setAsync(`${rediskey}.fi`, JSON.stringify(finnishBranches));
    await setAsync(`${rediskey}.en`, JSON.stringify(englishBranches));
    await setAsync(`${rediskey}.sv`, JSON.stringify(swedishBranches));
  } catch (err) {
    throw Error(err);
  }
}

/**
 * Get data from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<AlignmentObjectExtended[]>}
 */
export const getTieteenalat = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<AlignmentObjectExtended[]> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`);

    if (redisData) {
      res.status(200).json(JSON.parse(redisData)).end();
      return;
    }

    res.status(404).json({ error: 'Not Found' }).end();
    return;
  } catch (err) {
    next(err);
    winstonLogger.error('Getting educational subjects of higher education failed in getTieteenalat()');
  }
};
