import { StatusError } from '@/helpers/errorHandler'
import {
  educationalMaterialMetadataSchema,
  type EducationalMaterialMetadata
} from '@/controllers/educationalMaterialMetadataSchema'
import { updateEduMaterialVersionURN, updateMaterial } from '@query/apiQueries'
import { updateEsDocument } from '@search/es'
import { registerPID } from '@services/pidResolutionService'
import { Urn } from '@domain/aoeModels'
import { getEduMaterialVersionURL } from '@services/urlService'
import * as log from '@util/winstonLogger'
import { NextFunction, Request, Response } from 'express'

export { educationalMaterialMetadataSchema, type EducationalMaterialMetadata }

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
    const emid = req.params.edumaterialid
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
    res.status(200).json(eduMaterial)

    // Update the search index after educational material changes.
    await updateEsDocument()

    if (!eduMaterial || !eduMaterial.publishedat) {
      log.warn(
        `URN update skipped for the educational material #${emid} in updateEducationalMaterialMetadata().`
      )
      return
    }
    const aoeurl = getEduMaterialVersionURL(emid, eduMaterial.publishedat)

    const record = await Urn.findOne({
      where: { material_url: aoeurl }
    })
    if (record) {
      log.warn(`URL ${aoeurl} already has urn generated`)
      return
    }

    const pidurn = await registerPID(aoeurl)
    await updateEduMaterialVersionURN(emid, eduMaterial.publishedat, pidurn)
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
