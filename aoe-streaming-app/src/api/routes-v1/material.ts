import { NextFunction, Request, Response, Router } from 'express';
import storageService from '../../service/storage-service';

/**
 * API version 1.0 for requesting material files stored in cloud object storage.
 * This module is a collection of endpoints starting with /material.
 * Endpoints ordered by the request URL (1) and method (2).
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  router.get('/material/:filename', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await storageService.getObjectAsStream(req, res);
      return res.end();
    } catch (err: any) {
      err.message = err.message || `Download from the object storage failed for ${req.params.filename as string}`;
      return next(err);
    }
  });
};
