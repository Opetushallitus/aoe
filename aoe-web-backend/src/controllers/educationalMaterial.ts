import { StatusError } from '@/helpers/errorHandler'
import { updateEduMaterialVersionURN, updateMaterial } from '@query/apiQueries'
import { updateEsDocument } from '@search/es'
import { registerPID } from '@services/pidResolutionService'
import { Urn } from '@domain/aoeModels'
import { getEduMaterialVersionURL } from '@services/urlService'
import * as log from '@util/winstonLogger'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

// Some ids are typed `number | string` on the frontend (alignmentObjects.key,
// materials.materialId, fileDetails.id); coerce those to string for the text columns.
const stringId = z.coerce.string()
const localizedText = z.object({
  fi: z.string().nullish(),
  sv: z.string().nullish(),
  en: z.string().nullish()
})
// Frontend EducationalMaterialPut types these as string; keep them strict.
const keyValue = z.object({ key: z.string(), value: z.string() })

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
        key: stringId,
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
      typicalAgeRangeMin: z.string().nullish(),
      typicalAgeRangeMax: z.string().nullish()
    })
    .nullish(),
  timeRequired: z.string().nullish(),
  expires: z.string().nullish(),
  license: z.string().nullish(),
  isVersioned: z.boolean().nullish(),
  materials: z
    .array(
      z.object({
        materialId: stringId,
        priority: z.number().nullish(),
        attachments: z.array(stringId).nullish()
      })
    )
    .nullish(),
  fileDetails: z
    .array(
      z.object({
        id: stringId,
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

/**
 * Update educational material metadata.
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @return {Promise<void>}
 */
export const updateEducationalMaterialMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const emid: string = req.params.edumaterialid
    if (!emid) {
      return next(new StatusError(400, 'Metadata update failed: missing edumaterialid'))
    }

    const parsed = educationalMaterialMetadataSchema.safeParse(req.body)
    if (!parsed.success) {
      return next(
        new StatusError(400, `Invalid educational material metadata for #${emid}`, parsed.error)
      )
    }
    const metadata = parsed.data

    const eduMaterial = await updateMaterial(metadata, emid)
    res.status(200).json(eduMaterial[1])

    // Update the search index after educational material changes.
    await updateEsDocument()

    if (!emid || !eduMaterial[1] || !eduMaterial[1].publishedat) {
      log.warn(
        `URN update skipped for the educational material #${emid} in updateEducationalMaterialMetadata().`
      )
      return
    }
    const aoeurl = getEduMaterialVersionURL(emid, eduMaterial[1].publishedat)

    const record = await Urn.findOne({
      where: { material_url: aoeurl }
    })
    if (record) {
      log.warn(`URL ${aoeurl} already has urn generated`)
      return
    }

    const pidurn = await registerPID(aoeurl)
    await updateEduMaterialVersionURN(emid, eduMaterial[1].publishedat, pidurn)
  } catch (err) {
    next(
      new StatusError(
        400,
        'One of the metadata updates for the educational material failed in updateEducationalMaterialMetadata().',
        err
      )
    )
  }
}
