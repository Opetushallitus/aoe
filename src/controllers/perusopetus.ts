import striptags from 'striptags';

import { getDataFromApi } from '../util/api.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';
import { sortByTargetName } from '../util/data.utils';
import { winstonLogger } from '../util';

const endpoint = 'external/peruste';
const rediskeySubjects = 'oppiaineet';
const rediskeyObjectives = 'tavoitteet';
const rediskeyContents = 'sisaltoalueet';
const rediskeyTransversalCompetences = 'laaja-alaiset-osaamiset';
const params = '419550/perusopetus/oppiaineet';

/**
 * Set data into redis database
 *
 * @returns {Promise<any>}
 */
export async function setPerusopetuksenOppiaineet(): Promise<any> {
    try {
        const results: Record<string, unknown>[] = await getDataFromApi(
            process.env.EPERUSTEET_SERVICE_URL,
            `/${endpoint}/`,
            {
                Accept: 'application/json',
                'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
            },
            params,
        );

        const subjectIds: any[] = [];
        const finnishSubjects: AlignmentObjectExtended[] = [];
        const swedishSubjects: AlignmentObjectExtended[] = [];
        const finnishObjectives: AlignmentObjectExtended[] = [];
        const swedishObjectives: AlignmentObjectExtended[] = [];
        const finnishContents: AlignmentObjectExtended[] = [];
        const swedishContents: AlignmentObjectExtended[] = [];
        const finnishCompetences: AlignmentObjectExtended[] = [];
        const swedishCompetences: AlignmentObjectExtended[] = [];
        // const englishCompetences: AlignmentObjectExtended[] = [];

        results.forEach((result: any) => {
            if (result.oppimaarat) {
                subjectIds.push({
                    key: result.id,
                });

                result.oppimaarat.forEach((oppimaara: any) => {
                    subjectIds.push({
                        key: oppimaara.id,
                        parent: result.id,
                    });
                });
            } else {
                subjectIds.push({
                    key: result.id,
                    parent: 999,
                });
            }
        });

        const subjects: any[] = [
            {
                key: 999,
                name: {
                    fi: 'Muut oppiaineet',
                    sv: 'Muut oppiaineet',
                },
            },
        ];

        for (const row of subjectIds) {
            try {
                const conditions = [
                    478970, 502088, 466346, 466345, 530524, 466347, 502086, 466342, 530525, 478971, 466344, 466343,
                    605632, 478973, 478972, 428820, 600170, 466340, 605630, 502087,
                ];
                const urlParam: string = conditions.some((el: number) => row.key === el)
                    ? `${params}/${row.key}`
                    : `${params}/oppimaarat/${row.key}`;

                const result: Record<string, unknown>[] = await getDataFromApi(
                    process.env.EPERUSTEET_SERVICE_URL,
                    `/${endpoint}/`,
                    {
                        Accept: 'application/json',
                        'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
                    },
                    urlParam,
                );

                subjects.push({
                    ...row,
                    name: (result as any).nimi,
                });

                (result as any).vuosiluokkakokonaisuudet.forEach((gradeEntity: any) => {
                    if (gradeEntity.tavoitteet.length > 0) {
                        gradeEntity.tavoitteet.forEach((objective: any) => {
                            const objectiveValue = objective.tavoite;

                            if (objectiveValue.fi) {
                                objectiveValue.fi = striptags(objectiveValue.fi).trim();
                            }

                            if (objectiveValue.sv) {
                                objectiveValue.sv = striptags(objectiveValue.sv).trim();
                            }

                            finnishObjectives.push({
                                key: objective.id,
                                parent: {
                                    key: (result as any).id,
                                    value: (result as any).nimi.fi ? (result as any).nimi.fi : (result as any).nimi.sv,
                                },
                                gradeEntity: gradeEntity.id,
                                source: 'basicStudyObjectives',
                                alignmentType: 'teaches',
                                targetName: objectiveValue.fi ? objectiveValue.fi : objectiveValue.sv,
                                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${urlParam}`,
                            });

                            swedishObjectives.push({
                                key: objective.id,
                                parent: {
                                    key: (result as any).id,
                                    value: (result as any).nimi.sv ? (result as any).nimi.sv : (result as any).nimi.fi,
                                },
                                gradeEntity: gradeEntity.id,
                                source: 'basicStudyObjectives',
                                alignmentType: 'teaches',
                                targetName: objectiveValue.sv ? objectiveValue.sv : objectiveValue.fi,
                                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${urlParam}`,
                            });
                        });
                    }

                    if (gradeEntity.sisaltoalueet.length > 0) {
                        gradeEntity.sisaltoalueet.forEach((content: any) => {
                            if (content.nimi.fi) {
                                content.nimi.fi = striptags(content.nimi.fi).trim();
                            }

                            if (content.nimi.sv) {
                                content.nimi.sv = striptags(content.nimi.sv).trim();
                            }

                            finnishContents.push({
                                key: content.id,
                                parent: {
                                    key: (result as any).id,
                                    value: (result as any).nimi.fi ? (result as any).nimi.fi : (result as any).nimi.sv,
                                },
                                gradeEntity: gradeEntity.id,
                                source: 'basicStudyContents',
                                alignmentType: 'teaches',
                                targetName: content.nimi.fi ? content.nimi.fi : content.nimi.sv,
                                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${urlParam}`,
                            });

                            swedishContents.push({
                                key: content.id,
                                parent: {
                                    key: (result as any).id,
                                    value: (result as any).nimi.sv ? (result as any).nimi.sv : (result as any).nimi.fi,
                                },
                                gradeEntity: gradeEntity.id,
                                source: 'basicStudyContents',
                                alignmentType: 'teaches',
                                targetName: content.nimi.sv ? content.nimi.sv : content.nimi.fi,
                                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${urlParam}`,
                            });
                        });
                    }
                });
            } catch (err) {
                winstonLogger.error(
                    'Setting educational contents and learning objects failed in setPerusopetuksenOppiaineet(): %o',
                    err,
                );
            }
        }

        try {
            const competenceParams = '419550/perusopetus/laajaalaisetosaamiset';
            const results: Record<string, unknown>[] = await getDataFromApi(
                process.env.EPERUSTEET_SERVICE_URL,
                `/${endpoint}/`,
                {
                    Accept: 'application/json',
                    'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
                },
                `${competenceParams}`,
            );

            results.forEach((competence: any) => {
                finnishCompetences.push({
                    key: competence.id,
                    parent: 'Laaja-alaisen osaamisen alueet',
                    source: 'basicStudyContents',
                    alignmentType: 'teaches',
                    targetName: competence.nimi.fi ? competence.nimi.fi : competence.nimi.sv,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${competenceParams}/${competence.id}`,
                });

                swedishCompetences.push({
                    key: competence.id,
                    parent: 'Mångsidiga kompetensområden',
                    source: 'basicStudyContents',
                    alignmentType: 'teaches',
                    targetName: competence.nimi.sv ? competence.nimi.sv : competence.nimi.fi,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${competenceParams}/${competence.id}`,
                });

                /*englishCompetences.push({
          key: competence.id,
          parent: "Transversal competences",
          source: "basicStudyContents",
          alignmentType: "teaches",
          targetName: competence.nimi.en ? competence.nimi.en : competence.nimi.fi,
          targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${competenceParams}/${competence.id}`,
        });*/
            });

            finnishCompetences.sort(sortByTargetName);
            swedishCompetences.sort(sortByTargetName);
            // englishCompetences.sort(sortByTargetName);

            await setAsync(`${rediskeyTransversalCompetences}.fi`, JSON.stringify(finnishCompetences));
            await setAsync(`${rediskeyTransversalCompetences}.sv`, JSON.stringify(swedishCompetences));
            await setAsync(`${rediskeyTransversalCompetences}.en`, JSON.stringify(finnishCompetences)); // use fi as there's no en version yet
        } catch (err) {
            winstonLogger.error('Setting transversal competences failed in setPerusopetuksenOppiaineet(): %o', err);
        }

        await Promise.all(subjects).then((data: Awaited<unknown>[]) => {
            data.forEach((subject: Awaited<unknown>[]) => {
                const urlParam: string = (subject as any).key === 999 ? `${params}` : `${params}/oppimaarat`;
                const childrenFi: AlignmentObjectExtended[] = data
                    .filter((e: Awaited<unknown>[]) => (e as any).parent === (subject as any).key)
                    .map<AlignmentObjectExtended>((child: Awaited<unknown>[]) => {
                        return {
                            key: (child as any).key,
                            source: 'basicStudySubjects',
                            alignmentType: 'educationalSubject',
                            targetName: (child as any).name.fi ? (child as any).name.fi : (child as any).name.sv,
                            targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${urlParam}/${
                                (child as any).key
                            }`,
                        };
                    })
                    .sort(sortByTargetName);

                const childrenSv: AlignmentObjectExtended[] = data
                    .filter((e: Awaited<unknown>[]) => (e as any).parent === (subject as any).key)
                    .map<AlignmentObjectExtended>((child: Awaited<unknown>[]) => {
                        return {
                            key: (child as any).key,
                            source: 'basicStudySubjects',
                            alignmentType: 'educationalSubject',
                            targetName: (child as any).name.sv ? (child as any).name.sv : (child as any).name.fi,
                            targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${urlParam}/${
                                (child as any).key
                            }`,
                        };
                    })
                    .sort(sortByTargetName);

                if (!(subject as any).parent) {
                    finnishSubjects.push({
                        key: (subject as any).key,
                        source: 'basicStudySubjects',
                        alignmentType: 'educationalSubject',
                        targetName: (subject as any).name.fi ? (subject as any).name.fi : (subject as any).name.sv,
                        children: childrenFi,
                    });

                    swedishSubjects.push({
                        key: (subject as any).key,
                        source: 'basicStudySubjects',
                        alignmentType: 'educationalSubject',
                        targetName: (subject as any).name.sv ? (subject as any).name.sv : (subject as any).name.fi,
                        children: childrenSv,
                    });
                }
            });
        });

        finnishSubjects.sort(sortByTargetName);
        swedishSubjects.sort(sortByTargetName);

        await setAsync(`${rediskeySubjects}.fi`, JSON.stringify(finnishSubjects));
        await setAsync(`${rediskeySubjects}.sv`, JSON.stringify(swedishSubjects));
        await setAsync(`${rediskeySubjects}.en`, JSON.stringify(finnishSubjects));

        finnishObjectives.sort(sortByTargetName).sort((a, b) => a.gradeEntity - b.gradeEntity);

        swedishObjectives.sort(sortByTargetName).sort((a, b) => a.gradeEntity - b.gradeEntity);

        await setAsync(`${rediskeyObjectives}.fi`, JSON.stringify(finnishObjectives));
        await setAsync(`${rediskeyObjectives}.sv`, JSON.stringify(swedishObjectives));
        await setAsync(`${rediskeyObjectives}.en`, JSON.stringify(finnishObjectives));

        finnishContents.sort(sortByTargetName).sort((a, b) => a.gradeEntity - b.gradeEntity);

        swedishContents.sort(sortByTargetName).sort((a, b) => a.gradeEntity - b.gradeEntity);

        await setAsync(`${rediskeyContents}.fi`, JSON.stringify(finnishContents));
        await setAsync(`${rediskeyContents}.sv`, JSON.stringify(swedishContents));
        await setAsync(`${rediskeyContents}.en`, JSON.stringify(finnishContents));
    } catch (err) {
        winstonLogger.error(
            'Setting subjects, objectives and contents failed in setPerusopetuksenOppiaineet(): %o',
            err,
        );
    }
}

/**
 * Get data from redis database
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 *
 * @returns {Promise<any>}
 */
export const getPerusopetuksenOppiaineet = async (req: any, res: any, next: any): Promise<any> => {
    try {
        const redisData: string = await getAsync(`${rediskeySubjects}.${req.params.lang.toLowerCase()}`);

        if (redisData) {
            res.status(200).json(JSON.parse(redisData));
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error('Getting educational subjects failed in getPerusopetuksenOppiaineet(): %o', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

/**
 * Get data from redis database
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 *
 * @returns {Promise<any>}
 */
export const getPerusopetuksenTavoitteet = async (req: any, res: any, next: any): Promise<any> => {
    try {
        const redisData: AlignmentObjectExtended[] = JSON.parse(
            await getAsync(`${rediskeyObjectives}.${req.params.lang.toLowerCase()}`),
        );
        const ids: string[] = req.params.ids.split(',');

        const data: AlignmentObjectExtended[] = redisData
            .filter((objective: AlignmentObjectExtended) => ids.includes(objective.parent.key.toString()))
            .map((objective: AlignmentObjectExtended) => {
                objective.parent = objective.parent.value;

                return objective;
            });

        if (data.length > 0) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error('Getting educational objects failed in getPerusopetuksenTavoitteet(): %o', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

/**
 * Get data from redis database
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 *
 * @returns {Promise<any>}
 */
export const getPerusopetuksenSisaltoalueet = async (req: any, res: any, next: any): Promise<any> => {
    try {
        let data: AlignmentObjectExtended[] = [];
        const ids: string[] = req.params.ids.split(',');
        const competences: AlignmentObjectExtended[] = JSON.parse(
            await getAsync(`${rediskeyTransversalCompetences}.${req.params.lang.toLowerCase()}`),
        );

        if (competences) {
            data = data.concat(competences);
        }

        JSON.parse(await getAsync(`${rediskeyContents}.${req.params.lang.toLowerCase()}`))
            .filter((content: AlignmentObjectExtended) => ids.includes(content.parent.key.toString()))
            .forEach((content: AlignmentObjectExtended) => {
                content.parent = content.parent.value;

                data.push(content);
            });

        if (data.length > 0) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error('Getting educational contents failed in getPerusopetuksenSisaltoalueet(): %o', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
