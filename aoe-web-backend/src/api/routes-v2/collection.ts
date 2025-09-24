import { uploadbase64Image } from '@query/thumbnailHandler'
import { checkAuthenticated, hasAccessToCollectionParams } from '@services/authService'
import { Router } from 'express'

/**
 * API version 2.0 for requesting files and metadata related to stored educational material.
 * This module is a collection of endpoints starting with /collection/.
 * Endpoints ordered by the request URL (1) and the request method (2).
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  // Upload collection thumbnail image file to the cloud object storage.
  // Case of a collection identified by request parameter name :collectionid in uploadbase64Image().
  router.post(
    `/collection/:collectionid/thumbnail`,
    checkAuthenticated,
    hasAccessToCollectionParams,
    uploadbase64Image
  )
}
