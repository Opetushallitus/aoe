import {
  alignmentObjectsWithParentNames,
  type ChildCategory,
  childrenWithParentNames,
  type Lang,
  type ReferenceData,
  type ReferenceDataCategory,
  type ReferenceDataItem,
  referenceDataItemSchemas
} from '@/models/referenceData'
import { db } from '@resource/postgresClient'
import { z } from 'zod'

const itemSchemas: { [C in ReferenceDataCategory]: z.ZodType<ReferenceDataItem<C>> } =
  referenceDataItemSchemas

export type ReferenceDataEntry<C extends ReferenceDataCategory = ReferenceDataCategory> = {
  category: C
  lang: Lang
  value: ReferenceData<C>
}

export const getReferenceData = async <C extends ReferenceDataCategory>(
  category: C,
  lang: Lang
): Promise<ReferenceData<C> | undefined> => {
  const row = await db.oneOrNone(
    'SELECT value FROM reference_data WHERE category = $1 AND lang = $2',
    [category, lang]
  )

  if (!row) {
    return undefined
  }

  return itemSchemas[category].array().parse(row.value)
}

/** @deprecated Only the single-item routes use this, and our frontend does not call them. */
export const getReferenceDataItem = async <C extends ReferenceDataCategory>(
  category: C,
  lang: Lang,
  key: string
): Promise<ReferenceDataItem<C> | undefined> => {
  const row = await db.oneOrNone(
    `SELECT item AS value
     FROM reference_data, jsonb_array_elements(value) AS item
     WHERE category = $1 AND lang = $2 AND item ->> 'key' = $3
     LIMIT 1`,
    [category, lang, key]
  )

  if (!row) {
    return undefined
  }

  return itemSchemas[category].parse(row.value)
}

export const getReferenceDataChildren = async (
  category: ChildCategory,
  lang: Lang,
  parentKeys: string[]
) => {
  const row = await db.one(
    `SELECT coalesce(jsonb_agg((item - 'parent') || jsonb_strip_nulls(jsonb_build_object('parent', item -> 'parent' -> 'value')) ORDER BY position), '[]') AS value
     FROM reference_data, jsonb_array_elements(value) WITH ORDINALITY AS element(item, position)
     WHERE category = $1 AND lang = $2 AND item -> 'parent' ->> 'key' = ANY($3)`,
    [category, lang, parentKeys]
  )

  return childrenWithParentNames.parse(row.value)
}

export const getReferenceDataWithParentNames = async (
  category: 'lukio-uusi-oppiaineet' | 'lukio-vanha-oppiaineet',
  lang: Lang
) => {
  const row = await db.oneOrNone(
    `SELECT (SELECT coalesce(jsonb_agg((item - 'parent') || jsonb_strip_nulls(jsonb_build_object('parent', item -> 'parent' -> 'value')) ORDER BY position), '[]')
             FROM jsonb_array_elements(value) WITH ORDINALITY AS element(item, position)) AS value
     FROM reference_data
     WHERE category = $1 AND lang = $2`,
    [category, lang]
  )

  if (!row) {
    return undefined
  }

  return alignmentObjectsWithParentNames.parse(row.value)
}

export const saveReferenceData = async (entries: ReferenceDataEntry[]): Promise<void> => {
  const rows = entries.map(({ category, lang, value }) => ({
    category,
    lang,
    value: itemSchemas[category].array().parse(value)
  }))

  await db.tx(async (transaction) => {
    for (const { category, lang, value } of rows) {
      await transaction.none(
        `INSERT INTO reference_data (category, lang, value) VALUES ($1, $2, $3:json)
         ON CONFLICT (category, lang) DO UPDATE SET value = EXCLUDED.value, updated_at = current_timestamp`,
        [category, lang, value]
      )
    }
  })
}
