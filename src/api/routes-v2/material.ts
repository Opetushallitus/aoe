import config from '../../configuration';
import { Request, Response, Router } from 'express';
import fs from 'fs';
import { checkAuthenticated, hasAccessToPublicatication } from '../../services/authService';
import { downloadFile, downloadPreviewFile } from '../../queries/fileHandling';
import { isAllasEnabled } from '../../services/routeEnablerService';
import { downloadEmThumbnail, uploadbase64Image } from '../../queries/thumbnailHandler';
import { winstonLogger } from '../../util/winstonLogger';

/**
 * API version 2.0 for requesting files and metadata related to stored educational material.
 * This module is a collection of endpoints starting with /material/.
 * Endpoints ordered by the request URL (1) and the request method (2).
 *
 * @param router express.Router
 */
export default (router: Router): void => {

    // Legacy endpoints
    // router.post('/material/file/:edumaterialid', isAllasEnabled, ah.checkAuthenticated, ah.hasAccessToPublicatication, fh.uploadFileToMaterial);
    // router.post('/material/file', isAllasEnabled, ah.checkAuthenticated, fh.uploadMaterial);

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

    // MATERIAL FILE UPLOAD STATUS
    let uploads = {};
    router.get(`${moduleRoot}/file/status`, (req: Request, res: Response) => {
        const fileId = req.headers['x-file-id'] as string;
        const fileName = req.headers['x-file-name'] as string;
        const filePath = `${config.MATERIAL_FILE_UPLOAD.localFolder}/${fileName}`;
        const fileSize = parseInt(req.headers['x-file-size'] as string, 10);

        if (fileName) {
            try {
                const stats = fs.statSync(filePath);
                winstonLogger.debug('File upload status request: %s', fileName);
                
                // Check if the requested file exists.
                if (stats.isFile()) {
                    winstonLogger.debug('Already uploaded: %s / %s', stats.size, fileSize);
                    if (fileSize == stats.size) {
                        return res.send({ 'uploaded': 'all' });
                    }
                    if (!uploads[fileId])
                        uploads[fileId] = {}
                    winstonLogger.debug(uploads[fileId]);
                    uploads[fileId]['bytesReceived'] = stats.size;
                    winstonLogger.debug(uploads[fileId], stats.size);
                }
            } catch (error) {
                winstonLogger.debug('File reading failed in %s', filePath);
            }
        }
        let upload = uploads[fileId];
        if (upload)
            res.send({ "uploaded": upload.bytesReceived });
        else
            res.send({ "uploaded": 0 });
    });

    // MATERIAL FILE UPLOAD TO START OR RESUME UPSTREAMING
    router.post(`${moduleRoot}/file`, (req: Request, res: Response) => {
        return res.send({ 'message': 'success' }).end();
    });

    // THUMBNAIL UPLOAD TO CLOUD STORAGE
    // Store a new thumbnail picture of an educational material (:edumaterialid) to the cloud storage.
    router.post(`${moduleRoot}/:edumaterialid([0-9]{1,6})/thumbnail`,
        isAllasEnabled,
        checkAuthenticated,
        hasAccessToPublicatication,
        uploadbase64Image);

}
