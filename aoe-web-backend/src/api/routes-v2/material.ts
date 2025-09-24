import { addLinkToMaterial, setAttachmentObsoleted, setMaterialObsoleted } from '@query/apiQueries'
import {
  downloadAllMaterialsCompressed,
  downloadFile,
  downloadPreviewFile,
  uploadFileToMaterial
} from '@query/fileHandling'
import { downloadEmThumbnail, uploadbase64Image } from '@query/thumbnailHandler'
import {
  checkAuthenticated,
  hasAccessToAttachmentFile,
  hasAccessToMaterial,
  hasAccessToPublicatication
} from '@services/authService'
import { isAllasEnabled } from '@services/routeEnablerService'
import requestErrorHandler from '@util/requestErrorHandler'
import { fileUploadRules } from '@util/requestValidator'
import winstonLogger from '@util/winstonLogger'
import { NextFunction, Request, Response, Router } from 'express'

/**
 * API version 2.0 for requesting files and metadata related to stored educational materials.
 * This module is a collection of endpoints starting with /material/.
 * Endpoints ordered by the request URL (1) and the request method (2).
 *
 * @param {Router} router
 */
export default (router: Router): void => {
  // MATERIAL FILE DOWNLOAD FOR LOCAL SAVING
  // Download the fysical material file by file name (:filename) to save it on a local hard drive.
  router.get(`/material/file/:filename/download`, downloadFile)

  // MATERIAL FILE DOWNLOAD FOR EMBEDDED PREVIEW
  // Fetch a material file by file name (:filename) for the embedded preview (iframe).
  router.get(`/material/file/:filename/preview`, downloadPreviewFile)

  // THUMBNAIL FETCH FOR THE WEB VIEW
  // Fetch a thumbnail picture by file name (:filename) for the educational material web view.
  router.get(`/material/file/:filename/thumbnail`, downloadEmThumbnail)

  // SET MATERIAL OBSOLETED
  // Materials set obsoleted are not available for the users.
  router.delete(
    `/material/:edumaterialid/obsolete/:materialid`,
    checkAuthenticated,
    hasAccessToMaterial,
    setMaterialObsoleted
  )

  // SET ATTACHMENT OBSOLETED
  // Attachments set obsoleted are not available for the users.
  router.delete(
    `/material/:edumaterialid/obsolete/:attachmentid/attachment`,
    checkAuthenticated,
    hasAccessToAttachmentFile,
    setAttachmentObsoleted
  )

  // DOWNLOAD ALL FILES AS a COMPRESSED ZIP FILE.
  // :edumaterialid format: number between 1 to 6 digits - ID of an educational material.
  // :publishedat format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' (ISODate) - optional version specifier.
  router.get(
    `/material/file/:edumaterialid/all{/:publishedat}`,
    (req: Request, res: Response, next: NextFunction): void => {
      downloadAllMaterialsCompressed(req, res, next).catch((err): void => {
        winstonLogger.error('Downstream from the cloud storage failed.')
        next(err)
      })
    }
  )

  // SINGLE FILE UPLOAD TO THE EDUCATIONAL MATERIAL
  // Upload a single file (material) to an existing educational material and stream to the cloud storage.
  router.post(
    `/material/file/:edumaterialid/upload`,
    isAllasEnabled,
    fileUploadRules(),
    requestErrorHandler,
    checkAuthenticated,
    hasAccessToPublicatication,
    uploadFileToMaterial
  )

  // SAVE A LINK MATERIAL TO THE EDUCATIONAL MATERIAL
  // :edumaterialid format: number between 1 to 6 digits - ID of an educational material.
  router.post(
    `/material/link/:edumaterialid`,
    checkAuthenticated,
    hasAccessToPublicatication,
    addLinkToMaterial
  )

  // THUMBNAIL UPLOAD TO CLOUD STORAGE
  // Store a new thumbnail picture of an educational material (:edumaterialid) to the cloud storage.
  router.post(
    `/material/:edumaterialid/thumbnail`,
    isAllasEnabled,
    checkAuthenticated,
    hasAccessToPublicatication,
    uploadbase64Image
  )
}
