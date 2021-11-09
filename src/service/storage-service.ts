import AWS, { S3 } from 'aws-sdk';
import { BucketName, ClientConfiguration, GetObjectRequest, ObjectKey } from 'aws-sdk/clients/s3';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { Request, Response } from 'express';
import { winstonLogger } from '../util';

/**
 * Stream files from the cloud object storage and forward HTTP headers to response stream.
 * Partial HTTP Range requests supported.
 *
 * HTTP status: 200 OK, 206 Partial Content, 416 Range Not Satisfiable
 *
 * @param req express.Request
 * @param res express.Response
 */

// Storage configuration
const configAWS: ServiceConfigurationOptions = {
    accessKeyId: process.env.STORAGE_KEY as string,
    secretAccessKey: process.env.STORAGE_SECRET as string,
    endpoint: process.env.STORAGE_URL as string,
    region: process.env.STORAGE_REGION as string
};
const configS3: ClientConfiguration = {
    httpOptions: {
        timeout: 2 * 60 * 1000
    },
    maxRetries: 3,
    signatureVersion: 'v2'
};
AWS.config.update(configAWS);
const s3: S3 = new AWS.S3(configS3);

export const getObjectAsStream = async (req: Request, res: Response): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const fileName: string = req.params.filename as string;
            const range: string = req.headers.range as string;
            const requestObject: GetObjectRequest = {
                Bucket: process.env.STORAGE_BUCKET as BucketName,
                Key: fileName as ObjectKey,
                Range: range as string
            };

            // Request configuration and event handlers
            const request = s3.getObject(requestObject)
                .on('httpHeaders', (status: number, headers: { [p: string]: string }) => {
                    res.set(headers);
                    if (req.headers.range) {
                        winstonLogger.debug('Partial streaming request for %s [%s] ', fileName, range);
                        res.status(206);
                    } else {
                        res.attachment(fileName);
                        res.status(200);
                    }
                });

            // Stream configuration and event handlers
            request.createReadStream()
                .on('error', (error: Error) => {
                    if (error.name === 'TimeoutError') {
                        resolve();
                    }
                    reject(error);
                })
                .on('end', () => {
                    winstonLogger.debug((range ? 'Partial' : 'Full') + ' download of %s completed ' +
                        (range ? `[${range}]` : ''), fileName);
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
