import AWS, { AWSError, S3 } from 'aws-sdk'
import {
  BucketName,
  ClientConfiguration,
  GetObjectRequest,
  HeadObjectOutput,
  ObjectKey
} from 'aws-sdk/clients/s3'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'
import { Request, Response } from 'express'
import { winstonLogger } from '../util'

const isProd = process.env.NODE_ENV === 'production'

// Cloud object storage configuration
const configAWS: ServiceConfigurationOptions = {
  region: process.env.STORAGE_REGION as string,
  ...(!isProd
    ? {
        endpoint: process.env.STORAGE_URL as string,
        credentials: {
          accessKeyId: process.env.STORAGE_KEY as string,
          secretAccessKey: process.env.STORAGE_SECRET as string
        }
      }
    : {})
}
const configS3: ClientConfiguration = {
  httpOptions: {
    timeout: 1000 * 60
  },
  maxRetries: 3,
  signatureVersion: 'v2' // v2, v3, v4
}
AWS.config.update(configAWS)

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
    let headResponse: HeadObjectOutput
    try {
      headResponse = await headObjectRequest(req)
      if (req.method === 'HEAD') {
        res.status(200).set({
          'Accept-Ranges': headResponse.AcceptRanges,
          'Last-Modified': headResponse.LastModified,
          'Content-Length': headResponse.ContentLength,
          ETag: headResponse.ETag,
          'Content-Type': headResponse.ContentType
        })
        return resolve()
      }
      if (!req.headers['range']) {
        return reject(new Error('Range request rejected for missing Range HTTP header'))
      }
    } catch (error) {
      return reject(error)
    }

    // GET request
    try {
      const s3: S3 = new AWS.S3(configS3)
      const fileName: string = req.params.filename as string
      if (!req.headers.range) {
        req.headers.range = 'bytes=0-'
      }
      let range: string | undefined = req.headers.range as string
      range = validateRangeValues(range, headResponse)

      const getRequestObject: GetObjectRequest = {
        Bucket: process.env.STORAGE_BUCKET as BucketName,
        Key: fileName as ObjectKey,
        Range: (range as string) || undefined
      }

      // Request configuration and event handlers
      const getRequest: AWS.Request<S3.GetObjectOutput, AWS.AWSError> =
        s3.getObject(getRequestObject)

      getRequest
        .on('error', (error: AWSError) => {
          if (error.name !== 'RequestAbortedError') {
            winstonLogger.error('S3 GET request failed: %o', error)
          }
        })
        .on('httpHeaders', (status: number, headers: { [p: string]: string }) => {
          // Forward headers to the response
          res.set({
            'Content-Length': headers['content-length'],
            'Content-Range': headers['content-range'],
            'Accept-Ranges': headers['accept-ranges'],
            'Last-Modified': headers['last-modified'],
            'Content-Type': headers['content-type'],
            ETag: headers['etag'],
            Date: headers['date'],
            'Cache-Control': 'no-store'
          })
          if (req.headers.range) {
            winstonLogger.debug('Partial streaming request for %s [%s] ', fileName, range)
            res.status(206)
          } else {
            res.attachment(fileName)
            res.status(status)
          }
        })

      // Stream configuration and event handlers
      const stream = getRequest.createReadStream()

      req.on('close', () => {
        winstonLogger.debug('Request closed')
        stream.destroy()
        getRequest.abort()
      })

      stream
        .once('error', (error: AWSError) => {
          if (error.name === 'NoSuchKey') {
            winstonLogger.debug('Requested file %s not found', fileName)
            res.status(404)
            resolve()
          } else if (error.name === 'TimeoutError') {
            winstonLogger.debug('Connection closed by timeout event')
            res.end()
            resolve()
          } else {
            winstonLogger.debug(`S3 connection failed: ${JSON.stringify(error)}`)
            res.status(error.statusCode || 500)
            reject(error)
          }
        })
        .once('close', () => {
          winstonLogger.debug('S3 read stream closed')
          resolve()
        })
        .once('end', () => {
          winstonLogger.debug(
            `%s download of %s completed ${range ? `[${range}]` : ''}`,
            range ? 'Partial' : 'Full',
            fileName
          )
          resolve()
        })
        .pipe(res)
    } catch (error) {
      reject(error)
    }
  })
}

const headObjectRequest = async (req: Request): Promise<HeadObjectOutput> => {
  return new Promise((resolve, reject) => {
    const s3: S3 = new AWS.S3(configS3)
    const headRequestObject: GetObjectRequest = {
      Bucket: process.env.STORAGE_BUCKET as BucketName,
      Key: req.params.filename as ObjectKey
    }
    s3.headObject(headRequestObject, (error: AWSError, head: HeadObjectOutput) => {
      if (error) {
        winstonLogger.error('HEAD request to object storage failed: %s', JSON.stringify(error))
        reject(error)
      }
      if (head) {
        winstonLogger.debug('HEAD request response: %s', JSON.stringify(head))
        resolve(head)
      }
      reject()
    })
  })
}

const validateRangeValues = (
  range: string | undefined,
  headResponse: HeadObjectOutput
): string | undefined => {
  let length = 0
  if (headResponse.ContentLength && range) {
    length = headResponse.ContentLength as number
  } else {
    return undefined
  }
  const maxRange = parseInt(process.env.STORAGE_MAX_RANGE as string, 10) - 1 || 5000000 - 1 // 5 MB
  const [startString, endString]: string[] = range.replace(/bytes=/, '').split('-')
  const start: number = parseInt(startString, 10)
  let end: number = endString ? parseInt(endString, 10) : length - 1
  if (end - start > maxRange) {
    end = start + maxRange
  }
  const bytesResponse: string = `bytes=${start}-${end}`
  winstonLogger.debug('Bytes range return value in validateRangeValues(): %s', bytesResponse)
  return bytesResponse
}

export default {
  getObjectAsStream
}
