import { Router } from 'express';
import { setMaterialAsObsoleted } from '../../queries/apiQueries';
import fileHandling, { downloadFile, downloadPreviewFile } from '../../queries/fileHandling';
import { downloadEmThumbnail, uploadbase64Image } from '../../queries/thumbnailHandler';
import authService, { checkAuthenticated, hasAccessToPublicatication } from '../../services/authService';
import { isAllasEnabled } from '../../services/routeEnablerService';
import { requestErrorHandler, requestValidator } from '../../util';

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

  // SET MATERIAL AS OBSOLETED
  // Materials set obsoleted are not available for the users.
  router.delete(
    '/material/:edumaterialid([0-9]{1,6})/obsolete/:materialid([0-9]{1,6})',
    authService.checkAuthenticated,
    authService.hasAccessToMaterial,
    setMaterialAsObsoleted,
  );

  // SINGLE FILE UPLOAD TO THE EDUCATIONAL MATERIAL
  // Upload a single file (material) to an existing educational material and stream to the cloud storage.
  router.post(
    '/material/file/:edumaterialid([0-9]{1,6})/upload',
    isAllasEnabled,
    requestValidator.fileUploadRules(),
    requestErrorHandler,
    authService.checkAuthenticated,
    authService.hasAccessToPublicatication,
    fileHandling.uploadFileToMaterial,
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
