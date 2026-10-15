import { WebWritableStream } from 'htmlparser2/WebWritableStream'

import { config } from '@/config'
import { disabledEducationalLevels } from '@/constants/metadata-exceptions.json'
import {
  type AlignmentObject,
  accessibilityCodes,
  branchOfScienceCodes,
  educationLevelCodes,
  koodistotCode,
  koodistotCodes,
  type Lang,
  langSchema,
  languageCodes,
  licenceCodes,
  organisations,
  type ReferenceDataCategory,
  upperSecondaryCourseCodes,
  ysoConcepts
} from '@/models/referenceData'
import { getReferenceData, saveReferenceData } from '@query/referenceDataQueries'
import { fetchJson, fetchStream } from '@resource/httpClient'
import { getUnique, label, sortByTargetName, sortByValue } from '@/helpers/referenceData'
import { z } from 'zod'

export const opintopolkuHeaders = {
  'Caller-Id': `${config.EXTERNAL_API.oid}.${config.EXTERNAL_API.service}`
}

export const ensureNotSmallerThanStored = async (
  category: ReferenceDataCategory,
  lists: Partial<Record<Lang, unknown[]>>
): Promise<void> => {
  for (const lang of langSchema.options) {
    if (!lists[lang]) {
      continue
    }

    const stored = await getReferenceData(category, lang)

    if (lists[lang].length < (stored?.length ?? 0)) {
      throw new Error(
        `New ${category}.${lang} has ${lists[lang].length} items, fewer than the ${stored.length} stored`
      )
    }
  }
}

const setKoodistotKeyValues = async (
  category: 'kayttokohteet' | 'kohderyhmat' | 'oppimateriaalityypit',
  codeScheme: string,
  format: (value: string) => string
): Promise<void> => {
  const codes = await fetchJson(
    `${config.EXTERNAL_API.suomiKoodistot}/edtech/codeschemes/${codeScheme}/codes/?format=json`,
    koodistotCodes(koodistotCode)
  )

  await saveReferenceData(
    langSchema.options.map((lang) => ({
      category,
      lang,
      value: codes.results
        .map((code) => ({ key: code.id, value: format(label(code.prefLabel, lang)) }))
        .sort(sortByValue)
    }))
  )
}

export const setKayttokohteet = (): Promise<void> =>
  setKoodistotKeyValues('kayttokohteet', 'EducationalUse', (value) => value)

export const setKohderyhmat = (): Promise<void> =>
  setKoodistotKeyValues('kohderyhmat', 'EducationalRole', (value) => value.trim())

export const setOppimateriaalityypit = (): Promise<void> =>
  setKoodistotKeyValues('oppimateriaalityypit', 'MateriaalinTyyppi', (value) => value.toLowerCase())

const setAccessibility = async (
  category: 'saavutettavuudenesteet' | 'saavutettavuudentukitoiminnot',
  codeScheme: string
): Promise<void> => {
  const codes = await fetchJson(
    `${config.EXTERNAL_API.suomiKoodistot}/edtech/codeschemes/${codeScheme}/codes/?format=json`,
    accessibilityCodes
  )

  await saveReferenceData(
    langSchema.options.map((lang) => ({
      category,
      lang,
      value: codes.results
        .map((code) => ({
          key: code.id,
          value: label(code.prefLabel, lang),
          description: code.description ? label(code.description, lang) : undefined,
          order: code.order
        }))
        .sort((a, b) => a.order - b.order)
    }))
  )
}

export const setSaavutettavuudenEsteet = (): Promise<void> =>
  setAccessibility('saavutettavuudenesteet', 'SaavutettavuusEsteet')

export const setSaavutettavuudenTukitoiminnot = (): Promise<void> =>
  setAccessibility('saavutettavuudentukitoiminnot', 'AccessibilityFeatures')

export async function setKoulutusasteet(): Promise<void> {
  const codes = await fetchJson(
    `${config.EXTERNAL_API.suomiKoodistot}/edtech/codeschemes/Koulutusaste/codes/?format=json`,
    educationLevelCodes
  )

  const tenthGrade = codes.results.find(
    (code) => code.codeValue === 'voluntaryAdditionalBasicEducation'
  )?.id

  await saveReferenceData(
    langSchema.options.map((lang) => {
      const level = (code: (typeof codes.results)[number]) => ({
        key: code.id,
        value: label(code.prefLabel, lang),
        disabled: disabledEducationalLevels.includes(code.id)
      })

      return {
        category: 'koulutusasteet',
        lang,
        value: codes.results
          .filter((code) => !code.broaderCode)
          .map((code) => {
            const children = [
              level(code),
              ...codes.results.filter((child) => child.broaderCode?.id === code.id).map(level)
            ]

            if (code.codeValue === 'basicEducation') {
              children.sort(sortByValue)
            }

            if (code.codeValue === 'basicEducation' && lang === 'fi') {
              const mainLevelIndex = children.findIndex((child) => child.key === code.id)
              children.splice(0, 0, children.splice(mainLevelIndex, 1)[0])

              const lastLevelIndex = children.findIndex((child) => child.key === tenthGrade)
              children.splice(children.length - 1, 0, children.splice(lastLevelIndex, 1)[0])
            }

            return {
              key: code.id,
              codeValue: code.codeValue,
              value: label(code.prefLabel, lang),
              children
            }
          })
      }
    })
  )
}

export async function setLisenssit(): Promise<void> {
  const codes = await fetchJson(
    `${config.EXTERNAL_API.suomiKoodistot}/edtech/codeschemes/Licence/codes/?format=json&expand=externalReference`,
    licenceCodes
  )

  await saveReferenceData(
    langSchema.options.map((lang) => ({
      category: 'lisenssit',
      lang,
      value: codes.results.map((code) => ({
        key: code.codeValue,
        value: label(code.prefLabel, lang),
        link: code.externalReferences[0].href,
        description: label(code.definition, lang)
      }))
    }))
  )
}

export async function setKielet(): Promise<void> {
  const codes = await fetchJson(
    `${config.EXTERNAL_API.opintopolkuKoodistot}/kielikoodistoopetushallinto/koodi`,
    languageCodes,
    opintopolkuHeaders
  )

  await saveReferenceData(
    langSchema.options.map((lang) => {
      const languages = codes
        .map((code) => ({ key: code.koodiArvo.toLowerCase(), value: label(code.metadata, lang) }))
        .sort(sortByValue)

      for (const [index, key] of langSchema.options.entries()) {
        const languageIndex = languages.findIndex((language) => language.key === key)
        languages.splice(index, 0, languages.splice(languageIndex, 1)[0])
      }

      return { category: 'kielet', lang, value: languages }
    })
  )
}

export async function setLukionkurssit(): Promise<void> {
  const codes = await fetchJson(
    `${config.EXTERNAL_API.opintopolkuKoodistot}/lukionkurssit/koodi`,
    upperSecondaryCourseCodes,
    opintopolkuHeaders
  )

  await saveReferenceData(
    langSchema.options.map((lang) => {
      const courses = codes
        .map(
          (code): AlignmentObject => ({
            key: code.koodiArvo,
            source: 'upperSecondarySchoolSubjects',
            alignmentType: 'educationalSubject',
            targetName: label(code.metadata, lang).trim(),
            targetUrl: code.resourceUri
          })
        )
        .sort(sortByTargetName)

      return { category: 'lukionkurssit', lang, value: getUnique(courses, 'targetName') }
    })
  )
}

const branchesOfScience: Record<Lang, string[]> = {
  fi: [
    'Luonnontieteet',
    'Tekniikka',
    'Lääke- ja terveystieteet',
    'Maatalous- ja metsätieteet',
    'Yhteiskuntatieteet',
    'Humanistiset tieteet'
  ],
  sv: [
    'Naturvetenskaper',
    'Teknik',
    'Medicin och hälsovetenskaper',
    'Jordbruks- och skogsvetenskaper',
    'Samhällsvetenskaper',
    'Humanistiska vetenskaper'
  ],
  en: [
    'Natural sciences',
    'Engineering and technology',
    'Medical and health sciences',
    'Agriculture and forestry',
    'Social sciences',
    'Humanities'
  ]
}

export async function setTieteenalat(): Promise<void> {
  const codes = await fetchJson(
    `${config.EXTERNAL_API.opintopolkuKoodistot}/tieteenala/koodi`,
    branchOfScienceCodes,
    opintopolkuHeaders
  )

  await saveReferenceData(
    langSchema.options.map((lang) => ({
      category: 'tieteenalat',
      lang,
      value: branchesOfScience[lang].map((targetName, index): AlignmentObject => {
        const key = String(index + 1)

        return {
          key,
          source: 'branchesOfScience',
          alignmentType: 'educationalSubject',
          targetName,
          children: codes
            .filter((code) => code.koodiArvo.charAt(0) === key)
            .map(
              (code): AlignmentObject => ({
                key: code.koodiArvo,
                source: 'branchesOfScience',
                alignmentType: 'educationalSubject',
                targetName: code.metadata[lang].trim(),
                targetUrl: code.resourceUri
              })
            )
            .sort((a, b) => Number(a.key) - Number(b.key))
        }
      })
    }))
  )
}

export async function setOrganisaatiot(): Promise<void> {
  const data = await fetchJson(
    `${config.EXTERNAL_API.organisaatiot}/organisaatio/v4/hae?aktiiviset=true&suunnitellut=false&lakkautetut=false`,
    organisations,
    opintopolkuHeaders
  )

  await saveReferenceData(
    langSchema.options.map((lang) => {
      const organisationNames = data.organisaatiot
        .map((organisation) => ({ key: organisation.oid, value: label(organisation.nimi, lang) }))
        .sort(sortByValue)

      return { category: 'organisaatiot', lang, value: getUnique(organisationNames, 'value') }
    })
  )
}

type Concept = { key?: string; labels: Record<string, string> }

const fetchConcepts = async (url: string): Promise<Concept[]> => {
  const body = await fetchStream(url, 'application/rdf+xml')
  const concepts: Concept[] = []
  const open: { concept?: Concept; label?: { lang: string; text: string } } = {}
  await body.pipeTo(
    new WebWritableStream(
      {
        onopentag(name, attributes) {
          if (name === 'skos:Concept') {
            open.concept = { key: attributes['rdf:about'], labels: {} }
          } else if (open.concept && name === 'skos:prefLabel') {
            open.label = { lang: attributes['xml:lang'] ?? '', text: '' }
          }
        },
        ontext(text) {
          if (open.label) {
            open.label.text += text
          }
        },
        onclosetag(name) {
          if (open.concept && open.label && name === 'skos:prefLabel') {
            open.concept.labels[open.label.lang] = open.label.text
            open.label = undefined
          } else if (open.concept && name === 'skos:Concept') {
            concepts.push(open.concept)
            open.concept = undefined
          }
        }
      },
      { xmlMode: true }
    )
  )
  return concepts
}

export async function setAsiasanat(): Promise<void> {
  const fetched = await fetchConcepts(`${config.EXTERNAL_API.asiasanat}/yso/data`)
  const concepts = ysoConcepts.safeParse(fetched)

  if (!concepts.success) {
    throw new Error(`Unusable YSO concepts from api.finto.fi: ${z.prettifyError(concepts.error)}`)
  }

  const keywordsIn = (lang: Lang) =>
    concepts.data
      .map((concept) => ({ key: concept.key, value: label(concept.labels, lang) }))
      .sort(sortByValue)
  const keywords = { fi: keywordsIn('fi'), sv: keywordsIn('sv'), en: keywordsIn('en') }

  await ensureNotSmallerThanStored('asiasanat', keywords)
  await saveReferenceData(
    langSchema.options.map((lang) => ({ category: 'asiasanat', lang, value: keywords[lang] }))
  )
}
