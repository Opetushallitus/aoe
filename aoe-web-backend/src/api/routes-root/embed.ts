import { downloadPdfFromAllas } from '@/helpers/officeToPdfConverter';
import { getEducationalMaterialMetadata } from '@query/apiQueries';
import { downloadPreviewFile } from '@query/fileHandling';
import winstonLogger from '@util/winstonLogger';
import { NextFunction, Request, Response, Router } from 'express';

/**
 * Open root level API for embedded materials.
 * Sessions and cookies are not created.
 *
 * @param router express.Router
 */
export default (router: Router): void => {
  // Get all metadata of an educational material.
  // Version specified optionally with publishing date (:publishedat).
  // :publishedat format 'YYYY-MM-DDTHH:mm:ss.SSSZ' (ISODate) - regex path validation in API v2.0.
  // :edumaterialid defined as a number between 1 to 6 digits to prevent similar endpoints collision.
  router.get(
    '/embed/material/:edumaterialid([0-9]{1,6})/:publishedat?',
    (req: Request, res: Response, next: NextFunction) => {
      getEducationalMaterialMetadata(req, res, next, false).catch(() => {
        winstonLogger.error('Metadata request failed for an embedded educational material.');
      });
    },
    (req: Request, res: Response) => {
      res.end();
    },
  );

  // Download a single file by file name.
  router.get('/embed/download/:filename', downloadPreviewFile);

  // Download a single file converted to the PDF format.
  // Files are converted into a PDF by office mimetypes.
  router.get('/embed/pdf/content/:key', downloadPdfFromAllas);
};
