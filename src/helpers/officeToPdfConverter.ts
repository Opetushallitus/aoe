import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import libre from 'libreoffice-convert';
import { downloadFromStorage, readStreamFromStorage, uploadFileToStorage } from '../queries/fileHandling';
import { db } from '../resources/pg-connect';
import { winstonLogger } from '../util/winstonLogger';
import { ErrorHandler } from './errorHandler';

const officeMimeTypes = [
  // .doc
  'application/msword',
  // .dot
  'application/msword',
  // .docx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // .dotx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  // .docm
  'application/vnd.ms-word.document.macroEnabled.12',
  // .dotm
  'application/vnd.ms-word.template.macroEnabled.12',
  // .xls
  'application/vnd.ms-excel',
  // .xlt
  'application/vnd.ms-excel',
  // .xla
  'application/vnd.ms-excel',
  // .xlsx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // .xltx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  // .xlsm
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  // .xltm
  'application/vnd.ms-excel.template.macroEnabled.12',
  // .xlam
  'application/vnd.ms-excel.addin.macroEnabled.12',
  // .xlsb
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
  // .ppt
  'application/vnd.ms-powerpoint',
  // .pot
  'application/vnd.ms-powerpoint',
  // .pps
  'application/vnd.ms-powerpoint',
  // .ppa
  'application/vnd.ms-powerpoint',
  // .pptx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // .potx
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  // .ppsx
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  // .ppam
  'application/vnd.ms-powerpoint.addin.macroEnabled.12',
  // .pptm
  'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
  // .potm
  'application/vnd.ms-powerpoint.template.macroEnabled.12',
  // .ppsm
  'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
  // .mdb
  'application/vnd.ms-access',
  // openoffice
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.graphics',
  'application/vnd.oasis.opendocument.chart',
  'application/vnd.oasis.opendocument.formula',
  'application/vnd.oasis.opendocument.image',
  'application/vnd.oasis.opendocument.text-master',
  'application/vnd.oasis.opendocument.text-template',
  'application/vnd.oasis.opendocument.spreadsheet-template',
  'application/vnd.oasis.opendocument.presentation-template',
  'application/vnd.oasis.opendocument.graphics-template',
  'application/vnd.oasis.opendocument.chart-template',
  'application/vnd.oasis.opendocument.formula-template',
  'application/vnd.oasis.opendocument.image-template',
  'application/vnd.oasis.opendocument.text-web',
];

/**
 * @param {string} s
 * @return {boolean}
 */
export const isOfficeMimeType = (s: string) => {
  return officeMimeTypes.indexOf(s) >= 0;
};

/**
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @return {Promise<void>}
 */
export const downloadPdfFromAllas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.params.key) {
      next(new ErrorHandler(400, 'key missing'));
    }
    const params = {
      Bucket: process.env.PDF_BUCKET_NAME,
      Key: req.params.key,
    };
    await downloadFromStorage(req, res, next, params, req.params.key);
  } catch (error) {
    winstonLogger.error(error);
    next(new ErrorHandler(error.statusCode, 'Issue showing pdf'));
  }
};

// export async function convertOfficeToPdf(req: Request, res: Response, next: NextFunction) {
//     try {
//         if (!req.params.key) {
//             next(new ErrorHandler("400", "key missing"));
//         }
//         winstonLogger.debug("readstreamfrompouta");
//         const params = {
//             "Bucket" : process.env.BUCKET_NAME,
//             "Key" : req.params.key
//         };
//         const folderpath = process.env.HTMLFOLDER + "/" + req.params.key;
//         const filename = req.params.key.substring(0, req.params.key.lastIndexOf(".")) + ".pdf";
//         winstonLogger.debug("filename: " + filename);
//         const stream = await readStreamFromStorage(params);
//         stream.on("error", function(e) {
//             winstonLogger.error(e);
//             next(new ErrorHandler(e.statusCode, e.message || "Error in download"));
//         });
//         stream.pipe(fs.createWriteStream(folderpath));
//         stream.on("end", async function() {
//             try {
//             winstonLogger.debug("starting officeToPdf");
//             winstonLogger.debug(folderpath);
//             winstonLogger.debug(filename);
//             const path = await officeToPdf(folderpath, filename);
//             winstonLogger.debug("starting createReadStream: " + path);
//             const readstream = fs.createReadStream(path);
//             readstream.on("error", function(e) {
//                 winstonLogger.error(e);
//                 next(new ErrorHandler(e.statusCode, "Error in sending pdf"));
//             });
//             res.header("Content-Disposition", contentDisposition(filename));
//             readstream.pipe(res);
//             // res.status(200).json(d);
//             // outstream.pipe(res);
//             }
//             catch (error) {
//                 winstonLogger.error(error);
//                 next(new ErrorHandler(error.statusCode, "Issue showing pdf"));
//             }
//         });
//     }
//     catch (error) {
//         winstonLogger.error(error);
//         next(new ErrorHandler(error.statusCode, "Issue showing pdf"));
//     }
// }

/**
 * Convert a file to PDF format.
 *
 * @param {string} filepath
 * @param {string} filename
 * @return {Promise<string>}
 */
export const officeToPdf = async (filepath: string, filename: string): Promise<string> => {
  try {
    const extend = 'pdf';
    const file = fs.readFileSync(filepath);
    winstonLogger.debug(filepath);
    winstonLogger.debug(filename);
    // const outputPath = path.join(process.env.HTMLFOLDER + filename);
    const outputPath = process.env.HTMLFOLDER + '/' + filename;
    return new Promise<string>((resolve, reject) => {
      libre.convert(file, extend, undefined, (err, done) => {
        if (err) {
          winstonLogger.error('Error converting file:' + err);
          return reject(err);
        }
        winstonLogger.debug('officeToPdf write to file: ' + outputPath);
        fs.writeFileSync(outputPath, done);
        winstonLogger.debug('officeToPdf writing to file done');
        return resolve(outputPath);
      });
    });
  } catch (error) {
    winstonLogger.debug('officeToPdf error');
    throw new Error(error);
  }
};

export const officeFilesToAllasAsPdf = async (): Promise<void> => {
  try {
    const files = await getOfficeFiles();

    for (let index = 0; index < files.length; index++) {
      const element = files[index];

      if (isOfficeMimeType(element.mimetype) && !element.pdfkey) {
        winstonLogger.debug('Sending PDF to the cloud storage: %s', element.id);
        try {
          const path = await allasFileToPdf(element.filekey);
          winstonLogger.debug('PDF filepath: %s', path);

          const pdfKey = element.filekey.substring(0, element.filekey.lastIndexOf('.')) + '.pdf';
          const obj: any = await uploadFileToStorage(path, pdfKey, process.env.PDF_BUCKET_NAME);
          await updatePdfKey(obj.Key, element.id);
        } catch (e) {
          winstonLogger.error(e);
        }
      }
    }
  } catch (error) {
    winstonLogger.error(error);
  }
};

export const getOfficeFiles = async (): Promise<any> => {
  try {
    return await db.task(async (t: any) => {
      const query = 'SELECT id, filepath, mimetype, filekey, filebucket, pdfkey FROM record ORDER BY id';
      winstonLogger.debug(query, []);

      return await t.any(query);
    });
  } catch (error) {
    winstonLogger.error('Error in getOfficeFiles()');
    throw new Error(error);
  }
};

/**
 * @param {string} key
 * @return {Promise<string>}
 */
export const allasFileToPdf = async (key: string): Promise<string> => {
  try {
    return new Promise<string>(async (resolve, reject) => {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      };
      const folderpath = process.env.HTMLFOLDER + '/' + key;
      const filename = key.substring(0, key.lastIndexOf('.')) + '.pdf';
      winstonLogger.debug('filename: ' + filename);
      const stream = await readStreamFromStorage(params);
      stream.on('error', function (e) {
        winstonLogger.error('Error in allasFileToPdf readstream: ' + e);
        reject(e);
      });

      const ws = fs.createWriteStream(folderpath);
      stream.pipe(ws);
      ws.on('error', function (e) {
        winstonLogger.error('Error in allasFileToPdf writestream: ' + e);
        reject(e);
      });
      ws.on('finish', async function () {
        try {
          winstonLogger.debug(folderpath);
          winstonLogger.debug(filename);
          const path = await officeToPdf(folderpath, filename);
          winstonLogger.debug('PATH IS: ' + path);
          resolve(path);
        } catch (error) {
          winstonLogger.error('allasFileToPdf error: ' + error);
          reject(error);
        }
      });
    });
  } catch (error) {
    winstonLogger.error('allasFileToPdf error');
    throw new Error(error);
  }
};

/**
 * @param {string} key
 * @param {string} id
 * @return {Promise<any>}
 */
export const updatePdfKey = async (key: string, id: string): Promise<any> => {
  try {
    return await db.tx(async (t: any) => {
      const query = 'UPDATE record SET pdfkey = $1 where id = $2';
      winstonLogger.debug('Query in updatePdfKey(): %s %o', query, [key, id]);

      return await t.any(query, [key, id]);
    });
  } catch (error) {
    winstonLogger.error('Error in updatePdfKey(): %o', error);
    throw new Error(error);
  }
};
