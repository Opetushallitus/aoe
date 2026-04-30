import { Router } from 'express'
import ref from './ref'

/**
 * Reference API version 1.0 routes.
 *
 * @param router express.Router
 */
export const refV1 = (router: Router): void => {
  ref(router)
}
