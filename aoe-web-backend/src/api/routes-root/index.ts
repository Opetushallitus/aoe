import { Router } from 'express';
import embed from './embed';
import h5p from './h5p';

/**
 * API root modules available in runtime environment.
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  embed(router);
  h5p(router);
};
