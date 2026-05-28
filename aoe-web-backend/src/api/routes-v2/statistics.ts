import { Request, Response, Router } from 'express'
import { z } from 'zod'
import { getMaterialActivityTotal, getSearchRequestsTotal } from '@query/analyticsQueries'
import {
  dateString,
  educationalLevelRequestSchema,
  educationalSubjectRequestSchema,
  getEducationalLevelDistribution,
  getEducationalLevelExpired,
  getEducationalSubjectDistribution,
  getOrganizationDistribution,
  organizationRequestSchema,
  stringKeyArray
} from '@query/statisticsQueries'
import * as log from '@util/winstonLogger'

const router = Router()

const intervalSchema = z.enum(['day', 'week', 'month'])

const educationalLevelExpiredRequestSchema = educationalLevelRequestSchema.extend({
  expiredBefore: dateString
})

const intervalFilterMetadataSchema = z.object({
  organizations: stringKeyArray.nullish(),
  educationalLevels: stringKeyArray.nullish(),
  educationalSubjects: stringKeyArray.nullish()
})

const intervalTotalRequestSchema = z.object({
  since: dateString,
  until: dateString,
  interaction: z.string().nullish(),
  metadata: intervalFilterMetadataSchema.nullish(),
  filters: intervalFilterMetadataSchema.nullish()
})

router.post('/prod/educationallevel/all', async (req: Request, res: Response) => {
  const parsed = educationalLevelRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.issues })
    return
  }
  const body = parsed.data
  try {
    const values = await getEducationalLevelDistribution(body)
    res.json({
      interval: null,
      since: body.since ?? null,
      until: body.until ?? null,
      values
    })
  } catch (error) {
    log.error('getEducationalLevelDistribution failed', error)
    res.status(500).end()
  }
})

router.post('/prod/educationallevel/expired', async (req: Request, res: Response) => {
  const parsed = educationalLevelExpiredRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.issues })
    return
  }
  const body = parsed.data
  try {
    const values = await getEducationalLevelExpired(body)
    res.json({
      interval: null,
      since: null,
      until: body.expiredBefore,
      values
    })
  } catch (error) {
    log.error('getEducationalLevelExpired failed', error)
    res.status(500).end()
  }
})

router.post('/prod/educationalsubject/all', async (req: Request, res: Response) => {
  const parsed = educationalSubjectRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.issues })
    return
  }
  const body = parsed.data
  try {
    const values = await getEducationalSubjectDistribution(body)
    res.json({
      interval: null,
      since: body.since ?? null,
      until: body.until ?? null,
      values
    })
  } catch (error) {
    log.error('getEducationalSubjectDistribution failed', error)
    res.status(500).end()
  }
})

router.post('/prod/organization/all', async (req: Request, res: Response) => {
  const parsed = organizationRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.issues })
    return
  }
  const body = parsed.data
  try {
    const values = await getOrganizationDistribution(body)
    res.json({
      interval: null,
      since: body.since ?? null,
      until: body.until ?? null,
      values
    })
  } catch (error) {
    log.error('getOrganizationDistribution failed', error)
    res.status(500).end()
  }
})

router.post('/prod/materialactivity/:interval/total', async (req: Request, res: Response) => {
  const intervalResult = intervalSchema.safeParse(req.params.interval)
  if (!intervalResult.success) {
    res.status(400).json({ errors: intervalResult.error.issues })
    return
  }
  const bodyResult = intervalTotalRequestSchema.safeParse(req.body)
  if (!bodyResult.success) {
    res.status(400).json({ errors: bodyResult.error.issues })
    return
  }
  const interval = intervalResult.data
  const body = bodyResult.data
  try {
    const values = await getMaterialActivityTotal(interval, body)
    res.json({
      interval,
      since: body.since,
      until: body.until,
      values
    })
  } catch (error) {
    log.error('getMaterialActivityTotal failed', error)
    res.status(500).end()
  }
})

router.post('/prod/searchrequests/:interval/total', async (req: Request, res: Response) => {
  const intervalResult = intervalSchema.safeParse(req.params.interval)
  if (!intervalResult.success) {
    res.status(400).json({ errors: intervalResult.error.issues })
    return
  }
  const bodyResult = intervalTotalRequestSchema.safeParse(req.body)
  if (!bodyResult.success) {
    res.status(400).json({ errors: bodyResult.error.issues })
    return
  }
  const interval = intervalResult.data
  const body = bodyResult.data
  try {
    const values = await getSearchRequestsTotal(interval, body)
    res.json({
      interval,
      since: body.since,
      until: body.until,
      values
    })
  } catch (error) {
    log.error('getSearchRequestsTotal failed', error)
    res.status(500).end()
  }
})

export default router
