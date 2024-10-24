import { ErrorHandler } from '@/helpers/errorHandler';
import { insertMetadataExtension, metadataExtension, usersMetadataExtension } from '@query/metadataExtensionQueries';
import winstonLogger from '@util/winstonLogger';
import { NextFunction, Request, Response } from 'express';

export class MetadataExtension {
  'keywords': Array<{ key: string; value: string }>;
  'accessibilityFeatures': Array<{ value: string; key: string }>;
  'accessibilityHazards': Array<{ value: string; key: string }>;
  'educationalLevels': Array<{ value: string; key: string }>;

  constructor(data?: MetadataExtension) {
    this.keywords = data.keywords;
    this.accessibilityFeatures = data.accessibilityFeatures;
    this.accessibilityHazards = data.accessibilityHazards;
    this.educationalLevels = data.educationalLevels;
  }
}

export async function addMetadataExtension(req: Request, res: Response, next: NextFunction) {
  try {
    const metadata = new MetadataExtension(req.body);
    if (!req.params.id) {
      return res.status(404);
    }
    await insertMetadataExtension(req.params.id, req.session.passport.user.uid, metadata);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    winstonLogger.error(error);
    next(new ErrorHandler(500, 'Issue adding metadata extension'));
  }
}

export async function getMetadataExtension(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.params.id) {
      return res.status(404);
    }
    const data = await metadataExtension(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    winstonLogger.error(error);
    next(new ErrorHandler(500, 'Issue getting metadata extension'));
  }
}

export async function getUsersMetadataExtension(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.params.id) {
      return res.status(404);
    }
    const data = await usersMetadataExtension(req.params.id, req.session.passport.user.uid);
    res.status(200).json(data);
  } catch (error) {
    winstonLogger.error(error);
    next(new ErrorHandler(500, 'Issue getting metadata extension'));
  }
}
