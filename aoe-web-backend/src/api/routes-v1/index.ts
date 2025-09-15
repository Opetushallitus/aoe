import { Router } from 'express'
import collection from './collection'
import download from './download'
import elasticSearch from './elasticSearch'
import legacy from './legacy'
import material from './material'
import oaipmh from './oaipmh'
import upload from './upload'

/**
 * API modules and versions available in runtime environment.
 * Modify this module to pick up and drop off API v1.0 modules.
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  collection(router)
  download(router)
  elasticSearch(router)
  legacy(router)
  material(router)
  oaipmh(router)
  upload(router)
}
