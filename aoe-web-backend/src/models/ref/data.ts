import { z } from 'zod'

export const ePerusteetResultPage = z.object({
  data: z.array(z.unknown()).min(1),
  sivu: z.number(),
  sivuja: z.number()
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
