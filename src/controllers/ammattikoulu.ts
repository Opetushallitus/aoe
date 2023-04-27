import { getDataFromApi } from '../util/api.utils';
import { getUnique, sortByTargetName } from '../util/data.utils';
import { getAsync, setAsync } from '../util/redis.utils';
import { AlignmentObjectExtended } from '../models/alignment-object-extended';
import { winstonLogger } from '../util';

const endpoint = 'perusteet';
const newEndpoint = 'external/perusteet';
const degreeEndpoint = 'external/peruste';
const rediskeyBasicDegrees = 'ammattikoulu-perustutkinnot';
const rediskeyFurtherVocQuals = 'ammattikoulu-ammattitutkinnot';
const rediskeySpecialistVocQuals = 'ammattikoulu-erikoisammattitutkinnot';
const rediskeyUnits = 'ammattikoulu-tutkinnonosat';
const rediskeyRequirements = 'ammattikoulu-vaatimukset';
const rediskeyYTO = 'ammattikoulun-yto-aineet';

export async function setAmmattikoulunPerustutkinnot(): Promise<any> {
    try {
        let finnishDegrees: AlignmentObjectExtended[] = [];
        let swedishDegrees: AlignmentObjectExtended[] = [];
        let englishDegrees: AlignmentObjectExtended[] = [];
        let pageNumber = 0;
        let getResults = true;

        while (getResults) {
            const results = await getDataFromApi(
                process.env.EPERUSTEET_SERVICE_URL || 'not-defined',
                `/${newEndpoint}/`,
                {
                    Accept: 'application/json',
                    'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
                },
                `?sivu=${pageNumber}&tuleva=true&siirtyma=true&voimassaolo=true&poistunut=false&koulutustyyppi=koulutustyyppi_1`,
            );

            results.data.forEach((degree: any) => {
                let targetNameFi = degree.nimi.fi ? degree.nimi.fi : degree.nimi.sv;
                let targetNameSv = degree.nimi.sv ? degree.nimi.sv : degree.nimi.fi;
                let targetNameEn = degree.nimi.en ? degree.nimi.en : degree.nimi.fi ? degree.nimi.fi : degree.nimi.sv;
                const validityStarts = degree.voimassaoloAlkaa;
                const transitionTimeEnds = degree.siirtymaPaattyy;
                const now = new Date().getTime();

                if (validityStarts > now) {
                    targetNameFi = `${targetNameFi} (Tuleva)`;
                    targetNameSv = `${targetNameSv} (På kommande)`;
                    targetNameEn = `${targetNameEn} (In progress)`;
                }

                if (transitionTimeEnds) {
                    targetNameFi = `${targetNameFi} (Siirtymäajalla)`;
                    targetNameSv = `${targetNameSv} (Övergångstid)`;
                    targetNameEn = `${targetNameEn} (On transition time)`;
                }

                finnishDegrees.push({
                    key: degree.id,
                    source: 'vocationalDegrees',
                    alignmentType: 'educationalSubject',
                    targetName: targetNameFi,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${degreeEndpoint}/${degree.id}`,
                });

                swedishDegrees.push({
                    key: degree.id,
                    source: 'vocationalDegrees',
                    alignmentType: 'educationalSubject',
                    targetName: targetNameSv,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${degreeEndpoint}/${degree.id}`,
                });

                englishDegrees.push({
                    key: degree.id,
                    source: 'vocationalDegrees',
                    alignmentType: 'educationalSubject',
                    targetName: targetNameEn,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${degreeEndpoint}/${degree.id}`,
                });
            });

            pageNumber = results.sivu + 1;

            if (pageNumber >= results.sivuja) {
                getResults = false;
            }
        }

        finnishDegrees.sort(sortByTargetName);
        swedishDegrees.sort(sortByTargetName);
        englishDegrees.sort(sortByTargetName);

        finnishDegrees = getUnique(finnishDegrees, 'targetName');
        swedishDegrees = getUnique(swedishDegrees, 'targetName');
        englishDegrees = getUnique(englishDegrees, 'targetName');

        await setAsync(`${rediskeyBasicDegrees}.fi`, JSON.stringify(finnishDegrees));
        await setAsync(`${rediskeyBasicDegrees}.sv`, JSON.stringify(swedishDegrees));
        await setAsync(`${rediskeyBasicDegrees}.en`, JSON.stringify(englishDegrees));
    } catch (err) {
        winstonLogger.error('Setting educational subjects failed in setAmmattikoulunPerustutkinnot(): %o', err);
    }
}

export const getAmmattikoulunPerustutkinnot = async (req: any, res: any, next: any): Promise<any> => {
    try {
        const data = await getAsync(`${rediskeyBasicDegrees}.${req.params.lang.toLowerCase()}`);

        if (data) {
            res.status(200).json(JSON.parse(data));
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error('Getting educational subjects failed in getAmmattikoulunPerustutkinnot(): %o', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export async function setAmmattikoulunTutkinnonOsat(): Promise<any> {
    try {
        const finnishUnits: AlignmentObjectExtended[] = [];
        const swedishUnits: AlignmentObjectExtended[] = [];
        const englishUnits: AlignmentObjectExtended[] = [];
        const finnishRequirements: AlignmentObjectExtended[] = [];
        const swedishRequirements: AlignmentObjectExtended[] = [];

        let degrees: number[] = JSON.parse(<string>await getAsync(`${rediskeyBasicDegrees}.fi`)).map(
            (d: AlignmentObjectExtended) => d.key,
        );
        degrees = degrees.concat(
            JSON.parse(<string>await getAsync(`${rediskeyFurtherVocQuals}.fi`)).map(
                (d: AlignmentObjectExtended) => d.key,
            ),
        );
        degrees = degrees.concat(
            JSON.parse(<string>await getAsync(`${rediskeySpecialistVocQuals}.fi`)).map(
                (d: AlignmentObjectExtended) => d.key,
            ),
        );

        for (const degree of degrees) {
            try {
                const results = await getDataFromApi(
                    process.env.EPERUSTEET_SERVICE_URL || 'not-defined',
                    `/${degreeEndpoint}/`,
                    {
                        Accept: 'application/json',
                        'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
                    },
                    `${degree}`,
                );

                results.tutkinnonOsat?.forEach((unit: any) => {
                    finnishUnits.push({
                        key: unit.id,
                        parent: {
                            key: results.id,
                            value: results.nimi.fi ? results.nimi.fi : results.nimi.sv,
                        },
                        source: 'vocationalUnits',
                        alignmentType: 'educationalSubject',
                        targetName: unit.nimi.fi ? unit.nimi.fi : unit.nimi.sv,
                    });

                    swedishUnits.push({
                        key: unit.id,
                        parent: {
                            key: results.id,
                            value: results.nimi.sv ? results.nimi.sv : results.nimi.fi,
                        },
                        source: 'vocationalUnits',
                        alignmentType: 'educationalSubject',
                        targetName: unit.nimi.sv ? unit.nimi.sv : unit.nimi.fi,
                    });

                    englishUnits.push({
                        key: unit.id,
                        parent: {
                            key: results.id,
                            value: results.nimi.en
                                ? results.nimi.en
                                : results.nimi.fi
                                ? results.nimi.fi
                                : results.nimi.sv,
                        },
                        source: 'vocationalUnits',
                        alignmentType: 'educationalSubject',
                        targetName: unit.nimi.en ? unit.nimi.en : unit.nimi.fi ? unit.nimi.fi : unit.nimi.sv,
                    });

                    // vocational competence requirements
                    unit.ammattitaitovaatimukset2019?.kohdealueet?.forEach((target: any) => {
                        target.vaatimukset?.forEach((requirement: any) => {
                            finnishRequirements.push({
                                key: requirement.koodi?.arvo ? requirement.koodi.arvo : requirement.vaatimus._id,
                                parent: {
                                    key: unit.id,
                                    value: target.kuvaus.fi ? target.kuvaus.fi : target.kuvaus.sv,
                                },
                                source: 'vocationalRequirements',
                                alignmentType: 'teaches',
                                targetName: requirement.vaatimus.fi ? requirement.vaatimus.fi : requirement.vaatimus.sv,
                            });

                            swedishRequirements.push({
                                key: requirement.koodi?.arvo ? requirement.koodi.arvo : requirement.vaatimus._id,
                                parent: {
                                    key: unit.id,
                                    value: target.kuvaus.sv ? target.kuvaus.sv : target.kuvaus.fi,
                                },
                                source: 'vocationalRequirements',
                                alignmentType: 'teaches',
                                targetName: requirement.vaatimus.sv ? requirement.vaatimus.sv : requirement.vaatimus.fi,
                            });
                        });
                    });
                });
            } catch (err) {
                winstonLogger.error(
                    'Setting units of vocational education and competence requirements failed in setAmmattikoulunTutkinnonOsat(): %o',
                    err,
                );
            }

            await setAsync(`${rediskeyUnits}.fi`, JSON.stringify(finnishUnits));
            await setAsync(`${rediskeyUnits}.sv`, JSON.stringify(swedishUnits));
            await setAsync(`${rediskeyUnits}.en`, JSON.stringify(englishUnits));
            await setAsync(`${rediskeyRequirements}.fi`, JSON.stringify(finnishRequirements));
            await setAsync(`${rediskeyRequirements}.sv`, JSON.stringify(swedishRequirements));
            await setAsync(`${rediskeyRequirements}.en`, JSON.stringify(finnishRequirements));
        }
    } catch (err) {
        winstonLogger.error(
            'Getting educational subjects and qualifications failed in setAmmattikoulunTutkinnonOsat(): %o',
            err,
        );
    }
}

export const getAmmattikoulunTutkinnonOsat = async (req: any, res: any, next: any): Promise<any> => {
    try {
        const ids = req.params.ids.split(',');
        const data = JSON.parse(<string>await getAsync(`${rediskeyUnits}.${req.params.lang.toLowerCase()}`))
            .filter((unit: AlignmentObjectExtended) => ids.includes(unit.parent.key.toString()))
            .map((unit: AlignmentObjectExtended) => {
                unit.parent = unit.parent.value;

                return unit;
            });

        if (data.length > 0) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error('Getting units of vocational education failed in getAmmattikoulunTutkinnonOsat(): %o', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const getAmmattikoulunVaatimukset = async (req: any, res: any, next: any): Promise<any> => {
    try {
        const ids = req.params.ids.split(',');

        const data = JSON.parse(<string>await getAsync(`${rediskeyRequirements}.${req.params.lang.toLowerCase()}`))
            .filter((requirement: AlignmentObjectExtended) => ids.includes(requirement.parent.key.toString()))
            .map((requirement: AlignmentObjectExtended) => {
                requirement.parent = requirement.parent.value;

                return requirement;
            });

        if (data.length > 0) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error(
            'Getting learning objects of vocational education failed in getAmmattikoulunVaatimukset(): %o',
            err,
        );
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export async function setAmmattikoulunAmmattitutkinnot(): Promise<any> {
    try {
        let finnishQuals: AlignmentObjectExtended[] = [];
        let swedishQuals: AlignmentObjectExtended[] = [];
        let englishQuals: AlignmentObjectExtended[] = [];
        let pageNumber = 0;
        let getResults = true;

        while (getResults) {
            const results = await getDataFromApi(
                process.env.EPERUSTEET_SERVICE_URL || 'not-defined',
                `/${newEndpoint}/`,
                {
                    Accept: 'application/json',
                    'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
                },
                `?sivu=${pageNumber}&tuleva=true&siirtyma=true&voimassaolo=true&poistunut=false&koulutustyyppi=koulutustyyppi_11`,
            );

            results.data.forEach((degree: any) => {
                let targetNameFi = degree.nimi.fi ? degree.nimi.fi : degree.nimi.sv;
                let targetNameSv = degree.nimi.sv ? degree.nimi.sv : degree.nimi.fi;
                let targetNameEn = degree.nimi.en ? degree.nimi.en : degree.nimi.fi ? degree.nimi.fi : degree.nimi.sv;
                const validityStarts = degree.voimassaoloAlkaa;
                const transitionTimeEnds = degree.siirtymaPaattyy;
                const now = new Date().getTime();

                if (validityStarts > now) {
                    targetNameFi = `${targetNameFi} (Tuleva)`;
                    targetNameSv = `${targetNameSv} (På kommande)`;
                    targetNameEn = `${targetNameEn} (In progress)`;
                }

                if (transitionTimeEnds) {
                    targetNameFi = `${targetNameFi} (Siirtymäajalla)`;
                    targetNameSv = `${targetNameSv} (Övergångstid)`;
                    targetNameEn = `${targetNameEn} (On transition time)`;
                }

                finnishQuals.push({
                    key: degree.id,
                    source: 'furtherVocationalQualifications',
                    alignmentType: 'educationalSubject',
                    targetName: targetNameFi,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${degreeEndpoint}/${degree.id}`,
                });

                swedishQuals.push({
                    key: degree.id,
                    source: 'furtherVocationalQualifications',
                    alignmentType: 'educationalSubject',
                    targetName: targetNameSv,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${degreeEndpoint}/${degree.id}`,
                });

                englishQuals.push({
                    key: degree.id,
                    source: 'furtherVocationalQualifications',
                    alignmentType: 'educationalSubject',
                    targetName: targetNameEn,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${degreeEndpoint}/${degree.id}`,
                });
            });

            pageNumber = results.sivu + 1;

            if (pageNumber >= results.sivuja) {
                getResults = false;
            }
        }

        finnishQuals.sort(sortByTargetName);
        swedishQuals.sort(sortByTargetName);
        englishQuals.sort(sortByTargetName);

        finnishQuals = getUnique(finnishQuals, 'targetName');
        swedishQuals = getUnique(swedishQuals, 'targetName');
        englishQuals = getUnique(englishQuals, 'targetName');

        await setAsync(`${rediskeyFurtherVocQuals}.fi`, JSON.stringify(finnishQuals));
        await setAsync(`${rediskeyFurtherVocQuals}.sv`, JSON.stringify(swedishQuals));
        await setAsync(`${rediskeyFurtherVocQuals}.en`, JSON.stringify(englishQuals));
    } catch (err) {
        winstonLogger.error(
            'Setting further vocational qualifications failed in setAmmattikoulunAmmattitutkinnot(): %o',
            err,
        );
    }
}

export const getAmmattikoulunAmmattitutkinnot = async (req: any, res: any, next: any): Promise<any> => {
    try {
        const data = await getAsync(`${rediskeyFurtherVocQuals}.${req.params.lang.toLowerCase()}`);

        if (data) {
            res.status(200).json(JSON.parse(data));
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error(
            'Getting further vocational qualifications failed in getAmmattikoulunAmmattitutkinnot(): %o',
            err,
        );
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export async function setAmmattikoulunErikoisammattitutkinnot(): Promise<any> {
    try {
        let finnishQuals: AlignmentObjectExtended[] = [];
        let swedishQuals: AlignmentObjectExtended[] = [];
        let englishQuals: AlignmentObjectExtended[] = [];
        let pageNumber = 0;
        let getResults = true;

        while (getResults) {
            const results = await getDataFromApi(
                process.env.EPERUSTEET_SERVICE_URL || 'not-defined',
                `/${newEndpoint}/`,
                {
                    Accept: 'application/json',
                    'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
                },
                `?sivu=${pageNumber}&tuleva=true&siirtyma=true&voimassaolo=true&poistunut=false&koulutustyyppi=koulutustyyppi_12`,
            );

            results.data.forEach((degree: any) => {
                let targetNameFi = degree.nimi.fi ? degree.nimi.fi : degree.nimi.sv;
                let targetNameSv = degree.nimi.sv ? degree.nimi.sv : degree.nimi.fi;
                let targetNameEn = degree.nimi.en ? degree.nimi.en : degree.nimi.fi ? degree.nimi.fi : degree.nimi.sv;
                const validityStarts = degree.voimassaoloAlkaa;
                const transitionTimeEnds = degree.siirtymaPaattyy;
                const now = new Date().getTime();

                if (validityStarts > now) {
                    targetNameFi = `${targetNameFi} (Tuleva)`;
                    targetNameSv = `${targetNameSv} (På kommande)`;
                    targetNameEn = `${targetNameEn} (In progress)`;
                }

                if (transitionTimeEnds) {
                    targetNameFi = `${targetNameFi} (Siirtymäajalla)`;
                    targetNameSv = `${targetNameSv} (Övergångstid)`;
                    targetNameEn = `${targetNameEn} (On transition time)`;
                }

                finnishQuals.push({
                    key: degree.id,
                    source: 'specialistVocationalQualifications',
                    alignmentType: 'educationalSubject',
                    targetName: targetNameFi,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${degreeEndpoint}/${degree.id}`,
                });

                swedishQuals.push({
                    key: degree.id,
                    source: 'specialistVocationalQualifications',
                    alignmentType: 'educationalSubject',
                    targetName: targetNameSv,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${degreeEndpoint}/${degree.id}`,
                });

                englishQuals.push({
                    key: degree.id,
                    source: 'specialistVocationalQualifications',
                    alignmentType: 'educationalSubject',
                    targetName: targetNameEn,
                    targetUrl: `${process.env.EPERUSTEET_SERVICE_URL}/${degreeEndpoint}/${degree.id}`,
                });
            });

            pageNumber = results.sivu + 1;

            if (pageNumber >= results.sivuja) {
                getResults = false;
            }
        }

        finnishQuals.sort(sortByTargetName);
        swedishQuals.sort(sortByTargetName);
        englishQuals.sort(sortByTargetName);

        finnishQuals = getUnique(finnishQuals, 'targetName');
        swedishQuals = getUnique(swedishQuals, 'targetName');
        englishQuals = getUnique(englishQuals, 'targetName');

        await setAsync(`${rediskeySpecialistVocQuals}.fi`, JSON.stringify(finnishQuals));
        await setAsync(`${rediskeySpecialistVocQuals}.sv`, JSON.stringify(swedishQuals));
        await setAsync(`${rediskeySpecialistVocQuals}.en`, JSON.stringify(englishQuals));
    } catch (err) {
        winstonLogger.error(
            'Setting specialist vocational qualifications failed in setAmmattikoulunErikoisammattitutkinnot(): %o',
            err,
        );
    }
}

export const getAmmattikoulunErikoisammattitutkinnot = async (req: any, res: any, next: any): Promise<any> => {
    try {
        const data = await getAsync(`${rediskeySpecialistVocQuals}.${req.params.lang.toLowerCase()}`);

        if (data) {
            res.status(200).json(JSON.parse(data));
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error(
            'Getting specialist vocational qualifications failed in getAmmattikoulunErikoisammattitutkinnot(): %o',
            err,
        );
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export async function setAmmattikoulunYTOaineet(): Promise<any> {
    try {
        let finnishDegrees: AlignmentObjectExtended[] = [];
        let swedishDegrees: AlignmentObjectExtended[] = [];
        let englishDegrees: AlignmentObjectExtended[] = [];

        const results = await getDataFromApi(
            process.env.EPERUSTEET_SERVICE_URL || 'not-defined',
            `/${endpoint}/`,
            {
                Accept: 'application/json',
                'Caller-Id': `${process.env.CALLERID_OID}.${process.env.CALLERID_SERVICE}`,
            },
            `7599350/kaikki`,
        );

        results.tutkinnonOsat.forEach((degree: any) => {
            const targetNameFi = degree.nimi.fi ? degree.nimi.fi : degree.nimi.sv;
            const targetNameSv = degree.nimi.sv ? degree.nimi.sv : degree.nimi.fi;
            const targetNameEn = degree.nimi.en ? degree.nimi.en : degree.nimi.fi ? degree.nimi.fi : degree.nimi.sv;

            const osaAlueetFi: AlignmentObjectExtended[] = [];
            const osaAlueetSv: AlignmentObjectExtended[] = [];
            const osaAlueetEn: AlignmentObjectExtended[] = [];
            degree.osaAlueet.forEach((unit: any) => {
                const unitTargetNameFi = unit.nimi.fi ? unit.nimi.fi : unit.nimi.sv;
                const unitTargetNameSv = unit.nimi.sv ? unit.nimi.sv : unit.nimi.fi;
                const unitTargetNameEn = unit.nimi.en ? unit.nimi.en : unit.nimi.fi ? unit.nimi.fi : unit.nimi.sv;

                osaAlueetFi.push({
                    key: unit.id,
                    source: 'subjectOfCommonUnit',
                    alignmentType: 'educationalSubject',
                    targetName: unitTargetNameFi,
                });

                osaAlueetSv.push({
                    key: unit.id,
                    source: 'subjectOfCommonUnit',
                    alignmentType: 'educationalSubject',
                    targetName: unitTargetNameSv,
                });

                osaAlueetEn.push({
                    key: unit.id,
                    source: 'subjectOfCommonUnit',
                    alignmentType: 'educationalSubject',
                    targetName: unitTargetNameEn,
                });
            });

            finnishDegrees.push({
                key: degree.id,
                source: 'commonUnit',
                alignmentType: 'educationalSubject',
                targetName: targetNameFi,
                children: osaAlueetFi,
            });

            swedishDegrees.push({
                key: degree.id,
                source: 'commonUnit',
                alignmentType: 'educationalSubject',
                targetName: targetNameSv,
                children: osaAlueetSv,
            });

            englishDegrees.push({
                key: degree.id,
                source: 'commonUnit',
                alignmentType: 'educationalSubject',
                targetName: targetNameEn,
                children: osaAlueetEn,
            });
        });

        finnishDegrees.sort(sortByTargetName);
        swedishDegrees.sort(sortByTargetName);
        englishDegrees.sort(sortByTargetName);

        finnishDegrees = getUnique(finnishDegrees, 'targetName');
        swedishDegrees = getUnique(swedishDegrees, 'targetName');
        englishDegrees = getUnique(englishDegrees, 'targetName');

        await setAsync(`${rediskeyYTO}.fi`, JSON.stringify(finnishDegrees));
        await setAsync(`${rediskeyYTO}.sv`, JSON.stringify(swedishDegrees));
        await setAsync(`${rediskeyYTO}.en`, JSON.stringify(englishDegrees));
    } catch (err) {
        winstonLogger.error(
            'Setting common units of vocational education failed in setAmmattikoulunYTOaineet(): %o',
            err,
        );
    }
}

export const getAmmattikoulunYTOaineet = async (req: any, res: any, next: any): Promise<any> => {
    try {
        const data = await getAsync(`${rediskeyYTO}.${req.params.lang.toLowerCase()}`);

        if (data) {
            res.status(200).json(JSON.parse(data));
        } else {
            res.status(404).json({ error: 'Not Found' });

            return next();
        }
    } catch (err) {
        winstonLogger.error(
            'Getting common units of vocational education failed in getAmmattikoulunYTOaineet(): %o',
            err,
        );
        res.status(500).json({ error: 'Something went wrong' });
    }
};
