import { Request, Response, Router } from 'express'
import {
  getMaterialActivityTotal,
  getSearchRequestsTotal,
  Interval,
  IntervalTotalRequest
} from '@query/analyticsQueries'
import {
  getEducationalLevelDistribution,
  getEducationalLevelExpired,
  getEducationalSubjectDistribution,
  getOrganizationDistribution,
  EducationalLevelRequest,
  EducationalSubjectRequest,
  OrganizationRequest
} from '@query/statisticsQueries'
import * as log from '@util/winstonLogger'

const router = Router()

const VALID_INTERVALS: Interval[] = ['day', 'week', 'month']

router.post('/prod/educationallevel/all', async (req: Request, res: Response) => {
  try {
    const body = req.body as EducationalLevelRequest
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
  const body = req.body as EducationalLevelRequest
  if (!body.expiredBefore) {
    res.status(400).end()
    return
  }
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
  try {
    const body = req.body as EducationalSubjectRequest
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
  try {
    const body = req.body as OrganizationRequest
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
  const interval = req.params.interval as Interval
  if (!VALID_INTERVALS.includes(interval)) {
    res.status(400).end()
    return
  }
  try {
    const body = req.body as IntervalTotalRequest
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
  const interval = req.params.interval as Interval
  if (!VALID_INTERVALS.includes(interval)) {
    res.status(400).end()
    return
  }
  try {
    const body = req.body as IntervalTotalRequest
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
