import { getDataFromApi } from '../util/api.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { sortByTargetName } from '../util/data.utils';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';
import { winstonLogger } from '../util';

const endpoint = 'external/peruste';
const rediskeySubjects = 'lukio-uusi-oppiaineet';
const rediskeyModules = 'lukio-uusi-moduulit';
const rediskeyObjectives = 'lukio-uusi-tavoitteet';
const rediskeyContents = 'lukio-uusi-sisallot';
const params = '6828810/lops2019/oppiaineet';

export async function setLukionOppiaineetModuulit(): Promise<any> {
    try {
        const finnishSubjects: AlignmentObjectExtended[] = [];
        const swedishSubjects: AlignmentObjectExtended[] = [];
        const finnishModules: AlignmentObjectExtended[] = [];
        const swedishModules: AlignmentObjectExtended[] = [];

        const results: Record<string, unknown>[] = await getDataFromApi(
            process.env.EPERUSTEET_SERVICE_URL,
            `/${endpoint}/`,
            {
                Accept: 'application/json',
                'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
            },
            params,
        );

        for (const row of results) {
            try {
                const subject: Record<string, unknown>[] = await getDataFromApi(
                    process.env.EPERUSTEET_SERVICE_URL,
                    `/${endpoint}/`,
                    {
                        Accept: 'application/json',
                        'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
                    },
                    `${params}/${row.id}`,
                );

                if ((subject as any).moduulit.length > 0) {
                    finnishSubjects.push({
                        key: (subject as any).id,
                        source: 'upperSecondarySchoolSubjectsNew',
                        alignmentType: 'educationalSubject',
                        targetName: (subject as any).nimi.fi ? (subject as any).nimi.fi : (subject as any).nimi.sv,
                        targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${(subject as any).id}`,
                    });

                    swedishSubjects.push({
                        key: (subject as any).id,
                        source: 'upperSecondarySchoolSubjectsNew',
                        alignmentType: 'educationalSubject',
                        targetName: (subject as any).nimi.sv ? (subject as any).nimi.sv : (subject as any).nimi.fi,
                        targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${(subject as any).id}`,
                    });

                    for (const module of (subject as any).moduulit) {
                        finnishModules.push({
                            key: module.id,
                            parent: {
                                key: (subject as any).id,
                                value: (subject as any).nimi.fi ? (subject as any).nimi.fi : (subject as any).nimi.sv,
                            },
                            source: 'upperSecondarySchoolModulesNew',
                            alignmentType: 'educationalSubject',
                            targetName: module.nimi.fi ? module.nimi.fi : module.nimi.sv,
                            targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${
                                (subject as any).id
                            }/moduulit/${module.id}`,
                        });

                        swedishModules.push({
                            key: module.id,
                            parent: {
                                key: (subject as any).id,
                                value: (subject as any).nimi.sv ? (subject as any).nimi.sv : (subject as any).nimi.fi,
                            },
                            source: 'upperSecondarySchoolModulesNew',
                            alignmentType: 'educationalSubject',
                            targetName: module.nimi.sv ? module.nimi.sv : module.nimi.fi,
                            targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/${
                                (subject as any).id
                            }/moduulit/${module.id}`,
                        });
                    }
                }

                if ((subject as any).oppimaarat.length > 0) {
                    for (const row of (subject as any).oppimaarat) {
                        try {
                            const course: Record<string, unknown>[] = await getDataFromApi(
                                process.env.EPERUSTEET_SERVICE_URL,
                                `/${endpoint}/`,
                                {
                                    Accept: 'application/json',
                                    'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
                                },
                                `${params}/oppimaarat/${row.id}`,
                            );

                            finnishSubjects.push({
                                key: (course as any).id,
                                parent: {
                                    key: (subject as any).id,
                                    value: (subject as any).nimi.fi
                                        ? (subject as any).nimi.fi
                                        : (subject as any).nimi.sv,
                                },
                                source: 'upperSecondarySchoolSubjectsNew',
                                alignmentType: 'educationalSubject',
                                targetName: (course as any).nimi.fi ? (course as any).nimi.fi : (course as any).nimi.sv,
                                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/oppimaarat/${
                                    (course as any).id
                                }`,
                            });

                            swedishSubjects.push({
                                key: (course as any).id,
                                parent: {
                                    key: (subject as any).id,
                                    value: (subject as any).nimi.sv
                                        ? (subject as any).nimi.sv
                                        : (subject as any).nimi.en,
                                },
                                source: 'upperSecondarySchoolSubjectsNew',
                                alignmentType: 'educationalSubject',
                                targetName: (course as any).nimi.sv ? (course as any).nimi.sv : (course as any).nimi.fi,
                                targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${endpoint}/${params}/oppimaarat/${
                                    (course as any).id
                                }`,
                            });

                            for (const module of (course as any).moduulit) {
                                finnishModules.push({
                                    key: module.id,
                                    parent: {
                                        key: (course as any).id,
                                        value: (course as any).nimi.fi
                                            ? (course as any).nimi.fi
                                            : (course as any).nimi.sv,
                                    },
                                    source: 'upperSecondarySchoolModulesNew',
                                    alignmentType: 'educationalSubject',
                                    targetName: module.nimi.fi ? module.nimi.fi : module.nimi.sv,
                                    targetUrl: `${
                                        process.env.EPERUSTEET_SERVICE_URL
                                    }/${endpoint}/${params}/oppimaarat/${(course as any).id}/moduulit/${module.id}`,
                                });

                                swedishModules.push({
                                    key: module.id,
                                    parent: {
                                        key: (course as any).id,
                                        value: (course as any).nimi.sv
                                            ? (course as any).nimi.sv
                                            : (course as any).nimi.fi,
                                    },
                                    source: 'upperSecondarySchoolModulesNew',
                                    alignmentType: 'educationalSubject',
                                    targetName: module.nimi.sv ? module.nimi.sv : module.nimi.fi,
                                    targetUrl: `${
                                        process.env.EPERUSTEET_SERVICE_URL
                                    }/${endpoint}/${params}/oppimaarat/${(course as any).id}/moduulit/${module.id}`,
                                });
                            }
                        } catch (err) {
                            winstonLogger.error(
                                'Setting courses and modules failed in setLukionOppiaineetModuulit(): %o',
                                err,
                            );
                        }
                    }
                }
            } catch (err) {
                winstonLogger.error(
                    'Setting educational subjects and modules failed in setLukionOppiaineetModuulit(): %o',
                    err,
                );
            }
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
        winstonLogger.error(
            'Getting educational subjects from virkailija.opintopolku.fi failed in setLukionOppiaineetModuulit(): %o',
            err,
        );
    }
}

export const getLukionOppiaineet = async (req: any, res: any, next: any): Promise<any> => {
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
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error('Getting educational subjects failed in getLukionOppiaineet(): %o', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const getLukionModuulit = async (req: any, res: any, next: any): Promise<any> => {
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
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error('Getting educational modules failed in getLukionModuulit(): %o', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export async function setLukionTavoitteetSisallot(): Promise<any> {
    try {
        const finnishObjectives: AlignmentObjectExtended[] = [];
        const swedishObjectives: AlignmentObjectExtended[] = [];
        const finnishContents: AlignmentObjectExtended[] = [];
        const swedishContents: AlignmentObjectExtended[] = [];

        const modules: { id: string; subjectId: number }[] = JSON.parse(await getAsync(`${rediskeyModules}.fi`)).map(
            (m: AlignmentObjectExtended) => {
                return {
                    id: m.key,
                    subjectId: m.parent.key,
                };
            },
        );

        for (const module of modules) {
            try {
                const conditions = [
                    6832790, 6834385, 6832794, 6832792, 6832796, 6832793, 6834389, 6834387, 6835372, 6832791, 6834388,
                    6835370, 6832795, 6834386, 6832797,
                ];
                const urlParam: string = conditions.some((el: number) => module.subjectId === el)
                    ? `${params}`
                    : `${params}/oppimaarat`;

                const results: Record<string, unknown>[] = await getDataFromApi(
                    process.env.EPERUSTEET_SERVICE_URL,
                    `/${endpoint}/`,
                    {
                        Accept: 'application/json',
                        'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
                    },
                    `${urlParam}/${module.subjectId}/moduulit/${module.id}`,
                );

                (results as any).tavoitteet.tavoitteet?.forEach((objective: any) => {
                    finnishObjectives.push({
                        key: objective._id,
                        parent: {
                            key: (results as any).id,
                            value: (results as any).nimi.fi ? (results as any).nimi.fi : (results as any).nimi.sv,
                        },
                        source: 'upperSecondarySchoolObjectivesNew',
                        alignmentType: 'teaches',
                        targetName: objective.fi ? objective.fi : objective.sv,
                    });

                    swedishObjectives.push({
                        key: objective._id,
                        parent: {
                            key: (results as any).id,
                            value: (results as any).nimi.sv ? (results as any).nimi.sv : (results as any).nimi.fi,
                        },
                        source: 'upperSecondarySchoolObjectivesNew',
                        alignmentType: 'teaches',
                        targetName: objective.sv ? objective.sv : objective.fi,
                    });
                });

                (results as any).sisallot.forEach((contentObject: any) => {
                    contentObject.sisallot?.forEach((content: any) => {
                        finnishContents.push({
                            key: content._id,
                            parent: {
                                key: (results as any).id,
                                value: (results as any).nimi.fi ? (results as any).nimi.fi : (results as any).nimi.sv,
                            },
                            source: 'upperSecondarySchoolContentsNew',
                            alignmentType: 'teaches',
                            targetName: content.fi ? content.fi : content.sv,
                        });

                        swedishContents.push({
                            key: content._id,
                            parent: {
                                key: (results as any).id,
                                value: (results as any).nimi.sv ? (results as any).nimi.sv : (results as any).nimi.fi,
                            },
                            source: 'upperSecondarySchoolContentsNew',
                            alignmentType: 'teaches',
                            targetName: content.sv ? content.sv : content.fi,
                        });
                    });
                });
            } catch (err) {
                winstonLogger.error('Setting objectives and contents failed in setLukionTavoitteetSisallot(): %o', err);
            }
        }

        await setAsync(`${rediskeyObjectives}.fi`, JSON.stringify(finnishObjectives));
        await setAsync(`${rediskeyObjectives}.sv`, JSON.stringify(swedishObjectives));
        await setAsync(`${rediskeyObjectives}.en`, JSON.stringify(finnishObjectives));
        await setAsync(`${rediskeyContents}.fi`, JSON.stringify(finnishContents));
        await setAsync(`${rediskeyContents}.sv`, JSON.stringify(swedishContents));
        await setAsync(`${rediskeyContents}.en`, JSON.stringify(finnishContents));
    } catch (err) {
        winstonLogger.error('Getting educational modules failed in setLukionTavoitteetSisallot(): %o', err);
    }
}

export const getLukionTavoitteet = async (req: any, res: any, next: any): Promise<any> => {
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
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error('Getting objectives failed in getLukionTavoitteet(): %o', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const getLukionSisallot = async (req: any, res: any, next: any): Promise<any> => {
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
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error('Getting educational contents failed in getLukionSisallot(): %o', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
