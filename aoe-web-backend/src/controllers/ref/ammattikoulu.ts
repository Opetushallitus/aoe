import { getDataFromApi } from '@util/ref/api.utils'
import { fetchAllEPerusteetPages, getUnique, sortByTargetName } from '@util/ref/data.utils'
import { getAsync, setAsync } from '@util/ref/redis.utils'
import { AlignmentObjectExtended } from '@/models/ref/alignment-object-extended'
import { ePerusteetPeruste } from '@/models/ref/data'
import * as winstonLogger from '@util/winstonLogger'
import { config } from '@/config'
import { Request, Response, NextFunction } from 'express'

const newEndpoint = 'external/perusteet'
const degreeEndpoint = 'external/peruste'
const rediskeyBasicDegrees = 'ammattikoulu-perustutkinnot'
const rediskeyFurtherVocQuals = 'ammattikoulu-ammattitutkinnot'
const rediskeySpecialistVocQuals = 'ammattikoulu-erikoisammattitutkinnot'
const rediskeyUnits = 'ammattikoulu-tutkinnonosat'
const rediskeyRequirements = 'ammattikoulu-vaatimukset'
const rediskeyYTO = 'ammattikoulun-yto-aineet'

function fetchEPerusteetTutkinnotPage(koulutustyyppi: string, pageNumber: number) {
  return getDataFromApi(
    config.EXTERNAL_API.ePerusteet || 'not-defined',
    `/${newEndpoint}/`,
    {
      Accept: 'application/json',
      'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`
    },
    `?sivu=${pageNumber}&tulevat=true&siirtyma=true&voimassa=true&poistuneet=false&koulutustyyppi=${koulutustyyppi}`
  )
}

function fetchEPerusteetPerustutkinnotPage(pageNumber: number) {
  return fetchEPerusteetTutkinnotPage('koulutustyyppi_1', pageNumber)
}

function fetchEPerusteetAmmattitutkinnotPage(pageNumber: number) {
  return fetchEPerusteetTutkinnotPage('koulutustyyppi_11', pageNumber)
}

function fetchEPerusteetErikoisammattitutkinnotPage(pageNumber: number) {
  return fetchEPerusteetTutkinnotPage('koulutustyyppi_12', pageNumber)
}

export async function setAmmattikoulunPerustutkinnot(): Promise<void> {
  let finnishDegrees: AlignmentObjectExtended[] = []
  let swedishDegrees: AlignmentObjectExtended[] = []
  let englishDegrees: AlignmentObjectExtended[] = []
  const results = await fetchAllEPerusteetPages(fetchEPerusteetPerustutkinnotPage, 'perustutkinnot')

  if (!results) {
    winstonLogger.error('No data from ePerusteet in setAmmattikoulunPerustutkinnot()')
    return
  }

  for (const degree of results) {
    let targetNameFi: string = degree.nimi.fi || degree.nimi.sv || degree.nimi.en
    let targetNameSv: string = degree.nimi.sv || degree.nimi.fi || degree.nimi.en
    let targetNameEn: string = degree.nimi.en || degree.nimi.fi || degree.nimi.sv
    const validityStarts: number = degree.voimassaoloAlkaa
    const transitionTimeEnds: number = degree.siirtymaPaattyy
    const now = new Date().getTime()

    if (validityStarts > now) {
      targetNameFi = `${targetNameFi} (Tuleva)`
      targetNameSv = `${targetNameSv} (På kommande)`
      targetNameEn = `${targetNameEn} (In progress)`
    }

    if (transitionTimeEnds) {
      targetNameFi = `${targetNameFi} (Siirtymäajalla)`
      targetNameSv = `${targetNameSv} (Övergångstid)`
      targetNameEn = `${targetNameEn} (On transition time)`
    }

    finnishDegrees.push({
      key: degree.id,
      source: 'vocationalDegrees',
      alignmentType: 'educationalSubject',
      targetName: targetNameFi,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${degreeEndpoint}/${degree.id}`
    })

    swedishDegrees.push({
      key: degree.id,
      source: 'vocationalDegrees',
      alignmentType: 'educationalSubject',
      targetName: targetNameSv,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${degreeEndpoint}/${degree.id}`
    })

    englishDegrees.push({
      key: degree.id,
      source: 'vocationalDegrees',
      alignmentType: 'educationalSubject',
      targetName: targetNameEn,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${degreeEndpoint}/${degree.id}`
    })
  }

  try {
    finnishDegrees.sort(sortByTargetName)
    swedishDegrees.sort(sortByTargetName)
    englishDegrees.sort(sortByTargetName)

    finnishDegrees = getUnique(finnishDegrees, 'targetName')
    swedishDegrees = getUnique(swedishDegrees, 'targetName')
    englishDegrees = getUnique(englishDegrees, 'targetName')

    await setAsync(`${rediskeyBasicDegrees}.fi`, JSON.stringify(finnishDegrees))
    await setAsync(`${rediskeyBasicDegrees}.sv`, JSON.stringify(swedishDegrees))
    await setAsync(`${rediskeyBasicDegrees}.en`, JSON.stringify(englishDegrees))
  } catch (err) {
    throw Error(err)
  }
}

export const getAmmattikoulunPerustutkinnot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<AlignmentObjectExtended[]> => {
  try {
    const data: string = await getAsync(`${rediskeyBasicDegrees}.${req.params.lang.toLowerCase()}`)

    if (data) {
      res.status(200).json(JSON.parse(data)).end()
      return
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error('Getting educational subjects failed in getAmmattikoulunPerustutkinnot()')
  }
}

export async function setAmmattikoulunTutkinnonOsat(): Promise<void> {
  const finnishUnits: AlignmentObjectExtended[] = []
  const swedishUnits: AlignmentObjectExtended[] = []
  const englishUnits: AlignmentObjectExtended[] = []
  const finnishRequirements: AlignmentObjectExtended[] = []
  const swedishRequirements: AlignmentObjectExtended[] = []
  let degrees: number[] = []

  try {
    degrees = JSON.parse((await getAsync(`${rediskeyBasicDegrees}.fi`)) as string).map(
      (d: AlignmentObjectExtended) => d.key
    )
    degrees = degrees.concat(
      JSON.parse((await getAsync(`${rediskeyFurtherVocQuals}.fi`)) as string).map(
        (d: AlignmentObjectExtended) => d.key
      )
    )
    degrees = degrees.concat(
      JSON.parse((await getAsync(`${rediskeySpecialistVocQuals}.fi`)) as string).map(
        (d: AlignmentObjectExtended) => d.key
      )
    )
  } catch (err) {
    throw Error(err)
  }

  for (const degree of degrees) {
    const peruste = ePerusteetPeruste.safeParse(
      await getDataFromApi(
        config.EXTERNAL_API.ePerusteet || 'not-defined',
        `/${degreeEndpoint}/`,
        {
          Accept: 'application/json',
          'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`
        },
        `${degree}`
      )
    )

    if (!peruste.success) {
      winstonLogger.error(
        `Unusable degree ${degree} from ePerusteet in setAmmattikoulunTutkinnonOsat(): ${peruste.error.message}`
      )
      continue
    }

    const { id, nimi, tutkinnonOsat } = peruste.data

    tutkinnonOsat.forEach((unit) => {
      finnishUnits.push({
        key: unit.id,
        parent: {
          key: id,
          value: nimi.fi || nimi.sv || nimi.en
        },
        source: 'vocationalUnits',
        alignmentType: 'educationalSubject',
        targetName: unit.nimi.fi || unit.nimi.sv || unit.nimi.en
      })

      swedishUnits.push({
        key: unit.id,
        parent: {
          key: id,
          value: nimi.sv || nimi.fi || nimi.en
        },
        source: 'vocationalUnits',
        alignmentType: 'educationalSubject',
        targetName: unit.nimi.sv || unit.nimi.fi || unit.nimi.en
      })

      englishUnits.push({
        key: unit.id,
        parent: {
          key: id,
          value: nimi.en || nimi.fi || nimi.sv
        },
        source: 'vocationalUnits',
        alignmentType: 'educationalSubject',
        targetName: unit.nimi.en || unit.nimi.fi || unit.nimi.sv
      })

      // vocational competence requirements
      unit.ammattitaitovaatimukset2019?.kohdealueet.forEach((target) => {
        target.vaatimukset.forEach((requirement) => {
          finnishRequirements.push({
            key: requirement.koodi.arvo,
            parent: {
              key: unit.id,
              value: target.kuvaus?.fi || target.kuvaus?.sv
            },
            source: 'vocationalRequirements',
            alignmentType: 'teaches',
            targetName: requirement.vaatimus.fi || requirement.vaatimus.sv
          })

          swedishRequirements.push({
            key: requirement.koodi.arvo,
            parent: {
              key: unit.id,
              value: target.kuvaus?.sv || target.kuvaus?.fi
            },
            source: 'vocationalRequirements',
            alignmentType: 'teaches',
            targetName: requirement.vaatimus.sv || requirement.vaatimus.fi
          })
        })
      })
    })
  }

  if (finnishUnits.length < 1) {
    winstonLogger.error('No units from ePerusteet in setAmmattikoulunTutkinnonOsat()')
    return
  }

  try {
    await setAsync(`${rediskeyUnits}.fi`, JSON.stringify(finnishUnits))
    await setAsync(`${rediskeyUnits}.sv`, JSON.stringify(swedishUnits))
    await setAsync(`${rediskeyUnits}.en`, JSON.stringify(englishUnits))
    await setAsync(`${rediskeyRequirements}.fi`, JSON.stringify(finnishRequirements))
    await setAsync(`${rediskeyRequirements}.sv`, JSON.stringify(swedishRequirements))
    await setAsync(`${rediskeyRequirements}.en`, JSON.stringify(finnishRequirements))
  } catch (err) {
    throw Error(err)
  }
}

export const getAmmattikoulunTutkinnonOsat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<AlignmentObjectExtended[]> => {
  try {
    const ids: string[] = req.params.ids.split(',')
    const data: AlignmentObjectExtended[] = JSON.parse(
      (await getAsync(`${rediskeyUnits}.${req.params.lang.toLowerCase()}`)) as string
    )
      .filter((unit: AlignmentObjectExtended) => ids.includes(unit.parent.key.toString()))
      .map((unit: AlignmentObjectExtended) => {
        unit.parent = unit.parent.value

        return unit
      })

    if (data.length > 0) {
      res.status(200).json(data).end()
      return
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error(
      'Getting units of vocational education failed in getAmmattikoulunTutkinnonOsat()'
    )
  }
}

export const getAmmattikoulunVaatimukset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<AlignmentObjectExtended[]> => {
  try {
    const ids: string[] = req.params.ids.split(',')

    const data: AlignmentObjectExtended[] = JSON.parse(
      (await getAsync(`${rediskeyRequirements}.${req.params.lang.toLowerCase()}`)) as string
    )
      .filter((requirement: AlignmentObjectExtended) =>
        ids.includes(requirement.parent.key.toString())
      )
      .map((requirement: AlignmentObjectExtended) => {
        requirement.parent = requirement.parent.value

        return requirement
      })

    if (data.length > 0) {
      res.status(200).json(data).end()
      return
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error(
      'Getting learning objects of vocational education failed in getAmmattikoulunVaatimukset()'
    )
  }
}

export async function setAmmattikoulunAmmattitutkinnot(): Promise<void> {
  let finnishQuals: AlignmentObjectExtended[] = []
  let swedishQuals: AlignmentObjectExtended[] = []
  let englishQuals: AlignmentObjectExtended[] = []
  const results = await fetchAllEPerusteetPages(
    fetchEPerusteetAmmattitutkinnotPage,
    'ammattitutkinnot'
  )

  if (!results) {
    winstonLogger.error('No data from ePerusteet in setAmmattikoulunAmmattitutkinnot()')
    return
  }

  for (const degree of results) {
    let targetNameFi: string = degree.nimi.fi || degree.nimi.sv || degree.nimi.en
    let targetNameSv: string = degree.nimi.sv || degree.nimi.fi || degree.nimi.en
    let targetNameEn: string = degree.nimi.en || degree.nimi.fi || degree.nimi.sv
    const validityStarts: number = degree.voimassaoloAlkaa
    const transitionTimeEnds: number = degree.siirtymaPaattyy
    const now = new Date().getTime()

    if (validityStarts > now) {
      targetNameFi = `${targetNameFi} (Tuleva)`
      targetNameSv = `${targetNameSv} (På kommande)`
      targetNameEn = `${targetNameEn} (In progress)`
    }

    if (transitionTimeEnds) {
      targetNameFi = `${targetNameFi} (Siirtymäajalla)`
      targetNameSv = `${targetNameSv} (Övergångstid)`
      targetNameEn = `${targetNameEn} (On transition time)`
    }

    finnishQuals.push({
      key: degree.id,
      source: 'furtherVocationalQualifications',
      alignmentType: 'educationalSubject',
      targetName: targetNameFi,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${degreeEndpoint}/${degree.id}`
    })

    swedishQuals.push({
      key: degree.id,
      source: 'furtherVocationalQualifications',
      alignmentType: 'educationalSubject',
      targetName: targetNameSv,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${degreeEndpoint}/${degree.id}`
    })

    englishQuals.push({
      key: degree.id,
      source: 'furtherVocationalQualifications',
      alignmentType: 'educationalSubject',
      targetName: targetNameEn,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${degreeEndpoint}/${degree.id}`
    })
  }

  try {
    finnishQuals.sort(sortByTargetName)
    swedishQuals.sort(sortByTargetName)
    englishQuals.sort(sortByTargetName)

    finnishQuals = getUnique(finnishQuals, 'targetName')
    swedishQuals = getUnique(swedishQuals, 'targetName')
    englishQuals = getUnique(englishQuals, 'targetName')

    await setAsync(`${rediskeyFurtherVocQuals}.fi`, JSON.stringify(finnishQuals))
    await setAsync(`${rediskeyFurtherVocQuals}.sv`, JSON.stringify(swedishQuals))
    await setAsync(`${rediskeyFurtherVocQuals}.en`, JSON.stringify(englishQuals))
  } catch (err) {
    throw Error(err)
  }
}

export const getAmmattikoulunAmmattitutkinnot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<AlignmentObjectExtended[]> => {
  try {
    const data: string = await getAsync(
      `${rediskeyFurtherVocQuals}.${req.params.lang.toLowerCase()}`
    )

    if (data) {
      res.status(200).json(JSON.parse(data)).end()
      return
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error(
      'Getting further vocational qualifications failed in getAmmattikoulunAmmattitutkinnot()'
    )
  }
}

export async function setAmmattikoulunErikoisammattitutkinnot(): Promise<void> {
  let finnishQuals: AlignmentObjectExtended[] = []
  let swedishQuals: AlignmentObjectExtended[] = []
  let englishQuals: AlignmentObjectExtended[] = []
  const results = await fetchAllEPerusteetPages(
    fetchEPerusteetErikoisammattitutkinnotPage,
    'erikoisammattitutkinnot'
  )

  if (!results) {
    winstonLogger.error('No data from ePerusteet in setAmmattikoulunErikoisammattitutkinnot()')
    return
  }

  for (const degree of results) {
    let targetNameFi: string = degree.nimi.fi || degree.nimi.sv || degree.nimi.en
    let targetNameSv: string = degree.nimi.sv || degree.nimi.fi || degree.nimi.en
    let targetNameEn: string = degree.nimi.en || degree.nimi.fi || degree.nimi.sv
    const validityStarts: number = degree.voimassaoloAlkaa
    const transitionTimeEnds: number = degree.siirtymaPaattyy
    const now = new Date().getTime()

    if (validityStarts > now) {
      targetNameFi = `${targetNameFi} (Tuleva)`
      targetNameSv = `${targetNameSv} (På kommande)`
      targetNameEn = `${targetNameEn} (In progress)`
    }

    if (transitionTimeEnds) {
      targetNameFi = `${targetNameFi} (Siirtymäajalla)`
      targetNameSv = `${targetNameSv} (Övergångstid)`
      targetNameEn = `${targetNameEn} (On transition time)`
    }

    finnishQuals.push({
      key: degree.id,
      source: 'specialistVocationalQualifications',
      alignmentType: 'educationalSubject',
      targetName: targetNameFi,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${degreeEndpoint}/${degree.id}`
    })

    swedishQuals.push({
      key: degree.id,
      source: 'specialistVocationalQualifications',
      alignmentType: 'educationalSubject',
      targetName: targetNameSv,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${degreeEndpoint}/${degree.id}`
    })

    englishQuals.push({
      key: degree.id,
      source: 'specialistVocationalQualifications',
      alignmentType: 'educationalSubject',
      targetName: targetNameEn,
      targetUrl: `${config.EXTERNAL_API.ePerusteet}/${degreeEndpoint}/${degree.id}`
    })
  }

  try {
    finnishQuals.sort(sortByTargetName)
    swedishQuals.sort(sortByTargetName)
    englishQuals.sort(sortByTargetName)

    finnishQuals = getUnique(finnishQuals, 'targetName')
    swedishQuals = getUnique(swedishQuals, 'targetName')
    englishQuals = getUnique(englishQuals, 'targetName')

    await setAsync(`${rediskeySpecialistVocQuals}.fi`, JSON.stringify(finnishQuals))
    await setAsync(`${rediskeySpecialistVocQuals}.sv`, JSON.stringify(swedishQuals))
    await setAsync(`${rediskeySpecialistVocQuals}.en`, JSON.stringify(englishQuals))
  } catch (err) {
    throw Error(err)
  }
}

export const getAmmattikoulunErikoisammattitutkinnot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<AlignmentObjectExtended[]> => {
  try {
    const data: string = await getAsync(
      `${rediskeySpecialistVocQuals}.${req.params.lang.toLowerCase()}`
    )

    if (data) {
      res.status(200).json(JSON.parse(data)).end()
      return
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error(
      'Getting specialist vocational qualifications failed in getAmmattikoulunErikoisammattitutkinnot()'
    )
  }
}

export async function setAmmattikoulunYTOaineet(): Promise<void> {
  let finnishDegrees: AlignmentObjectExtended[] = []
  let swedishDegrees: AlignmentObjectExtended[] = []
  let englishDegrees: AlignmentObjectExtended[] = []

  const peruste = ePerusteetPeruste.safeParse(
    await getDataFromApi(
      config.EXTERNAL_API.ePerusteet || 'not-defined',
      `/${degreeEndpoint}/`,
      {
        Accept: 'application/json',
        'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`
      },
      `yto`
    )
  )

  if (!peruste.success) {
    winstonLogger.error(
      `Unusable common units from ePerusteet in setAmmattikoulunYTOaineet(): ${peruste.error.message}`
    )
    return
  }

  peruste.data.tutkinnonOsat.forEach((degree) => {
    const targetNameFi = degree.nimi.fi || degree.nimi.sv || degree.nimi.en
    const targetNameSv = degree.nimi.sv || degree.nimi.fi || degree.nimi.en
    const targetNameEn = degree.nimi.en || degree.nimi.fi || degree.nimi.sv

    const osaAlueetFi: AlignmentObjectExtended[] = []
    const osaAlueetSv: AlignmentObjectExtended[] = []
    const osaAlueetEn: AlignmentObjectExtended[] = []

    osaAlueetFi.push({
      key: degree.id,
      source: 'commonUnit',
      alignmentType: 'educationalSubject',
      targetName: targetNameFi
    })

    osaAlueetSv.push({
      key: degree.id,
      source: 'commonUnit',
      alignmentType: 'educationalSubject',
      targetName: targetNameSv
    })

    osaAlueetEn.push({
      key: degree.id,
      source: 'commonUnit',
      alignmentType: 'educationalSubject',
      targetName: targetNameEn
    })

    degree.osaAlueet.forEach((unit) => {
      const unitTargetNameFi = unit.nimi.fi || unit.nimi.sv || unit.nimi.en
      const unitTargetNameSv = unit.nimi.sv || unit.nimi.fi || unit.nimi.en
      const unitTargetNameEn = unit.nimi.en || unit.nimi.fi || unit.nimi.sv

      osaAlueetFi.push({
        key: unit.id,
        source: 'subjectOfCommonUnit',
        alignmentType: 'educationalSubject',
        targetName: unitTargetNameFi
      })

      osaAlueetSv.push({
        key: unit.id,
        source: 'subjectOfCommonUnit',
        alignmentType: 'educationalSubject',
        targetName: unitTargetNameSv
      })

      osaAlueetEn.push({
        key: unit.id,
        source: 'subjectOfCommonUnit',
        alignmentType: 'educationalSubject',
        targetName: unitTargetNameEn
      })
    })

    finnishDegrees.push({
      key: degree.id,
      source: 'commonUnit',
      alignmentType: 'educationalSubject',
      targetName: targetNameFi,
      children: osaAlueetFi
    })

    swedishDegrees.push({
      key: degree.id,
      source: 'commonUnit',
      alignmentType: 'educationalSubject',
      targetName: targetNameSv,
      children: osaAlueetSv
    })

    englishDegrees.push({
      key: degree.id,
      source: 'commonUnit',
      alignmentType: 'educationalSubject',
      targetName: targetNameEn,
      children: osaAlueetEn
    })
  })

  try {
    finnishDegrees.sort(sortByTargetName)
    swedishDegrees.sort(sortByTargetName)
    englishDegrees.sort(sortByTargetName)

    finnishDegrees = getUnique(finnishDegrees, 'targetName')
    swedishDegrees = getUnique(swedishDegrees, 'targetName')
    englishDegrees = getUnique(englishDegrees, 'targetName')

    await setAsync(`${rediskeyYTO}.fi`, JSON.stringify(finnishDegrees))
    await setAsync(`${rediskeyYTO}.sv`, JSON.stringify(swedishDegrees))
    await setAsync(`${rediskeyYTO}.en`, JSON.stringify(englishDegrees))
  } catch (err) {
    throw Error(err)
  }
}

export const getAmmattikoulunYTOaineet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<AlignmentObjectExtended[]> => {
  try {
    const data: string = await getAsync(`${rediskeyYTO}.${req.params.lang.toLowerCase()}`)

    if (data) {
      res.status(200).json(JSON.parse(data)).end()
      return
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error(
      'Getting common units of vocational education failed in getAmmattikoulunYTOaineet()'
    )
  }
}
