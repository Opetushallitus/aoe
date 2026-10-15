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
