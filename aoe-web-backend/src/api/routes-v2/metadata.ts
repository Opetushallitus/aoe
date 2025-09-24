import { getEducationalMaterialMetadata } from '@query/apiQueries'
import { Router } from 'express'

/**
 * API version 2.0 for requesting files and metadata related to stored educational material.
 * This module is a collection of endpoints starting with /metadata/.
 * Endpoints ordered by the request URL (1) and the request method (2).
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  // Fetch metadata of an educational material by ID (:edumaterialid).
  router.get(`/metadata/:edumaterialid`, getEducationalMaterialMetadata)

  // Fetch metadata of an educational material version by ID (:edumaterialid) and published timestamp (:publishedat).
  router.get('/metadata/:edumaterialid/version/:publishedat', getEducationalMaterialMetadata)
}
