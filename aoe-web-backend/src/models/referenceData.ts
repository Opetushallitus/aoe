import { z } from 'zod'

export const langSchema = z.enum(['fi', 'sv', 'en'])
export type Lang = z.infer<typeof langSchema>

const keyValue = z.object({ key: z.string(), value: z.string() })

const educationLevel = keyValue.extend({
  codeValue: z.string().optional(),
  children: z.array(keyValue.extend({ disabled: z.boolean() }))
})

const license = keyValue.extend({ link: z.string(), description: z.string() })

const accessibility = keyValue.extend({ description: z.string().optional(), order: z.number() })

const alignmentKey = z.union([z.string(), z.number()])

const parentReference = z.object({ key: alignmentKey, value: z.string().optional() })

const alignment = z.object({
  key: alignmentKey,
  parent: parentReference.optional(),
  gradeEntity: z.number().optional(),
  source: z.string(),
  alignmentType: z.enum(['educationalSubject', 'teaches']),
  targetName: z.string(),
  targetUrl: z.string().optional()
})

const alignmentObject = alignment.extend({ children: z.array(alignment).optional() })
export type AlignmentObject = z.infer<typeof alignmentObject>

const childAlignment = alignment.extend({ parent: parentReference })
export type ChildAlignment = z.infer<typeof childAlignment>

const transversalCompetence = alignment.extend({ parent: z.string() })
export type TransversalCompetence = z.infer<typeof transversalCompetence>

const alignmentObjects = z.array(alignmentObject)
const childAlignments = z.array(childAlignment)

export const referenceDataSchemas = {
  'ammattikoulu-ammattitutkinnot': alignmentObjects,
  'ammattikoulu-erikoisammattitutkinnot': alignmentObjects,
  'ammattikoulu-perustutkinnot': alignmentObjects,
  'ammattikoulu-tutkinnonosat': childAlignments,
  'ammattikoulu-vaatimukset': childAlignments,
  'ammattikoulun-yto-aineet': alignmentObjects,
  asiasanat: z.array(keyValue),
  kayttokohteet: z.array(keyValue),
  kielet: z.array(keyValue),
  kohderyhmat: z.array(keyValue),
  koulutusasteet: z.array(educationLevel),
  'laaja-alaiset-osaamiset': z.array(transversalCompetence),
  lisenssit: z.array(license),
  'lukio-uusi-moduulit': childAlignments,
  'lukio-uusi-oppiaineet': alignmentObjects,
  'lukio-uusi-sisallot': childAlignments,
  'lukio-uusi-tavoitteet': childAlignments,
  'lukio-vanha-kurssit': childAlignments,
  'lukio-vanha-oppiaineet': alignmentObjects,
  lukionkurssit: alignmentObjects,
  oppiaineet: alignmentObjects,
  oppimateriaalityypit: z.array(keyValue),
  organisaatiot: z.array(keyValue),
  saavutettavuudenesteet: z.array(accessibility),
  saavutettavuudentukitoiminnot: z.array(accessibility),
  sisaltoalueet: childAlignments,
  tavoitteet: childAlignments,
  tieteenalat: alignmentObjects,
  'tuva-oppiaineet': alignmentObjects,
  'tuva-tavoitteet': childAlignments
}
export type ReferenceDataCategory = keyof typeof referenceDataSchemas

export type ReferenceData<C extends ReferenceDataCategory> = z.infer<
  (typeof referenceDataSchemas)[C]
>

export type ChildCategory = {
  [C in ReferenceDataCategory]: ReferenceData<C> extends ChildAlignment[] ? C : never
}[ReferenceDataCategory]

const localizedText = z.object({
  fi: z.string().optional(),
  sv: z.string().optional(),
  en: z.string().optional()
})
export type LocalizedText = z.infer<typeof localizedText>

const hasName = (text: LocalizedText): boolean => !!(text.fi || text.sv || text.en)

const hasFinnishOrSwedish = (text: LocalizedText): boolean => !!(text.fi || text.sv)

const localizedName = localizedText.refine(hasName, 'no name in fi, sv or en')

const ePerusteetText = localizedText.refine(hasFinnishOrSwedish, 'no text in fi or sv')

export const koodistotCode = z.object({ id: z.string().min(1), prefLabel: localizedName })

export const koodistotCodes = <T extends z.ZodType>(code: T) =>
  z.object({ results: z.array(code).min(1) })

export const licenceCodes = koodistotCodes(
  z.object({
    codeValue: z.string().min(1),
    prefLabel: localizedName,
    definition: localizedName,
    externalReferences: z.array(z.object({ href: z.string() })).min(1)
  })
)

export const accessibilityCodes = koodistotCodes(
  koodistotCode.extend({ order: z.number().positive(), description: localizedText.optional() })
)

export const educationLevelCodes = koodistotCodes(
  koodistotCode.extend({
    codeValue: z.string().min(1),
    broaderCode: z.object({ id: z.string() }).optional()
  })
)

const koodistoMetadata = z
  .array(z.object({ kieli: z.string(), nimi: z.string() }))
  .transform(
    (metadata): LocalizedText =>
      Object.fromEntries(metadata.map((row) => [row.kieli.toLowerCase(), row.nimi]))
  )

const koodistoName = koodistoMetadata.refine(hasName)

export const languageCodes = z
  .array(z.object({ koodiArvo: z.string().min(1), metadata: koodistoName }))
  .min(1)

export const upperSecondaryCourseCodes = z
  .array(
    z.object({
      koodiArvo: z.string().min(1),
      resourceUri: z.string().min(1),
      metadata: koodistoName
    })
  )
  .min(1)

export const branchOfScienceCodes = z
  .array(
    z.object({
      koodiArvo: z.string().regex(/^[1-6]/),
      resourceUri: z.string().min(1),
      metadata: koodistoMetadata.refine(
        (text) => !!(text.fi && text.sv && text.en),
        'name missing in fi, sv or en'
      )
    })
  )
  .min(1)

export const organisations = z.object({
  organisaatiot: z.array(z.object({ oid: z.string().min(1), nimi: localizedName })).min(1)
})

export const ysoConcepts = z
  .array(z.object({ key: z.string().min(1), labels: localizedName }))
  .min(1)

// Shapes of https://virkailija.opintopolku.fi/eperusteet-service/api-docs/external. The spec
// declares the date fields as ISO strings, but the API sends epoch millis.
const vocationalNamed = z.object({ id: z.number(), nimi: localizedName })

const ePerusteetDegree = vocationalNamed.extend({
  voimassaoloAlkaa: z.number(),
  siirtymaPaattyy: z.number().nullable()
})
export type EPerusteetDegree = z.infer<typeof ePerusteetDegree>

export const ePerusteetResultPage = z.object({
  data: z.array(ePerusteetDegree).min(1),
  sivu: z.number(),
  sivuja: z.number()
})
export type EPerusteetResultPage = z.infer<typeof ePerusteetResultPage>

const requirementTarget = z.object({
  kuvaus: localizedText.nullable(),
  vaatimukset: z.array(z.object({ koodi: z.object({ arvo: z.string() }), vaatimus: localizedName }))
})

export const ePerusteetPeruste = vocationalNamed.extend({
  tutkinnonOsat: z
    .array(
      vocationalNamed.extend({
        osaAlueet: z.array(vocationalNamed),
        ammattitaitovaatimukset2019: z
          .object({ kohdealueet: z.array(requirementTarget) })
          .optional()
      })
    )
    .min(1)
})

const idList = z.array(z.object({ id: z.number() }))

const ePerusteetNamed = z.object({ id: z.number(), nimi: ePerusteetText })

const ePerusteetTextItem = localizedText
  .extend({ _id: z.string().min(1) })
  .refine(hasFinnishOrSwedish, 'no text in fi or sv')

export const basicEducationSubjectList = z.array(
  z.object({ id: z.number(), oppimaarat: idList.nullish() })
)

export const basicEducationSubject = ePerusteetNamed.extend({
  vuosiluokkakokonaisuudet: z.array(
    z.object({
      id: z.number(),
      tavoitteet: z.array(z.object({ id: z.number(), tavoite: ePerusteetText })).nullish(),
      sisaltoalueet: z.array(ePerusteetNamed).nullish()
    })
  )
})

export const transversalCompetences = z.array(ePerusteetNamed)

export const upperSecondarySubjectList = idList.min(1)

export const upperSecondarySubject = ePerusteetNamed.extend({
  moduulit: z.array(ePerusteetNamed).nullish(),
  oppimaarat: idList.nullish()
})

export const upperSecondaryCourse = ePerusteetNamed.extend({ moduulit: z.array(ePerusteetNamed) })

export const upperSecondaryModuleDetails = ePerusteetNamed
  .extend({
    tavoitteet: z.object({ tavoitteet: z.array(ePerusteetTextItem).nullish() }).nullish(),
    sisallot: z.array(z.object({ sisallot: z.array(ePerusteetTextItem) })).nullish()
  })
  .refine(
    (module) => !!(module.tavoitteet?.tavoitteet || module.sisallot),
    'no objectives or contents'
  )

export const preparatoryEducation = z.object({
  koulutuksenOsat: z
    .array(ePerusteetNamed.extend({ tavoitteet: z.array(ePerusteetTextItem).nullish() }))
    .min(1)
})

const oldUpperSecondaryCourse = z.object({ koodiArvo: z.string().min(1), nimi: ePerusteetText })

const oldUpperSecondarySubject = oldUpperSecondaryCourse.extend({
  kurssit: z.array(oldUpperSecondaryCourse).nullish()
})

export const oldUpperSecondarySubjects = z.object({
  oppiaineet: z
    .array(
      oldUpperSecondarySubject.extend({ oppimaarat: z.array(oldUpperSecondarySubject).nullish() })
    )
    .min(1)
})
