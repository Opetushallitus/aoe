import { oaipmhHandler } from '@controllers/oaipmh'
import { Router } from 'express'

export function metaRoutes(router: Router): void {
  router.get('/oaipmh', oaipmhHandler(false))
  router.get('/v2/oaipmh', oaipmhHandler(true))
}
