import { Router } from 'express'
import material from './material'
import status from './status'

export { default as material } from './material'
export { default as status } from './status'

/**
 * API modules and versions available in runtime environment.
 * Modify this module to pick up and drop off API v1.0 modules.
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  material(router)
  status(router)
}
