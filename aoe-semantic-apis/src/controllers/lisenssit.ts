import { getDataFromApi } from '../util/api.utils'
import { getAsync, setAsync } from '../util/redis.utils'
import { License } from '../models/data'
import { winstonLogger } from '../util'
import config from '../config'
import { NextFunction, Request, Response } from 'express'

const endpoint = 'edtech/codeschemes/Licence'
const rediskey = 'lisenssit'
const params = 'codes/?format=json&expand=externalReference'

/**
 * Set data into redis database
 *
 * @returns {Promise<void>}
 */
export async function setLisenssit(): Promise<void> {
  const results: Record<string, unknown>[] = await getDataFromApi(
    config.EXTERNAL_API.suomiKoodistot,
    `/${endpoint}/`,
    { Accept: 'application/json' },
    params
  )

  if (!results || !(results as any).results || (results as any).results.length < 1) {
    winstonLogger.error('No data from koodistot.suomi.fi in setLisenssit()')
    return
  }

  const finnish: License[] = []
  const english: License[] = []
  const swedish: License[] = []

  ;(results as any).results.forEach((result: any) => {
    if (
      !result.codeValue ||
      (!result.prefLabel?.fi && !result.prefLabel?.sv && !result.prefLabel?.en) ||
      (!result.definition?.fi && !result.definition?.sv && !result.definition?.en) ||
      !result.externalReferences ||
      result.externalReferences.length < 1
    ) {
      throw Error('Creating new sets of licenses failed in setLisenssit(): Missing required data')
    }

    finnish.push({
      key: result.codeValue,
      value: result.prefLabel.fi || result.prefLabel.sv || result.prefLabel.en,
      link: result.externalReferences[0].href,
      description: result.definition.fi || result.definition.sv || result.definition.en
    })

    english.push({
      key: result.codeValue,
      value: result.prefLabel.en || result.prefLabel.fi || result.prefLabel.sv,
      link: result.externalReferences[0].href,
      description: result.definition.en || result.definition.fi || result.definition.sv
    })

    swedish.push({
      key: result.codeValue,
      value: result.prefLabel.sv || result.prefLabel.fi || result.prefLabel.en,
      link: result.externalReferences[0].href,
      description: result.definition.sv || result.definition.fi || result.definition.en
    })
  })

  try {
    await setAsync(`${rediskey}.fi`, JSON.stringify(finnish))
    await setAsync(`${rediskey}.en`, JSON.stringify(english))
    await setAsync(`${rediskey}.sv`, JSON.stringify(swedish))
  } catch (err) {
    throw Error(err)
  }
}

/**
 * Get data from redis database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<License[]>}
 */
const licences = {
  en: [
    {
      key: 'CCBY4.0',
      value: 'CC BY 4.0',
      link: 'https://creativecommons.org/licenses/by/4.0/legalcode',
      description:
        'Let others distribute, remix, tweak, and build upon your work, even commercially, as long as they credit you for the original creation. '
    },
    {
      key: 'CCBYSA4.0',
      value: 'CC BY-SA  4.0',
      link: 'http://creativecommons.org/licenses/by-sa/4.0/legalcode',
      description:
        'Let others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. All new works based on yours will carry the same license, so any derivatives will also allow commercial use.'
    },
    {
      key: 'CCBYND4.0',
      value: 'CC BY-ND  4.0',
      link: 'http://creativecommons.org/licenses/by-nd/4.0/legalcode',
      description:
        'Let others reuse the work for any purpose, including commercially; however, it cannot be shared with others in adapted form, and credit must be provided to you. '
    },
    {
      key: 'CCBYNCND4.0',
      value: 'CC BY-NC-ND  4.0',
      link: 'http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode',
      description:
        'Allow others to download your works and share them with others as long as they credit you, but they can’t change them in any way or use them commercially. '
    },
    {
      key: 'CCBYNCSA4.0',
      value: 'CC BY-NC-SA 4.0',
      link: 'http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode',
      description:
        'Let others remix, tweak, and build upon your work non-commercially, as long as they credit you and license their new creations under the identical terms. '
    },
    {
      key: 'CCBYNC4.0',
      value: 'CC BY-NC 4.0',
      link: 'http://creativecommons.org/licenses/by-nc/4.0/legalcode',
      description:
        'Let others remix, tweak, and build upon your work non-commercially, and although their new works must also acknowledge you and be non-commercial, they don’t have to license their derivative works on the same terms. '
    }
  ],
  fi: [
    {
      key: 'CCBY4.0',
      value: 'CC BY 4.0',
      link: 'https://creativecommons.org/licenses/by/4.0/legalcode',
      description:
        'Oppimateriaalia saa kopioida, välittää, levittää ja esittää. Oppimateriaalista saa tehdä muokattuja johdannaismateriaaleja ja sen osia saa käyttää toisten oppimateriaalien osana. Nimeni on mainittava alkuperäisenä tekijänä.'
    },
    {
      key: 'CCBYSA4.0',
      value: 'CC BY-SA  4.0',
      link: 'http://creativecommons.org/licenses/by-sa/4.0/legalcode',
      description:
        'Oppimateriaalia saa kopioida, välittää, levittää ja esittää. Oppimateriaalista saa tehdä muokattuja johdannaismateriaaleja ja sen osia saa käyttää toisten oppimateriaalien osana, mutta nämä on julkaistava tällä samalla lisenssillä, millä alkuperäinen oppimateriaali on julkaistu. Nimeni on mainittava alkuperäisenä tekijänä.'
    },
    {
      key: 'CCBYND4.0',
      value: 'CC BY-ND  4.0',
      link: 'http://creativecommons.org/licenses/by-nd/4.0/legalcode',
      description:
        'Oppimateriaalia saa kopioida, välittää, levittää ja esittää, mutta muokattujen versioiden tai johdannaismateriaalien tekeminen on kielletty. Nimeni on mainittava alkuperäisenä tekijänä.'
    },
    {
      key: 'CCBYNCND4.0',
      value: 'CC BY-NC-ND  4.0',
      link: 'http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode',
      description:
        'Oppimateriaalia saa kopioida, välittää, levittää ja esittää, mutta muokattujen versioiden tai johdannaismateriaalien tekeminen on kielletty. Oppimateriaalin käyttäminen kaupallisessa tarkoituksessa (esim. yrityksille suunnatut koulutukset, materiaalin jakaminen mainosrahoitteisella blogilla tai verkkosivustolla) on kielletty.'
    },
    {
      key: 'CCBYNCSA4.0',
      value: 'CC BY-NC-SA 4.0',
      link: 'http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode',
      description:
        'Oppimateriaalia saa kopioida, välittää, levittää ja esittää. Oppimateriaalista saa tehdä muokattuja johdannaismateriaaleja ja sen osia saa käyttää toisten oppimateriaalien osana. Alkuperäisen materiaalin ja johdannaisten käyttäminen kaupallisessa tarkoituksessa (esim. yrityksille suunnatut koulutukset, materiaalin jakaminen mainosrahoitteisella blogilla tai verkkosivustolla) on kielletty. Oppimateriaalista saa tehdä muokattuja versioita, mutta nämä on julkaistava tällä samalla lisenssillä, millä alkuperäinen oppimateriaali on julkaistu. Nimeni on mainittava alkuperäisenä tekijänä.'
    },
    {
      key: 'CCBYNC4.0',
      value: 'CC BY-NC 4.0',
      link: 'http://creativecommons.org/licenses/by-nc/4.0/legalcode',
      description:
        'Oppimateriaalia saa kopioida, välittää, levittää ja esittää. Oppimateriaalista saa tehdä muokattuja johdannaismateriaaleja ja sen osia saa käyttää toisten oppimateriaalien osana. Alkuperäisen materiaalin ja johdannaisten käyttäminen kaupallisessa tarkoituksessa (esim. yrityksille suunnatut koulutukset, materiaalin jakaminen mainosrahoitteisella blogilla tai verkkosivustolla) on kielletty. Nimeni on mainittava alkuperäisenä tekijänä.'
    }
  ],
  sv: [
    {
      key: 'CCBY4.0',
      value: 'CC BY 4.0',
      link: 'https://creativecommons.org/licenses/by/4.0/legalcode',
      description:
        'Licensen Creative Commons erkännande innebär att du, som upphovsman, tillåter andra att använda, sprida, göra om, modifiera och bygga vidare på ditt verk, även i kommersiella sammanhang. De som använder dina Creative Commons licensierade verk ska uppge att det är du som är upphovsman, när de använder, bearbetar eller sprider ditt verk.'
    },
    {
      key: 'CCBYSA4.0',
      value: 'CC BY-SA  4.0',
      link: 'http://creativecommons.org/licenses/by-sa/4.0/legalcode',
      description:
        'Licensen Creative Commons erkännande, dela lika innebär att du tillåter andra att använda, sprida, göra om, modifiera och bygga vidare, skapa nya verk på ditt verk, så länge de anger att du är upphovsman. Om det skapas nya verk utifrån ditt verk så ska dessa verk spridas och licensieras med samma licens, alltså nya verk ska spridas under samma villkor.\n\nAlla nya verk som skapas utifrån ett verk som har den här licensen ska ha samma licens, som ursprungsverket.'
    },
    {
      key: 'CCBYND4.0',
      value: 'CC BY-ND  4.0',
      link: 'http://creativecommons.org/licenses/by-nd/4.0/legalcode',
      description:
        'Licensen Creative Commons erkännande, inga bearbetningar innebär att du som upphovsman tillåter spridning, kommersiell och ickekommersiell, men du tillåter inte att verket bearbetas. De som sprider ditt verk under denna licens ska sprida ditt verk oförändrat, och du tillåter alltså inte att verket bearbetas.I samband med användning eller spridning av verket ska upphovsmannen också anges.'
    },
    {
      key: 'CCBYNCND4.0',
      value: 'CC BY-NC-ND  4.0',
      link: 'http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode',
      description:
        'Licensen Creative Commons Erkännande, icke kommersiell, inga bearbetningar innebär att du tillåter spridning men bara i icke kommersiella sammanhang. Verk som ligger under den här licensen får inte bearbetas och den som använder verket måste du erkänna dig som upphovsman.'
    },
    {
      key: 'CCBYNCSA4.0',
      value: 'CC BY-NC-SA 4.0',
      link: 'http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode',
      description:
        'Licensen Creative Commons erkännande, icke kommersiell, dela lika innebär att du tillåter andra att använda, sprida, göra om, modifiera och bygga vidare, och skapa nya verk utifrån ditt. Så länge de erkänner dig som upphovsman och att de verk som skapas utifrån ditt verk ska licensieras  under samma villkor. De nya verk som skapas utifrån ditt verk kommer att ha samma licens.'
    },
    {
      key: 'CCBYNC4.0',
      value: 'CC BY-NC 4.0',
      link: 'http://creativecommons.org/licenses/by-nc/4.0/legalcode',
      description:
        'Licensen Creative Commons erkännande icke-kommersiell innebär att du tillåter andra att använda, sprida, göra om, modifiera och bygga vidare på ditt verk, men inte att verket används i kommersiella sammanhang. I samband med att verket används så ska också upphovsmannen anges.'
    }
  ]
}

export const getLisenssit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<License[]> => {
  try {
    const lang = req.params.lang.toLowerCase()
    const licence = licences[lang]

    if (licence) {
      res.status(200).json(licence).end()
      return
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error('Getting licenses failed in getLisenssit()')
  }
}

/**
 * Get single row from redis database key-value
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {Promise<License>}
 */
export const getLisenssi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<License> => {
  try {
    const redisData: string = await getAsync(`${rediskey}.${req.params.lang.toLowerCase()}`)

    if (redisData) {
      const input: License[] = JSON.parse(redisData)
      const row: License = input.find((e: any) => e.key === req.params.key)

      if (row) {
        res.status(200).json(row).end()
        return
      } else {
        res.sendStatus(406).end()
        return
      }
    }

    res.status(404).json({ error: 'Not Found' }).end()
    return
  } catch (err) {
    next(err)
    winstonLogger.error('Getting license failed in getLisenssi()')
  }
}
