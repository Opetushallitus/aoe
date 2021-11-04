import AWS, { S3 } from 'aws-sdk';
import { BucketName, ClientConfiguration, GetObjectRequest, ObjectKey } from 'aws-sdk/clients/s3';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import contentDisposition from 'content-disposition';
import { Request, Response } from 'express';
import { winstonLogger } from '../util';

export const getObjectAsStream = async (req: Request, res: Response): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const configAWS: ServiceConfigurationOptions = {
                accessKeyId: process.env.STORAGE_KEY as string,
                secretAccessKey: process.env.STORAGE_SECRET as string,
                endpoint: process.env.STORAGE_URL as string,
                region: process.env.STORAGE_REGION as string
            };
            const configS3: ClientConfiguration = {
                maxRetries: 10
            };
            const fileName: string = req.params.filename as string;
            const requestObject: GetObjectRequest = {
                Bucket: process.env.STORAGE_BUCKET as BucketName,
                Key: fileName as ObjectKey
            };
            AWS.config.update(configAWS);
            const s3: S3 = new AWS.S3(configS3);
            const fileStream = s3.getObject(requestObject).createReadStream();
            res.attachment(fileName);
            res.header('Content-Disposition', contentDisposition(fileName));
            fileStream
                .on('error', (error: Error) => {
                    reject(error);
                })
                .once('end', () => {
                    winstonLogger.debug('Streaming of %s from the object storage completed', fileName);
                    resolve();
                })
                .pipe(res);
        } catch (error) {
            reject(error);
        }
    });
}

export default {
    getObjectAsStream
}
