import { z } from 'zod'

// A material row id is interpolated into a bigint column, so only a whole number is a
// valid id. This used to be z.coerce.string(), which turned a missing id into the
// literal string "null": that passed validation and then aborted the entire update
// transaction with `invalid input syntax for type bigint`, leaving the user with
// "Tallennus epäonnistui" and no way to retry out of it (AOE-122 follow-up).
const materialRowId = z
  .union([z.number().int().positive(), z.string().regex(/^\d+$/)])
  .transform((value) => String(value))
// Koodisto keys are free-form text — numeric in some vocabularies, "P1"-style in
// others — and land in a text column, so only a missing key is rejected here.
const koodistoKey = z.union([z.number(), z.string().min(1)]).transform((value) => String(value))
const localizedText = z.object({
  fi: z.string().nullish(),
  sv: z.string().nullish(),
  en: z.string().nullish()
})
// Frontend EducationalMaterialPut types these as string; keep them strict.
const keyValue = z.object({ key: z.string(), value: z.string() })
// AgeRangeMin/Max are INTEGER columns, so GET serialises them as numbers, while the
// text input yields strings once the user types — both reach the PUT body. Normalise
// to a number and mirror the form's bounds (validator-params.ts: 0-999, whole years).
const ageValue = z.preprocess(
  (value) => (value === '' ? null : value),
  z.coerce.number().int().min(0).max(999).nullish()
)

/**
 * Validates the metadata body of PUT /material/:edumaterialid. Fields are permissive
 * (optional/nullish) to match what the wizard sends. Unknown keys are stripped.
 */
export const educationalMaterialMetadataSchema = z.object({
  name: localizedText.nullish(),
  description: localizedText.nullish(),
  keywords: z.array(keyValue).nullish(),
  educationalRoles: z.array(keyValue).nullish(),
  educationalUses: z.array(keyValue).nullish(),
  learningResourceTypes: z.array(keyValue).nullish(),
  educationalLevels: z.array(keyValue).nullish(),
  accessibilityFeatures: z.array(keyValue).nullish(),
  accessibilityHazards: z.array(keyValue).nullish(),
  publisher: z.array(keyValue).nullish(),
  authors: z
    .array(
      z.object({
        author: z.string().nullish(),
        organization: keyValue.nullish()
      })
    )
    .nullish(),
  alignmentObjects: z
    .array(
      z.object({
        key: koodistoKey,
        source: z.string(),
        alignmentType: z.string(),
        targetName: z.string(),
        educationalFramework: z.string().nullish(),
        targetUrl: z.string().nullish()
      })
    )
    .nullish(),
  isBasedOn: z
    .object({
      externals: z
        .array(
          z.object({
            author: z.array(z.string()).default([]),
            url: z.string().nullish(),
            name: z.string().nullish()
          })
        )
        .default([])
    })
    .nullish(),
  suitsAllEarlyChildhoodSubjects: z.boolean().nullish(),
  suitsAllPrePrimarySubjects: z.boolean().nullish(),
  suitsAllBasicStudySubjects: z.boolean().nullish(),
  suitsAllUpperSecondarySubjects: z.boolean().nullish(),
  suitsAllUpperSecondarySubjectsNew: z.boolean().nullish(),
  suitsAllVocationalDegrees: z.boolean().nullish(),
  suitsAllSelfMotivatedSubjects: z.boolean().nullish(),
  suitsAllBranches: z.boolean().nullish(),
  typicalAgeRange: z
    .object({
      typicalAgeRangeMin: ageValue,
      typicalAgeRangeMax: ageValue
    })
    .nullish(),
  timeRequired: z.string().nullish(),
  expires: z.string().nullish(),
  license: z.string().nullish(),
  isVersioned: z.boolean().nullish(),
  materials: z
    .array(
      z.object({
        materialId: materialRowId,
        priority: z.number().nullish(),
        attachments: z.array(materialRowId).nullish()
      })
    )
    .nullish(),
  fileDetails: z
    .array(
      z.object({
        id: materialRowId,
        displayName: localizedText.nullish(),
        // The wizard sends a language code string; older clients sent { key, value }.
        language: z.union([z.string(), keyValue]).nullish(),
        link: z.string().nullish()
      })
    )
    .nullish(),
  attachmentDetails: z
    .array(
      z.object({
        id: z.string(),
        kind: z.string().nullish(),
        default: z.boolean().nullish(),
        label: z.string().nullish(),
        lang: z.string().nullish()
      })
    )
    .nullish()
})

export type EducationalMaterialMetadata = z.infer<typeof educationalMaterialMetadataSchema>
