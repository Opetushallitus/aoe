import { Request, Response, NextFunction } from 'express'
import { StatusError } from '@/helpers/errorHandler'
import { insertRating, insertRatingAverage, getRatings, getUserRatings } from '@query/ratingQueries'
import { RatingInformation } from './interface/rating-information.interface'
import { idParamSchema } from '@util/requestValidator'

/**
 * Save rating information for the educational material and recount rating averages.
 *
 * @param req  Request<any>
 * @param res  Response<any>
 * @param next NextFunction
 */
export async function addRating(req: Request, res: Response, next: NextFunction) {
  try {
    const ratingInformation: RatingInformation = {
      educationalMaterialId: req.body.materialId,
      ratingContent: req.body.ratingContent,
      ratingVisual: req.body.ratingVisual,
      feedbackPositive: req.body.feedbackPositive,
      feedbackSuggest: req.body.feedbackSuggest,
      feedbackPurpose: req.body.feedbackPurpose
    }
    await insertRating(ratingInformation, req.session.passport.user.uid)
    res.status(200).json({ status: ratingInformation })
    await insertRatingAverage(req.body.materialId)
  } catch (error) {
    next(new StatusError(500, 'Issue adding rating', error))
  }
}

/**
 * Get educational material ratings.
 *
 * @param req  Request<any>
 * @param res  Response<any>
 * @param next NextFunction
 */
export async function getRating(req: Request, res: Response, next: NextFunction) {
  const materialId = idParamSchema.safeParse(req.params.materialId)
  if (!materialId.success) {
    return next(new StatusError(400, 'Invalid material id'))
  }
  try {
    const response = await getRatings(materialId.data)
    if (!response.averages) {
      next(new StatusError(404, 'No rating found'))
    } else {
      res.status(200).json(response)
    }
  } catch (error) {
    next(new StatusError(500, 'Issue getting rating', error))
  }
}

/**
 * Get educational material ratings for a user.
 *
 * @param req  Request<any>
 * @param res  Response<any>
 * @param next NextFunction
 */
export async function getUserRating(req: Request, res: Response, next: NextFunction) {
  const materialId = idParamSchema.safeParse(req.params.materialId)
  if (!materialId.success) {
    return next(new StatusError(400, 'Invalid material id'))
  }
  try {
    const response = await getUserRatings(req.session.passport.user.uid, materialId.data)
    if (!response.materialId) {
      next(new StatusError(404, 'No rating found'))
    } else {
      res.status(200).json(response)
    }
  } catch (error) {
    next(new StatusError(500, 'Issue getting user rating', error))
  }
}
