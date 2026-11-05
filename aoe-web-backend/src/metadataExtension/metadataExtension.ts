import { StatusError } from '@/helpers/errorHandler'
import {
  insertMetadataExtension,
  metadataExtension,
  usersMetadataExtension
} from '@query/metadataExtensionQueries'
import { idParamSchema } from '@util/requestValidator'
import { NextFunction, Request, Response } from 'express'

export class MetadataExtension {
  keywords: Array<{ key: string; value: string }>
  accessibilityFeatures: Array<{ value: string; key: string }>
  accessibilityHazards: Array<{ value: string; key: string }>
  educationalLevels: Array<{ value: string; key: string }>

  constructor(data?: MetadataExtension) {
    this.keywords = data.keywords
    this.accessibilityFeatures = data.accessibilityFeatures
    this.accessibilityHazards = data.accessibilityHazards
    this.educationalLevels = data.educationalLevels
  }
}

export async function addMetadataExtension(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idParamSchema.safeParse(req.params.id)
    if (!id.success) {
      return next(new StatusError(400, 'Invalid material id'))
    }
    const metadata = new MetadataExtension(req.body)
    await insertMetadataExtension(id.data, req.session.passport.user.uid, metadata)
    res.status(200).json({ status: 'success' })
  } catch (error) {
    next(new StatusError(500, 'Issue adding metadata extension', error))
  }
}

export async function getMetadataExtension(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idParamSchema.safeParse(req.params.id)
    if (!id.success) {
      return next(new StatusError(400, 'Invalid material id'))
    }
    const data = await metadataExtension(id.data)
    res.status(200).json(data)
  } catch (error) {
    next(new StatusError(500, 'Issue getting metadata extension', error))
  }
}

export async function getUsersMetadataExtension(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idParamSchema.safeParse(req.params.id)
    if (!id.success) {
      return next(new StatusError(400, 'Invalid material id'))
    }
    const data = await usersMetadataExtension(id.data, req.session.passport.user.uid)
    res.status(200).json(data)
  } catch (error) {
    next(new StatusError(500, 'Issue getting metadata extension', error))
  }
}
