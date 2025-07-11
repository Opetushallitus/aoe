import config from '@/config';
import {
  EducationalMaterial,
  Material,
  MaterialDisplayName,
  Record,
  sequelize,
} from '@/domain/aoeModels';
import { ErrorHandler } from '@/helpers/errorHandler';
import {
  downstreamAndConvertOfficeFileToPDF,
  isOfficeMimeType,
  updatePdfKey,
} from '@/helpers/officeToPdfConverter';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { db, pgp } from '@resource/postgresClient';
import { hasAccesstoPublication } from '@services/authService';
import { requestRedirected } from '@services/streamingService';
import winstonLogger from '@util/winstonLogger';
import { EntryData } from 'archiver';
import AWS, { AWSError, S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { NextFunction, Request, Response } from 'express';
import fs, { WriteStream } from 'fs';
import multer, { DiskStorageOptions, Multer, StorageEngine } from 'multer';
import { promisify } from 'node:util';
import path from 'path';
import pdfParser from 'pdf-parse';
import { ColumnSet, ITask } from 'pg-promise';
import s3Zip, { ArchiveOptions } from 's3-zip';
import { Transaction } from 'sequelize';
import stream, { PassThrough, Readable } from 'stream';
import { updateDownloadCounter } from './analyticsQueries';
import { insertEducationalMaterialName } from './apiQueries';
import MulterFile = Express.Multer.File;
import SendData = ManagedUpload.SendData;
import StreamZip from 'node-stream-zip';
import { IClient } from 'pg-promise/typescript/pg-subset';

const isProd = process.env.NODE_ENV === 'production';

// AWS and S3 configurations.
const configAWS: ServiceConfigurationOptions = {
  region: config.CLOUD_STORAGE_CONFIG.region,
  ...(!isProd
    ? {
        endpoint: config.CLOUD_STORAGE_CONFIG.endpoint,
        credentials: {
          accessKeyId: config.CLOUD_STORAGE_CONFIG.accessKeyId,
          secretAccessKey: config.CLOUD_STORAGE_CONFIG.secretAccessKey,
        },
      }
    : {}),
};
AWS.config.update(configAWS);

// define multer storage
const storage: StorageEngine = multer.diskStorage({
  // notice you are calling the multer.diskStorage() method here, not multer()
  destination: (_req: Request, _file: any, cb: any) => {
    cb(undefined, `${config.MEDIA_FILE_PROCESS.localFolder}/`);
  },
  filename: (_req: Request, file: any, cb: any) => {
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    let str = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
    str = str.replace(/[^a-zA-Z0-9]/g, '');
    cb(undefined, str + '-' + Date.now() + ext);
  },
} as DiskStorageOptions);

const upload: Multer = multer({
  storage: storage,
  limits: { fileSize: Number(process.env.FILE_SIZE_LIMIT) },
  preservePath: true,
}); // provide the return value from

/**
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @return {Promise<any>}
 */
export const uploadAttachmentToMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const contentType = req.headers['content-type'];
    if (!contentType) {
      return next(new ErrorHandler(400, 'Missing content-type header'));
    }

    const materialId = req.params.materialId;
    if (!materialId) {
      return next(new ErrorHandler(400, 'Missing materialId req param'));
    }

    if (!contentType.startsWith('multipart/form-data')) {
      return next(new ErrorHandler(400, 'Wrong contentType'));
    }
    upload.single('attachment')(req, res, async (err: any) => {
      if (err) {
        winstonLogger.error('Multer error in uploadAttachmentToMaterial(): %o', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorHandler(413, err.message));
        } else {
          return next(new ErrorHandler(500, 'Failure in file upload'));
        }
      }
      const file = req.file;
      if (!file) {
        return next(new ErrorHandler(400, 'No file sent'));
      }
      const metadata = JSON.parse(req.body.attachmentDetails);
      winstonLogger.debug(metadata);
      const attachmentId = await insertDataToAttachmentTable(
        file,
        materialId,
        undefined,
        undefined,
        undefined,
        metadata,
      );
      const result = await insertDataToTempAttachmentTable(file, metadata, attachmentId);
      const obj: any = await uploadFileToStorage(
        file.path,
        file.filename,
        config.CLOUD_STORAGE_CONFIG.bucket,
      );
      await updateAttachment(obj.Key, obj.Bucket, obj.Location, attachmentId);
      await deleteDataToTempAttachmentTable(file.filename, result[0].id);
      fs.unlink(file.path, (err: any) => {
        if (err) {
          winstonLogger.error(err);
        }
      });
      res.status(200).json({ id: attachmentId });
    });
  } catch (err) {
    winstonLogger.error('Failure in file upload', req.file, err);
    return next(new ErrorHandler(500, 'Failure in file upload'));
  }
};

/**
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @return {Promise<any>}
 */
export const uploadMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const contentType = req.headers['content-type'];
    if (!contentType) {
      return next(new ErrorHandler(400, 'Missing content-type header'));
    }

    winstonLogger.debug(req.body);
    if (!contentType.startsWith('multipart/form-data')) {
      return next(new ErrorHandler(400, 'Wrong contentType'));
    }
    upload.single('file')(req, res, async (err: any) => {
      try {
        if (err) {
          winstonLogger.debug(err);
          if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ErrorHandler(413, err.message));
          } else {
            winstonLogger.error(err);
            next(new ErrorHandler(500, 'Error in upload'));
          }
        }
        const resp: any = {};

        // Send educationalmaterialid if no file send for link material creation.
        if (!req.file) {
          await db
            .tx(async (t: any) => {
              const id = await insertDataToEducationalMaterialTable(req, t);
              if (req.body.name) {
                await insertEducationalMaterialName(JSON.parse(req.body.name), id.id, t);
              }
              return id;
            })
            .then((data: any) => {
              resp.id = data.id;
              return res.status(200).json(resp);
            })
            .catch((err: Error) => {
              winstonLogger.debug(err);
              next(new ErrorHandler(500, 'Error in upload'));
            });
        } else {
          const file: MulterFile = req.file;
          let materialid: string;
          const fileDetails = JSON.parse(req.body.fileDetails);
          const material: any = [];
          db.tx(async (t: ITask<IClient>) => {
            const emresp = await insertDataToEducationalMaterialTable(req, t);
            const id = await insertDataToMaterialTable(
              t,
              emresp.id,
              '',
              fileDetails.language,
              fileDetails.priority,
            );
            material.push({ id: id.id, createFrom: file.originalname });
            materialid = id.id;
            await insertDataToDisplayName(t, emresp.id, id.id, fileDetails);
            await insertDataToTempRecordTable(t, file, id.id);
            return emresp;
          })
            .then(async (data: any) => {
              // return 200 if success and continue sending files to pouta
              resp.id = data.id;
              resp.material = material;
              res.status(200).json(resp);
              try {
                if (typeof file !== 'undefined') {
                  winstonLogger.debug(materialid);
                  const obj: any = await uploadFileToStorage(
                    file.path,
                    file.filename,
                    config.CLOUD_STORAGE_CONFIG.bucket,
                  );
                  const recordid = await insertDataToRecordTable(
                    file,
                    materialid,
                    obj.Key,
                    obj.Bucket,
                    obj.Location,
                  );

                  // convert file to pdf if office document
                  try {
                    if (isOfficeMimeType(file.mimetype)) {
                      winstonLogger.debug('Convert file and send to allas');
                      const path = await downstreamAndConvertOfficeFileToPDF(obj.Key);
                      const pdfkey = obj.Key.substring(0, obj.Key.lastIndexOf('.')) + '.pdf';
                      const pdfobj: any = await uploadFileToStorage(
                        path,
                        pdfkey,
                        config.CLOUD_STORAGE_CONFIG.bucketPDF,
                      );
                      if (recordid) {
                        await updatePdfKey(pdfobj.Key, recordid);
                      }
                    }
                  } catch (e) {
                    winstonLogger.debug('ERROR converting office file to pdf');
                    winstonLogger.error(e);
                  }
                  await deleteDataFromTempRecordTable(file.filename, materialid);
                  fs.unlink(file.path, (err: any) => {
                    if (err) {
                      winstonLogger.error(err);
                    }
                  });
                }
              } catch (err) {
                winstonLogger.debug(
                  'error while sending file to pouta: ' + JSON.stringify((<any>req).file),
                );
                winstonLogger.error(err);
              }
            })
            .catch((err: Error) => {
              if (!res.headersSent) {
                next(new ErrorHandler(500, 'Error in upload: ' + err));
              }
              fs.unlink(file.path, (err: any) => {
                if (err) {
                  winstonLogger.debug('Error in uploadMaterial(): ' + err);
                } else {
                  winstonLogger.debug('file removed');
                }
              });
            });
        }
      } catch (e) {
        if (!res.headersSent) {
          next(new ErrorHandler(500, 'Error in upload: ' + e));
        }
      }
    });
  } catch (err) {
    next(new ErrorHandler(500, 'Error in upload: ' + err));
  }
};

/**
 * @param {e.Request} req
 * @param {e.Response} res
 * @return {Promise<{file: Express.Multer.File, fileDetails: Record<string, unknown>}>}
 */
const uploadFileToLocalDisk = (
  req: Request,
  res: Response,
): Promise<{ file: MulterFile; fileDetails: Record<string, unknown> }> => {
  return new Promise((resolve, reject): void => {
    try {
      upload.single('file')(req, res, (err: any): void => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            throw new ErrorHandler(413, 'MULTER: ' + err.message);
          } else {
            throw new ErrorHandler(500, 'MULTER: ' + err);
          }
        }
        resolve({
          file: req.file as MulterFile,
          fileDetails: JSON.parse(req.body.fileDetails) as Record<string, unknown>,
        });
      });
    } catch (err) {
      const file = req.file;
      if (file) {
        fs.unlink(file.path, (err) => {
          if (err) winstonLogger.error('File removal after the interrupted upload failed: %o', err);
        });
      }
      reject(err);
      winstonLogger.error('File upload failed: %o', err);
    }
  });
};

const detectEncyptedPDF = (filePath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data: Buffer) => {
      if (err) {
        reject(err);
        return;
      }
      pdfParser(data)
        .then((info) => {
          const isEncrypted: boolean = info.info.Encrypt !== undefined;
          resolve(isEncrypted);
        })
        .catch((err) => {
          if (err.name === 'PasswordException') {
            resolve(true);
            return;
          } else {
            reject(err);
            return;
          }
        });
    });
  });
};

const deleteFileFromLocalDiskStorage = (file: MulterFile) => {
  fs.unlink(file.path, (err: any): void => {
    if (err) winstonLogger.error('Unlink removal for the uploaded file failed: %o', err);
  });
};

/**
 * Upload a single file to the educational material with a multipart form upload.
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @return {Promise<void>}
 */
export const uploadFileToMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { file, fileDetails }: any = await uploadFileToLocalDisk(req, res)
    .then((result: { file: MulterFile; fileDetails: Record<string, unknown> }) => {
      return result;
    })
    .catch((err) => {
      winstonLogger.error('Multer upload failed: %o', err);
      throw err;
    });
  if (!fs.existsSync(`${config.MEDIA_FILE_PROCESS.localFolder}/${file.filename}`)) {
    res.status(500).json({ message: 'aborted' });
    return;
  }
  // Detect and reject encrypted PDFs.
  if (file.mimetype === 'application/pdf') {
    const isEncrypted: boolean = await detectEncyptedPDF(
      `${config.MEDIA_FILE_PROCESS.localFolder}/${file.filename}`,
    );
    if (isEncrypted) {
      res.status(415).json({ rejected: 'Encrypted PDF files not allowed' }).end();
      deleteFileFromLocalDiskStorage(file);
      return;
    }
  }

  const edumaterialid = req.params.edumaterialid;

  if (!edumaterialid) {
    res.status(400).json({ rejected: 'Missing edumaterialid' });
    return;
  }

  let material: Material;
  let recordID: string;
  let t: Transaction;
  t = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED, // SERIALIZABLE,
  });
  try {
    // Save the general information of a new material entry.
    // Create a material in a separate transaction before using the returning material ID to avoid concurrency issues.
    material = await Material.create(
      {
        link: '',
        educationalMaterialId: edumaterialid,
        obsoleted: 0,
        priority: (fileDetails as any).priority,
        materialLanguageKey: (fileDetails as any).language,
      },
      {
        transaction: t,
      },
    );
    // Save the material display name with language versions.
    await upsertMaterialDisplayName(t, material.id, fileDetails);

    recordID = await upsertRecord(t, file, material.id); // await insertDataToRecordTable(file, material.id);
    await t.commit();
  } catch (err: any) {
    winstonLogger.error('Transaction for the single file upload failed: %o', err);
    await t.rollback();
    throw new ErrorHandler(500, `Transaction for the single file upload failed: ${err}`);
  }
  res.status(200).json({
    id: edumaterialid,
    material: [
      { id: material.id, createFrom: file.originalname, educationalmaterialid: edumaterialid },
    ],
  });

  try {
    const fileS3: SendData = await uploadFileToStorage(
      file.path,
      file.filename,
      config.CLOUD_STORAGE_CONFIG.bucket,
      material,
    );
    await sequelize.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED, // SERIALIZABLE,
      },
      async (t: Transaction): Promise<void> => {
        await upsertRecord(
          t,
          file,
          material.id,
          fileS3.Key,
          fileS3.Bucket,
          fileS3.Location,
          recordID,
        );
      },
    );
    // Create and save a PDF version from the office file formats, such as Excel, Word and PowerPoint.
    if (isOfficeMimeType(file.mimetype)) {
      const keyPDF: string = fileS3.Key.substring(0, fileS3.Key.lastIndexOf('.')) + '.pdf';
      // Downstream an office file and convert to PDF in the local file system (linked disk storage).
      await downstreamAndConvertOfficeFileToPDF(fileS3.Key).then(
        async (pathPDF: string): Promise<void> => {
          // Upstream the converted PDF file to the cloud storage (dedicated PDF bucket).
          await uploadFileToStorage(pathPDF, keyPDF, config.CLOUD_STORAGE_CONFIG.bucketPDF).then(
            async (pdfS3: SendData): Promise<void> => {
              // Save the material's PDF key to indicate the availability of a PDF version.
              await updatePdfKey(pdfS3.Key, recordID);
            },
          );
        },
      );
    }
  } catch (err) {
    await Material.update(
      { obsoleted: 1 },
      {
        where: {
          id: material.id,
        },
      },
    );
    winstonLogger.error('Single file upstreaming or conversions failed: %o', err);
    if (!res.headersSent) next(new ErrorHandler(500, `File upstreaming failed: ${err}`));
  } finally {
    deleteFileFromLocalDiskStorage(file);
  }
};

const insertDataToEducationalMaterialTable = async (
  req: Request,
  t: ITask<IClient>,
): Promise<{ id: string }> => {
  const uid = req.session?.passport?.user.uid;
  if (!uid) {
    winstonLogger.error('insertDataToEducationalMaterialTable missing uid in reques');
    throw new Error('Missing uid!');
  }
  return await t.one<{ id: string }>(
    `
    INSERT INTO educationalmaterial (usersusername)
    VALUES ($1)
    RETURNING id
  `,
    [uid],
  );
};

/**
 * LEGACY IMPLEMENTATION.
 * TODO: TO BE REMOVED
 * @param t
 * @param {Express.Multer.File} file
 * @param materialId
 * @return {Promise<any>}
 */
const insertDataToTempRecordTable = async (
  t: ITask<IClient>,
  file: MulterFile,
  materialId: any,
): Promise<string> => {
  const query = `
    INSERT INTO temporaryrecord (filename, filepath, originalfilename, filesize, mimetype, materialid)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
  return await t.one<string>(query, [
    file.filename,
    file.path,
    file.originalname,
    file.size,
    file.mimetype,
    materialId,
  ]);
};

/**
 * Update or insert a material display name with the language versions (if available) and attach to a transaction.
 * A new implementation of the function insertDataToDisplayName() below.
 * @param {Transaction} t
 * @param {string} materialId
 * @param fileDetails
 * @return {Promise<any>}
 */
const upsertMaterialDisplayName = async (
  t: Transaction,
  materialId: string,
  fileDetails: any,
): Promise<void> => {
  const materialDisplayNameEN = await MaterialDisplayName.findOne({
    where: { language: 'en', materialId },
    transaction: t,
  });
  const materialDisplayNameFI = await MaterialDisplayName.findOne({
    where: { language: 'fi', materialId },
    transaction: t,
  });
  const materialDisplayNameSV = await MaterialDisplayName.findOne({
    where: { language: 'sv', materialId },
    transaction: t,
  });
  const missingLang: string =
    fileDetails.displayName.en || fileDetails.displayName.fi || fileDetails.displayName.sv;
  await MaterialDisplayName.upsert(
    {
      id: materialDisplayNameEN && materialDisplayNameEN.id,
      displayName:
        fileDetails.displayName.en ||
        (materialDisplayNameEN && materialDisplayNameEN.displayName) ||
        missingLang,
      language: 'en',
      materialId: materialId || materialDisplayNameEN?.materialId,
    },
    {
      transaction: t,
    },
  );
  await MaterialDisplayName.upsert(
    {
      id: materialDisplayNameFI && materialDisplayNameFI.id,
      displayName:
        fileDetails.displayName.fi ||
        (materialDisplayNameFI && materialDisplayNameFI.displayName) ||
        missingLang,
      language: 'fi',
      materialId: materialId || materialDisplayNameFI?.materialId,
    },
    {
      transaction: t,
    },
  );
  await MaterialDisplayName.upsert(
    {
      id: materialDisplayNameSV && materialDisplayNameSV.id,
      displayName:
        fileDetails.displayName.sv ||
        (materialDisplayNameSV && materialDisplayNameSV.displayName) ||
        missingLang,
      language: 'sv',
      materialId: materialId || materialDisplayNameSV?.materialId,
    },
    {
      transaction: t,
    },
  );
};

/**
 * LEGACY IMPLEMENTATION.
 * TODO: TO BE REMOVED
 * @param t
 * @param educationalmaterialid
 * @param {string} materialid
 * @param fileDetails
 */
export async function insertDataToDisplayName(
  t: any,
  educationalmaterialid: string,
  materialid: string,
  fileDetails: any,
) {
  const query =
    'INSERT INTO materialdisplayname (displayname, language, materialid) (SELECT $1,$2,$3 where $3 in (select id from material where educationalmaterialid = $4)) ON CONFLICT (language, materialid) DO UPDATE Set displayname = $1;';
  if (fileDetails.displayName && materialid) {
    if (!fileDetails.displayName.fi || fileDetails.displayName.fi === '') {
      if (!fileDetails.displayName.sv || fileDetails.displayName.sv === '') {
        if (!fileDetails.displayName.en || fileDetails.displayName.en === '') {
          await t.none(query, ['', 'fi', materialid, educationalmaterialid]);
        } else {
          await t.none(query, [
            fileDetails.displayName.en,
            'fi',
            materialid,
            educationalmaterialid,
          ]);
        }
      } else {
        await t.none(query, [fileDetails.displayName.sv, 'fi', materialid, educationalmaterialid]);
      }
    } else {
      await t.none(query, [fileDetails.displayName.fi, 'fi', materialid, educationalmaterialid]);
    }

    if (!fileDetails.displayName.sv || fileDetails.displayName.sv === '') {
      if (!fileDetails.displayName.fi || fileDetails.displayName.fi === '') {
        if (!fileDetails.displayName.en || fileDetails.displayName.en === '') {
          await t.none(query, ['', 'sv', materialid, educationalmaterialid]);
        } else {
          await t.none(query, [
            fileDetails.displayName.en,
            'sv',
            materialid,
            educationalmaterialid,
          ]);
        }
      } else {
        await t.none(query, [fileDetails.displayName.fi, 'sv', materialid, educationalmaterialid]);
      }
    } else {
      await t.none(query, [fileDetails.displayName.sv, 'sv', materialid, educationalmaterialid]);
    }

    if (!fileDetails.displayName.en || fileDetails.displayName.en === '') {
      if (!fileDetails.displayName.fi || fileDetails.displayName.fi === '') {
        if (!fileDetails.displayName.sv || fileDetails.displayName.sv === '') {
          await t.none(query, ['', 'en', materialid, educationalmaterialid]);
        } else {
          await t.none(query, [
            fileDetails.displayName.sv,
            'en',
            materialid,
            educationalmaterialid,
          ]);
        }
      } else {
        await t.none(query, [fileDetails.displayName.fi, 'en', materialid, educationalmaterialid]);
      }
    } else {
      await t.none(query, [fileDetails.displayName.en, 'en', materialid, educationalmaterialid]);
    }
  }
}

const insertDataToMaterialTable = async (
  t: ITask<IClient>,
  eduMaterialId: string,
  location: any,
  languages: any,
  priority: number,
): Promise<any> => {
  const query = `
    INSERT INTO material (link, educationalmaterialid, materiallanguagekey, priority)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  return await t.one(query, [location, eduMaterialId, languages, priority]);
};

/**
 * @param files
 * @param materialID
 * @param fileKey
 * @param fileBucket
 * @param {string} location
 * @param metadata
 * @return {Promise<any>}
 */
const insertDataToAttachmentTable = async (
  files: any,
  materialID: string,
  fileKey: string | undefined,
  fileBucket: string | undefined,
  location: string | undefined,
  metadata: any,
): Promise<any> => {
  const queries: any[] = [];
  const data = await db
    .tx(async (t: any): Promise<any> => {
      queries.push(
        await db.none(
          `
          UPDATE educationalmaterial
          SET updatedat = NOW()
          WHERE id = (
            SELECT m.educationalmaterialid FROM material m WHERE m.id = $1
          )
        `,
          [materialID],
        ),
      );
      queries.push(
        await db.one(
          `
          INSERT INTO attachment (filePath, originalfilename, filesize, mimetype, fileKey, fileBucket, materialid, defaultfile, kind, label, srclang)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `,
          [
            location,
            files.originalname,
            files.size,
            files.mimetype,
            fileKey,
            fileBucket,
            materialID,
            metadata.default,
            metadata.kind,
            metadata.label,
            metadata.srclang,
          ],
        ),
      );
      return t.batch(queries);
    })
    .catch((err: Error): void => {
      throw err;
    });
  return data[1].id;
};

async function updateAttachment(
  fileKey: any,
  fileBucket: any,
  location: string,
  attachmentId: string,
) {
  await db
    .tx(async (t: ITask<IClient>) => {
      const query =
        'UPDATE attachment SET filePath = $1, fileKey = $2, fileBucket = $3 WHERE id = $4';
      winstonLogger.debug(query);
      await t.none(query, [location, fileKey, fileBucket, attachmentId]);
    })
    .catch((err: Error) => {
      throw err;
    });
}

async function insertDataToTempAttachmentTable(
  files: any,
  metadata: any,
  attachmentId: string,
): Promise<any> {
  const query =
    'INSERT INTO temporaryattachment (filename, filepath, originalfilename, filesize, mimetype, ' +
    'defaultfile, kind, label, srclang, attachmentid) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id';
  winstonLogger.debug(query);
  return await db.any(query, [
    files.filename,
    files.path,
    files.originalname,
    files.size,
    files.mimetype,
    metadata.default,
    metadata.kind,
    metadata.label,
    metadata.srclang,
    attachmentId,
  ]);
}

/**
 * @param {Transaction} t
 * @param file
 * @param {string} materialID
 * @param {string} cloudKey
 * @param {string} cloudBucket
 * @param {string} cloudURI
 * @param {string} recordID
 * @return {Promise<void>}
 */
const upsertRecord = async (
  t: Transaction,
  file: MulterFile,
  materialID: string,
  cloudKey?: string,
  cloudBucket?: string,
  cloudURI?: string,
  recordID?: string,
): Promise<string> => {
  const material = await Material.findOne({
    where: { id: materialID },
    transaction: t,
  });

  if (!material) {
    winstonLogger.error('usperRecord: did not find material to upsert: ', materialID);
    throw new Error('Did not find material to upsert');
  }

  await EducationalMaterial.update(
    { updatedAt: sequelize.literal('CURRENT_TIMESTAMP') },
    {
      where: {
        id: material.educationalMaterialId,
      },
      transaction: t,
    },
  );
  const [record] = await Record.upsert(
    {
      id: recordID,
      filePath: cloudURI,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      materialId: materialID,
      fileKey: cloudKey,
      fileBucket: cloudBucket,
    },
    {
      transaction: t,
    },
  );
  return record.id;
};

/**
 * Transaction to persist the metadata of a new file and update the corresponding educational material.
 * Set the cloud related columns nullable: ALTER TABLE <table> ALTER COLUMN <column> DROP NOT NULL.
 * @param file
 * @param materialID
 * @param cloudKey
 * @param cloudBucket
 * @param {string} cloudURI
 * @param recordID
 * @return {Promise<string | null>}
 */
const insertDataToRecordTable = async (
  file: MulterFile,
  materialID: string,
  cloudKey?: string,
  cloudBucket?: string,
  cloudURI?: string,
  recordID?: string,
): Promise<string | null> => {
  try {
    const { id } = await db.tx(async (t: any) => {
      await t.none(
        `
        UPDATE educationalmaterial SET updatedat = NOW()
        WHERE id = (
          SELECT educationalmaterialid
          FROM material
          WHERE id = $1
        )
      `,
        [materialID],
      );
      let columnSet: ColumnSet = new pgp.helpers.ColumnSet(
        [
          'filepath',
          'originalfilename',
          'filesize',
          'mimetype',
          'materialid',
          'filekey',
          'filebucket',
        ],
        { table: 'record' },
      );
      const values = {
        id: recordID ? recordID : undefined,
        filepath: cloudURI,
        originalfilename: file.originalname,
        filesize: file.size,
        mimetype: file.mimetype,
        materialid: materialID,
        filekey: cloudKey,
        filebucket: cloudBucket,
      };
      if (recordID) {
        columnSet = columnSet.extend(['id']);
      }
      return await t.oneOrNone(`
        ${pgp.helpers.insert([values], columnSet)}
        ON CONFLICT (id) DO UPDATE SET
        filepath = EXCLUDED.filepath, filekey = EXCLUDED.filekey, filebucket = EXCLUDED.filebucket
        RETURNING id
      `);
    });
    return id;
  } catch (err) {
    throw err;
  }
};

/**
 * @param filename
 * @param materialId
 * @return {Promise<void>}
 */
const deleteDataFromTempRecordTable = async (filename: any, materialId: any): Promise<void> => {
  const query = `
    DELETE FROM temporaryrecord
    WHERE filename = $1 AND materialid = $2
  `;
  await db.any(query, [filename, materialId]);
};

async function deleteDataToTempAttachmentTable(filename: any, materialId: any): Promise<any> {
  const query = 'DELETE FROM temporaryattachment WHERE filename = $1 AND id = $2';
  return await db.any(query, [filename, materialId]);
}

/**
 * Upload a file from the local file system to the cloud object storage.
 * @param {string} filePath
 * @param {string} fileName
 * @param {string} bucketName
 * @param {Material} materialMeta
 * @return {Promise<ManagedUpload.SendData>}
 */
export const uploadFileToStorage = (
  filePath: string,
  fileName: string,
  bucketName: string,
  materialMeta?: Material,
): Promise<SendData> => {
  const s3: S3 = new AWS.S3();
  const passThrough: PassThrough = new stream.PassThrough();
  let putObjectS3: S3.PutObjectRequest = { Bucket: bucketName, Key: fileName, Body: passThrough };
  if (materialMeta) {
    putObjectS3 = {
      ...putObjectS3,
      Metadata: {
        educationalMaterialID: materialMeta.educationalMaterialId,
        materialID: materialMeta.id,
      },
    };
  }
  return new Promise((resolve, reject): void => {
    // Read a locally stored file to the streaming passthrough.
    fs.createReadStream(filePath)
      .once('error', (err: Error): void => {
        winstonLogger.error(
          'Readstream for a local file failed in uploadLocalFileToCloudStorage(): %s',
          fileName,
        );
        reject(err);
      })
      .pipe(passThrough);
    // Upstream a locally stored file to the cloud storage from the streaming passthrough.
    s3.upload(putObjectS3)
      .promise()
      .then((resp: SendData): void => {
        resolve(resp);
      })
      .catch((err: Error): void => {
        winstonLogger.error(
          'Upstream to the cloud storage failed in uploadLocalFileToCloudStorage(): %s',
          fileName,
        );
        reject(err);
      });
  });
};

/**
 * Upload a file from the local file system to the cloud object storage.
 *
 * @param base64data Buffer File binary content Base64 encoded
 * @param filename   string Target file name in object storage system
 * @param bucketName string Target bucket in object storage system
 */
export async function uploadBase64FileToStorage(
  base64data: Buffer,
  filename: string,
  bucketName: string,
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new AWS.S3();
      try {
        const params = {
          Bucket: bucketName,
          Key: filename,
          Body: base64data,
        };
        const startTime: number = Date.now();
        s3.upload(params, (err: any, data: any) => {
          if (err) {
            winstonLogger.error(
              'Reading file from the local file system failed in uploadBase64FileToStorage(): ' +
                err,
            );
            reject(err);
          }
          if (data) {
            winstonLogger.debug(
              'Uploading file to the cloud object storage completed in ' +
                (Date.now() - startTime) / 1000 +
                's',
            );
            resolve(data);
          }
        });
      } catch (err) {
        winstonLogger.error(
          'Error in uploading file to the cloud object storage in uploadBase64FileToStorage(): ' +
            err,
        );
        reject(err);
      }
    } catch (err) {
      winstonLogger.error('Error in processing file in uploadBase64FileToStorage(): ' + err);
      reject(err);
    }
  });
}

/**
 *
 * @param req
 * @param res
 * @param next
 */
export const downloadPreviewFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  winstonLogger.debug('HTTP request headers present in downloadPreviewFile(): %o', req.headers);
  try {
    const data = await downloadFileFromStorage(req, res, next);
    if (!data) return res.end();
    return res.status(200).end();
  } catch (err) {
    if (!res.headersSent) {
      next(new ErrorHandler(400, 'Failed to download file'));
    }
  }
};

/**
 * @param req
 * @param res
 * @param next
 */
export const downloadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const filename = req.params.filename;

    if (!filename) {
      return next(new ErrorHandler(400, 'Missing request param filename'));
    }

    const materialidQuery = 'SELECT materialid FROM record WHERE filekey = $1';
    const materialid = (await db.any(materialidQuery, [filename]))[0];

    if (!materialid) return res.status(404).end();

    const educationalmaterialidQuery =
      'SELECT educationalmaterialid FROM versioncomposition WHERE materialid = $1';
    const originalMaterialIdArr: {
      educationalmaterialid: string;
    }[] = await db.any(educationalmaterialidQuery, [materialid.materialid]);

    const originalMaterialId = originalMaterialIdArr?.[0];

    let educationalmaterialId = originalMaterialId
      ? parseInt(originalMaterialId.educationalmaterialid, 10)
      : parseInt(materialid.materialid, 10);

    // Pass educational material ID to the next function in request chain.
    res.locals.id = educationalmaterialId;

    await downloadFileFromStorage(req, res, next);

    // Increase download counter unless the user is the owner of the material.
    if (!req.isAuthenticated() || !(await hasAccesstoPublication(educationalmaterialId, req))) {
      try {
        await updateDownloadCounter(educationalmaterialId.toString());
      } catch (error) {
        winstonLogger.error('Updating download counter failed:', error);
      }
    }
    next();
  } catch (err) {
    if (!res.headersSent) {
      winstonLogger.error('downloadFile error:', err);
      next(new ErrorHandler(400, 'Unkown error'));
    }
  }
};

/**
 * Get file details from the database before proceeding to the file download from the cloud object storage.
 * In case of video streaming request can be redirected to the streaming service when all criteria are fulfilled.
 * TODO: Function chain and related leagcy code should be refactored and simplified in both directions.
 * @param req   express.Request
 * @param res   express.Response
 * @param next  express.NextFunction
 * @param isZip boolean Indicator for the need of decompression
 */
export const downloadFileFromStorage = async (
  req: Request,
  res: Response,
  next: NextFunction,
  isZip?: boolean,
): Promise<any> => {
  const fileName: string = (req.params.filename as string) || (req.params.key as string);
  return new Promise(async (resolve): Promise<void> => {
    try {
      const query = `
        SELECT originalfilename, filesize, mimetype
        FROM record
        RIGHT JOIN material AS m ON m.id = materialid
        WHERE m.obsoleted = 0 AND filekey = $1
        UNION
        SELECT originalfilename, filesize, mimetype
        FROM attachment
        WHERE filekey = $1 AND obsoleted = 0
      `;
      const fileDetails: {
        originalfilename: string;
        filesize: number;
        mimetype: string;
      } | null = await db.oneOrNone(query, [fileName]);
      if (!fileDetails) {
        return next(new ErrorHandler(404, 'Requested file ' + fileName + ' not found.'));
      }
      // Check if Range HTTP header is present and the criteria for streaming service redirect are fulfilled.
      if (
        config.STREAM_REDIRECT_CRITERIA.streamEnabled &&
        req.headers['range'] &&
        (await requestRedirected(fileDetails, fileName))
      ) {
        res.setHeader('Location', config.STREAM_REDIRECT_CRITERIA.redirectUri + fileName);
        res.status(302);
        resolve(undefined);
        return;
      }
      const params: { Bucket: string; Key: string } = {
        Bucket: process.env.CLOUD_STORAGE_BUCKET as string,
        Key: (req.params.filename as string) || (req.params.key as string),
      };
      const resp = await downloadFromStorage(
        res,
        next,
        params,
        fileDetails.originalfilename,
        isZip,
      );
      resolve(resp);
    } catch (err) {
      winstonLogger.error(
        'downloadFileFromStorage(): req.params.filename=%s, isZip=%s',
        req.params.filename,
        isZip,
      );
      next(new ErrorHandler(500, 'Downloading a single file failed in downloadFileFromStorage()'));
    }
  });
};

/**
 * Download a single file to a given directory.
 * Wait for download to complete before resolving the promise function.
 * @param {{Bucket: string, Key: string}} paramsS3
 * @param {string} targetPath
 * @return {Promise<void>}
 */
export const directoryDownloadFromStorage = async (
  paramsS3: {
    Bucket: string;
    Key: string;
  },
  targetPath: string,
): Promise<void> => {
  const s3: S3 = new AWS.S3();
  const streamS3: Readable = s3
    .getObject(paramsS3)
    .createReadStream()
    .once('error', (err: AWSError): void => {
      if (err.name === 'NoSuchKey') {
        winstonLogger.debug('S3 requested key [%s] not found.', paramsS3.Key);
        return;
      } else if (err.name === 'TimeoutError') {
        winstonLogger.debug('S3 connection closed by timeout event.');
        return;
      } else {
        throw err;
      }
    });
  const writeStream: WriteStream = fs.createWriteStream(targetPath);
  const pipeline = promisify(stream.pipeline);
  await pipeline(streamS3, writeStream);
};

/**
 * API function to download an original or compressed (zip) file from the cloud object storage.
 * @param req          express.Request
 * @param res          express.Response
 * @param next         express.NextFunction
 * @param paramsS3     GetRequestObject (aws-sdk/clients/s3)
 * @param origFilename string Original file name without storage ID
 * @param isZip        boolean Indicator for the need of decompression
 */
export const downloadFromStorage = (
  res: Response,
  next: NextFunction,
  paramsS3: { Bucket: string; Key: string },
  origFilename: string,
  isZip?: boolean,
): Promise<string | boolean> => {
  const s3: S3 = new AWS.S3();
  const key: string = paramsS3.Key;
  return new Promise((resolve, reject): void => {
    try {
      const folderpath = `${process.env.HTML_FOLDER}/${origFilename}`;
      const fileStream: Readable = s3.getObject(paramsS3).createReadStream();
      const writeStream: WriteStream = fs
        .createWriteStream(folderpath)
        // Wait for 'finish' event for writable stream.
        .once('finish', async (): Promise<void> => {
          const response: string | boolean = await unZipAndExtract(folderpath);
          resolve(response);
        });
      if (isZip) {
        fileStream
          .once('error', (err: AWSError): void => {
            if (err.name === 'NoSuchKey') {
              winstonLogger.debug('Requested file %s not found.', origFilename);
              res.status(404);
              resolve(false);
            } else if (err.name === 'TimeoutError') {
              winstonLogger.debug('Connection closed by timeout event.');
              res.end();
              resolve(false);
            } else {
              winstonLogger.debug('S3 connection failed: %s.', JSON.stringify(err));
              reject(err);
              throw err;
            }
          })
          // Write the compressed file to the host directory.
          .pipe(writeStream);
      } else {
        res.attachment(origFilename || key);
        fileStream
          .once('error', (err: AWSError): void => {
            if (err.name === 'NoSuchKey') {
              winstonLogger.debug('Requested file %s not found.', origFilename);
              res.status(404);
              resolve(false);
            } else if (err.name === 'TimeoutError') {
              winstonLogger.debug('Connection closed by timeout event.');
              res.end();
              resolve(false);
            } else {
              winstonLogger.debug('S3 connection failed: %s.', JSON.stringify(err));
              reject(err);
              throw err;
            }
          })
          // Wait for 'end' event for readable stream.
          .once('end', (): void => {
            resolve(false);
          })
          .pipe(res);
      }
    } catch (err: unknown) {
      reject();
      next(
        new ErrorHandler(
          500,
          `Download of [${origFilename}] failed in downloadFromStorage(): ${err}`,
        ),
      );
    }
  });
};

/**
 * Download all files related to an educational material as a bundled ZIP file.
 * @param req  Request<any>
 * @param res  Response<any>
 * @param next NextFunction
 */
export const downloadAllMaterialsCompressed = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const edumaterialid = req.params.edumaterialid;

  if (!edumaterialid) {
    return next(new ErrorHandler(400, 'Missing edumaterialid req param'));
  }

  // Queries to resolve files of the latest educational material version requested.
  const queryLatestPublished = `
    SELECT MAX(publishedat) AS max
    FROM versioncomposition
    WHERE educationalmaterialid = $1
  `;
  const queryVersionFilesIds = `
    SELECT r.filekey, r.originalfilename
    FROM versioncomposition vc
    RIGHT JOIN material m ON m.id = vc.materialid
    RIGHT JOIN record r ON r.materialid = m.id
    WHERE m.educationalmaterialid = $1 AND m.obsoleted = 0 AND vc.publishedat = $2
    UNION
    SELECT a.filekey, a.originalfilename
    FROM attachmentversioncomposition avc
    INNER JOIN attachment a ON a.id = avc.attachmentid
    WHERE avc.versioneducationalmaterialid = $1 AND avc.versionpublishedat = $2 AND a.obsoleted = 0
  `;
  const versionFiles: {
    filekey: string;
    originalfilename: string;
  }[] = await db.task(async (t: any): Promise<any[]> => {
    let publishedAt = req.params.publishedat;
    if (!publishedAt) {
      const latestPublished: { max: string } = await t.oneOrNone(
        queryLatestPublished,
        edumaterialid,
      );
      publishedAt = latestPublished.max;
    }
    return await db.any(queryVersionFilesIds, [edumaterialid, publishedAt]);
  });
  const fileKeys: string[] = [];
  const fileNames: EntryData[] = [];
  for (const versionFile of versionFiles) {
    fileKeys.push(versionFile.filekey);
    fileNames.push({
      name: versionFile.originalfilename as string,
    });
  }
  res.header('Content-Disposition', 'attachment; filename=materials.zip');
  // Downstream files from the object storage and zip the bundle.
  await downloadAndZipFromStorage(res, fileKeys, fileNames).catch((err): void => {
    throw err;
  });
  // Update the download counter.
  const educationalMaterialId: number = parseInt(edumaterialid, 10);
  if (!req.isAuthenticated() || !(await hasAccesstoPublication(educationalMaterialId, req))) {
    try {
      await updateDownloadCounter(educationalMaterialId.toString());
    } catch (err) {
      winstonLogger.error('Updating download counter failed: %o', err);
    }
  }
};

/**
 * Stream and combine files from the object storage to a compressed zip file.
 *
 * @param req   Request<any>
 * @param res   Response<any>
 * @param next  NextFunction
 * @param keys  string[] Array of object storage keys
 * @param files string[] Array of file names
 */
const downloadAndZipFromStorage = (
  res: Response,
  keys: string[],
  files: EntryData[],
): Promise<void> => {
  return new Promise((resolve, reject): void => {
    const s3: S3Client = new S3Client({
      region: process.env.CLOUD_STORAGE_REGION,
    } as S3ClientConfig);
    const bucket = process.env.CLOUD_STORAGE_BUCKET;
    try {
      s3Zip
        .archive(
          { s3, bucket } as ArchiveOptions,
          undefined as string | undefined,
          keys as string[],
          files as EntryData[],
        )
        .pipe(res)
        .on('finish', (): void => {
          resolve();
        })
        .on('error', (err: Error): void => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Function to decompress a HTML archive file and locate an index file in the target directory.
 * @param {string} zipFilePath
 * @returns {Promise<boolean | string>}
 */
const unZipAndExtract = async (zipFilePath: string): Promise<boolean | string> => {
  const searchRecursive = (dir: string, pattern: string) => {
    // This is where we store pattern matches of all files inside the directory
    let results: string[] = [];
    // Read contents of directory
    fs.readdirSync(dir).forEach((dirInner) => {
      // Obtain absolute path
      dirInner = path.resolve(dir, dirInner);
      // Get stats to determine if path is a directory or a file
      const stat = fs.statSync(dirInner);
      // If path is a directory, scan it and combine results
      if (stat.isDirectory()) {
        results = results.concat(searchRecursive(dirInner, pattern));
      }
      // If path is a file and ends with pattern then push it onto results
      if (stat.isFile() && dirInner.endsWith(pattern)) {
        results.push(dirInner);
      }
    });
    return results;
  };
  try {
    const targetUnzipFolder = zipFilePath.slice(0, -4);
    const zip = new StreamZip.async({ file: zipFilePath });
    await zip.extract(null, targetUnzipFolder);
    await zip.close();
    // After the decompression search recursively for index.html in the target unzip folder.
    // Return the full path of index.html.
    const indexHtmlPaths: string[] = searchRecursive(targetUnzipFolder, 'index.html');
    if (Array.isArray(indexHtmlPaths) && indexHtmlPaths.length) {
      return indexHtmlPaths[0] || false;
    }
    // If index.html not found, search recursively for index.htm in the target unzip folder.
    const indexHtmPaths = searchRecursive(targetUnzipFolder, 'index.htm');
    if (Array.isArray(indexHtmPaths) && indexHtmPaths.length) {
      return indexHtmPaths[0] || false;
    }
    // The web site is not functional without an index file => return false.
    return false;
  } catch (err) {
    winstonLogger.debug('Decompression of a HTML archive in unzipAndExtract() failed: %o', err);
    return false;
  }
};
