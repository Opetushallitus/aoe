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

const localizedName = localizedText.refine(hasName, 'no name in fi, sv or en')

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
