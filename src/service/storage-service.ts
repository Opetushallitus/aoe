import AWS, { AWSError, S3 } from 'aws-sdk';
import { BucketName, ClientConfiguration, GetObjectRequest, HeadObjectOutput, ObjectKey } from 'aws-sdk/clients/s3';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { Request, Response } from 'express';
import { winstonLogger } from '../util';

// Cloud object storage configuration
const configAWS: ServiceConfigurationOptions = {
    accessKeyId: process.env.STORAGE_KEY as string,
    secretAccessKey: process.env.STORAGE_SECRET as string,
    endpoint: process.env.STORAGE_URL as string,
    region: process.env.STORAGE_REGION as string
};
const configS3: ClientConfiguration = {
    httpOptions: {
        timeout: 0
    },
    maxRetries: 3
    // signatureVersion: 'v2' // v2, v3, v4
};
AWS.config.update(configAWS);

/**
 * Stream files from the cloud object storage and forward HTTP headers to response stream.
 * Partial HTTP Range requests supported.
 *
 * HTTP status: 200 OK, 206 Partial Content, 416 Range Not Satisfiable
 *
 * @param req express.Request
 * @param res express.Response
 */
export const getObjectAsStream = async (req: Request, res: Response): Promise<void> => {
    return new Promise(async (resolve, reject) => {

        // HEAD request
        req.method === 'HEAD' && await headObjectRequest(req).then((head: HeadObjectOutput) => {
            res.status(200).set({
                'accept-ranges': head.AcceptRanges,
                'last-modified': head.LastModified,
                'content-length': head.ContentLength,
                'etag': head.ETag,
                'content-type': head.ContentType
            });
            return resolve();
        }).catch((error: Error) => {
            return reject(error);
        });

        // GET request
        try {
            const s3: S3 = new AWS.S3(configS3);
            const fileName: string = req.params.filename as string;
            const range: string = req.headers.range as string;
            const getRequestObject: GetObjectRequest = {
                Bucket: process.env.STORAGE_BUCKET as BucketName,
                Key: fileName as ObjectKey,
                Range: range as string
            };

            // Request configuration and event handlers
            let statusCode = 200;
            const getRequest = s3.getObject(getRequestObject)
                .on('httpHeaders', (status: number, headers: { [p: string]: string }) => {

                    // Forward headers to the response
                    res.set(headers);
                    statusCode = status;
                });

            // Stream configuration and event handlers
            getRequest.createReadStream()
                .once('error', (error: AWSError) => {
                    if (error.name === 'NoSuchKey') {
                        winstonLogger.debug('Requested file %s not found', fileName);
                        // res.removeHeader('content-disposition');
                        res.status(404);
                        resolve();
                    } else {
                        winstonLogger.debug('S3 connection failed: ' + JSON.stringify(error));
                        res.status(error.statusCode || 500);
                        reject(error);
                    }
                    // res.removeHeader('connection');
                    // res.removeHeader('keep-alive');
                    // getRequest.abort();
                    // stream.end();
                })
                .on('end', () => {
                    winstonLogger.debug(`%s download of %s completed ${(range ? `[${range}]` : '')}`,
                        (range ? 'Partial' : 'Full'), fileName);
                    if (req.headers.range) {
                        winstonLogger.debug('Partial streaming request for %s [%s] ', fileName, range);
                        statusCode = 206;
                    } else {
                        res.attachment(fileName);
                    }
                    res.status(statusCode);
                    resolve();
                })
                .pipe(res);
        } catch (error) {
            reject(error);
        }
    });
}

const headObjectRequest = async (req: Request): Promise<HeadObjectOutput> => {
    return new Promise((resolve, reject) => {
        const s3: S3 = new AWS.S3(configS3);
        const headRequestObject: GetObjectRequest = {
            Bucket: process.env.STORAGE_BUCKET as BucketName,
            Key: req.params.filename as ObjectKey
        };
        s3.headObject(headRequestObject, (error: AWSError, head: HeadObjectOutput) => {
            if (error) {
                winstonLogger.error('HEAD request to object storage failed:' + JSON.stringify(error));
                reject(error);
            }
            if (head) {
                resolve(head);
            }
        });
    });
}

export default {
    getObjectAsStream
}
