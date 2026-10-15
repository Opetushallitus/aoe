import {
  type ChildCategory,
  type Lang,
  type ReferenceData,
  type ReferenceDataCategory,
  referenceDataSchemas
} from '@/models/referenceData'
import { redisClient } from '@resource/redisClient'
import { z } from 'zod'

const schemas: { [C in ReferenceDataCategory]: z.ZodType<ReferenceData<C>> } = referenceDataSchemas

export type ReferenceDataEntry<C extends ReferenceDataCategory = ReferenceDataCategory> = {
  category: C
  lang: Lang
  value: ReferenceData<C>
}

export const getReferenceData = async <C extends ReferenceDataCategory>(
  category: C,
  lang: Lang
): Promise<ReferenceData<C> | undefined> => {
  const stored = await redisClient.get(`${category}.${lang}`)

  if (stored === null) {
    return undefined
  }

  const parsed = schemas[category].safeParse(JSON.parse(stored.toString()))

  if (!parsed.success) {
    throw new Error(
      `Stored reference data ${category}.${lang} does not match its schema: ${z.prettifyError(parsed.error)}`
    )
  }

  return parsed.data
}

export const getReferenceDataItem = async <C extends ReferenceDataCategory>(
  category: C,
  lang: Lang,
  key: string
): Promise<ReferenceData<C>[number] | undefined> => {
  const items = await getReferenceData(category, lang)
  return items?.find((item) => item.key === key)
}

export const getReferenceDataChildren = async (
  category: ChildCategory,
  lang: Lang,
  parentKeys: string[]
) => {
  const items = await getReferenceData(category, lang)
  return items
    ?.filter((item) => parentKeys.includes(item.parent.key.toString()))
    .map((item) => ({ ...item, parent: item.parent.value }))
}

export const getReferenceDataWithParentNames = async (
  category: 'lukio-uusi-oppiaineet' | 'lukio-vanha-oppiaineet',
  lang: Lang
) => {
  const items = await getReferenceData(category, lang)
  return items?.map((item) => (item.parent ? { ...item, parent: item.parent.value } : item))
}

export const saveReferenceData = async (entries: ReferenceDataEntry[]): Promise<void> => {
  const transaction = redisClient.multi()

  for (const { category, lang, value } of entries) {
    transaction.set(`${category}.${lang}`, JSON.stringify(schemas[category].parse(value)))
  }

  await transaction.exec()
}
