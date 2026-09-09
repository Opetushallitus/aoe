import { z } from 'zod'

// Shapes of https://virkailija.opintopolku.fi/eperusteet-service/api-docs/external. The spec
// declares the date fields as ISO strings, but the API sends epoch millis.
const localizedText = z.object({
  fi: z.string().optional(),
  sv: z.string().optional(),
  en: z.string().optional()
})

const name = localizedText.refine(
  (value) => !!(value.fi || value.sv || value.en),
  'no name in fi, sv or en'
)

const ePerusteetDegree = z.object({
  id: z.number(),
  nimi: name,
  voimassaoloAlkaa: z.number(),
  siirtymaPaattyy: z.number().nullable()
})

export type EPerusteetDegree = z.infer<typeof ePerusteetDegree>

export const ePerusteetResultPage = z.object({
  data: z.array(ePerusteetDegree).min(1),
  sivu: z.number(),
  sivuja: z.number()
})

const requirement = z.object({
  koodi: z.object({ arvo: z.string() }),
  vaatimus: localizedText
})

const requirementTarget = z.object({
  kuvaus: localizedText.nullable(),
  vaatimukset: z.array(requirement)
})

const unit = z.object({
  id: z.number(),
  nimi: name,
  osaAlueet: z.array(z.object({ id: z.number(), nimi: name })),
  ammattitaitovaatimukset2019: z.object({ kohdealueet: z.array(requirementTarget) }).optional()
})

export const ePerusteetPeruste = z.object({
  id: z.number(),
  nimi: name,
  tutkinnonOsat: z.array(unit).min(1)
})

export interface KeyValue<K, V> {
  key: K
  value: V
}

export interface EducationLevel {
  key: string
  value: string
  children: Children[]
}

export interface Children {
  key: string
  value: string
  disabled?: boolean
}

export interface License {
  key: string
  value: string
  link: string
  description: string
}

export interface Accessibility {
  key: string
  value: string
  description: string
  order: number
}
