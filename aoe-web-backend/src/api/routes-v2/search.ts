import { getCollectionEsData } from '@/search/es'
import { elasticSearchQuery } from '@/search/esQueries'
import { runMessageQueueThread } from '@services/threadService'
import winstonLogger from '@util/winstonLogger'
import { NextFunction, Request, Response, Router } from 'express'

/**
 * API version 2.0 for requesting files and metadata related to stored educational material.
 * This module is a collection of endpoints starting with /search/.
 * Endpoints ordered by the request URL (1) and the request method (2).
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  // Search for educational materials with search criteria.
  // Search options are published in the messaging system for further analytical processing.
  router.post(
    `/search`,
    (req: Request, res: Response, next: NextFunction) => {
      // Bypass search requests with paging parameters included.
      if (req.body.size && req.body.timestamp) {
        runMessageQueueThread(req).then((result) => {
          if (result) {
            winstonLogger.debug('THREAD: Message queue publishing completed for %o', result)
          }
        })
      }
      next()
    },
    elasticSearchQuery
  )

  // Update search index with collection changes.
  router.post(`/search/collection`, getCollectionEsData)
}
