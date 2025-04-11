import { addLinkToMaterial, setAttachmentObsoleted, setMaterialObsoleted } from '@query/apiQueries';
import { downloadAllMaterialsCompressed, downloadFile, downloadPreviewFile, uploadFileToMaterial } from '@query/fileHandling';
import { downloadEmThumbnail, uploadbase64Image } from '@query/thumbnailHandler';
import { checkAuthenticated, hasAccessToAttachmentFile, hasAccessToMaterial, hasAccessToPublicatication } from '@services/authService';
import { isAllasEnabled } from '@services/routeEnablerService';
import requestErrorHandler from '@util/requestErrorHandler';
import requestValidator from '@util/requestValidator';
import winstonLogger from '@util/winstonLogger';
import { NextFunction, Request, Response, Router } from 'express';

/**
 * API version 2.0 for requesting files and metadata related to stored educational materials.
 * This module is a collection of endpoints starting with /material/.
 * Endpoints ordered by the request URL (1) and the request method (2).
 *
 * @param {Router} router
 */
export default (router: Router): void => {
  const moduleRoot = '/material';

  // MATERIAL FILE DOWNLOAD FOR LOCAL SAVING
  // Download the fysical material file by file name (:filename) to save it on a local hard drive.
  router.get(`${moduleRoot}/file/:filename([A-Za-z0-9._-]+[.][A-Za-z0-9]{2,4})/download`, downloadFile);

  // MATERIAL FILE DOWNLOAD FOR EMBEDDED PREVIEW
  // Fetch a material file by file name (:filename) for the embedded preview (iframe).
  router.get(`${moduleRoot}/file/:filename([A-Za-z0-9._-]+[.][A-Za-z0-9]{2,4})/preview`, downloadPreviewFile);

  // THUMBNAIL FETCH FOR THE WEB VIEW
  // Fetch a thumbnail picture by file name (:filename) for the educational material web view.
  router.get(`${moduleRoot}/file/:filename([A-Za-z0-9._-]+[.][A-Za-z0-9]{2,4})/thumbnail`, downloadEmThumbnail);

  // SET MATERIAL OBSOLETED
  // Materials set obsoleted are not available for the users.
  router.delete(
    `${moduleRoot}/:edumaterialid([0-9]{1,6})/obsolete/:materialid([0-9]{1,6})`,
    checkAuthenticated,
    hasAccessToMaterial,
    setMaterialObsoleted,
  );

  // SET ATTACHMENT OBSOLETED
  // Attachments set obsoleted are not available for the users.
  router.delete(
    `${moduleRoot}/:edumaterialid([0-9]{1,6})/obsolete/:attachmentid([0-9]{1,6})/attachment`,
    checkAuthenticated,
    hasAccessToAttachmentFile,
    setAttachmentObsoleted,
  );

  // DOWNLOAD ALL FILES AS a COMPRESSED ZIP FILE.
  // :edumaterialid format: number between 1 to 6 digits - ID of an educational material.
  // :publishedat format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' (ISODate) - optional version specifier.
  router.get(
    `${moduleRoot}/file/:edumaterialid([0-9]{1,6})/all/:publishedat([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z)?`,
    (req: Request, res: Response, next: NextFunction): void => {
      downloadAllMaterialsCompressed(req, res, next).catch((err): void => {
        winstonLogger.error('Downstream from the cloud storage failed.');
        next(err);
      });
    },
  );

  // SINGLE FILE UPLOAD TO THE EDUCATIONAL MATERIAL
  // Upload a single file (material) to an existing educational material and stream to the cloud storage.
  router.post(
    `${moduleRoot}/file/:edumaterialid([0-9]{1,6})/upload`,
    isAllasEnabled,
    requestValidator.fileUploadRules(),
    requestErrorHandler,
    checkAuthenticated,
    hasAccessToPublicatication,
    uploadFileToMaterial,
  );

  // SAVE A LINK MATERIAL TO THE EDUCATIONAL MATERIAL
  // :edumaterialid format: number between 1 to 6 digits - ID of an educational material.
  router.post(
    `${moduleRoot}/link/:edumaterialid([0-9]{1,6})`,
    checkAuthenticated,
    hasAccessToPublicatication,
    addLinkToMaterial,
  );

  // THUMBNAIL UPLOAD TO CLOUD STORAGE
  // Store a new thumbnail picture of an educational material (:edumaterialid) to the cloud storage.
  router.post(
    `${moduleRoot}/:edumaterialid([0-9]{1,6})/thumbnail`,
    isAllasEnabled,
    checkAuthenticated,
    hasAccessToPublicatication,
    uploadbase64Image,
  );
};
