import { StatusError } from '@/helpers/errorHandler'
import {
  changeEducationalMaterialUser,
  getMaterialName,
  getOwnerName,
  getUsers,
  updateEducationalMaterial
} from '@query/materialQueries'
import { deleteDocument } from '@search/esQueries'
import * as log from '@util/winstonLogger'
import { NextFunction, Request, Response } from 'express'
import { idParamSchema } from '@util/requestValidator'

/**
 * @param req
 * @param res
 * @param next
 * Change educational material to obsoluted
 */
export async function removeEducationalMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const parsedId = idParamSchema.safeParse(req.params.id)
    if (!parsedId.success) {
      return next(new StatusError(400, 'Invalid material id'))
    }
    const id = parsedId.data
    log.debug(
      `removeEducationalMaterial: user ${req.session.passport.user.uid} deleting educational material ${id}`
    )
    await updateEducationalMaterial(id)
    res.status(200).json({ status: 'success', statusCode: 200 })
    const index = process.env.ES_INDEX
    await deleteDocument(index, String(id))
  } catch (err) {
    next(new StatusError(500, `Issue removing material`, err))
  }
}

/**
 *
 * @param req
 * @param res
 * @param next
 * get users that can be used in changeMaterialUser
 */
export async function getAoeUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getUsers()
    res.status(200).json({ users: users })
  } catch (err) {
    next(new StatusError(500, 'Issue getting users', err))
  }
}

/**
 *
 * @param req
 * @param res
 * @param next
 * change user for educationalmaterial
 */
export async function changeMaterialUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.body.materialid || !req.body.userid) {
      return res.sendStatus(404)
    }
    log.debug(
      `changeMaterialUser user: ${req.session.passport.user.uid} changing educational material ${req.body.materialid} user to ${req.body.materialid}`
    )
    const users = await changeEducationalMaterialUser(req.body.materialid, req.body.userid)
    if (!users) {
      return res.sendStatus(404)
    } else {
      return res.status(200).json({ status: 'success' })
    }
  } catch (err) {
    next(new StatusError(500, 'Issue changing users', err))
  }
}

export async function getMaterialNames(req: Request, res: Response, next: NextFunction) {
  try {
    const id = idParamSchema.safeParse(req.params.id)
    if (!id.success) {
      return next(new StatusError(400, 'Invalid material id'))
    }
    const name = await getMaterialName(id.data)
    const owner = await getOwnerName(id.data)
    if (!owner) {
      return res.sendStatus(404)
    } else {
      return res.status(200).json({ name, owner })
    }
  } catch (err) {
    next(new StatusError(500, 'Issue changing users', err))
  }
}
