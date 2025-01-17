import AWS, { S3 } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import config from '@/config';

const isProd = process.env.NODE_ENV === 'production';

/**
 * AWS S3 cloud storage configuration.
 * @type {{endpoint: string, credentials: {accessKeyId: string, secretAccessKey: string}, region: string}}
 */
const configS3: ServiceConfigurationOptions = {
  region: config.CLOUD_STORAGE_CONFIG.region,
  ...(!isProd
    ? {
        endpoint: process.env.CLOUD_STORAGE_API,
        credentials: {
          accessKeyId: process.env.CLOUD_STORAGE_ACCESS_KEY,
          secretAccessKey: process.env.CLOUD_STORAGE_ACCESS_SECRET,
        },
      }
    : {}),
};
AWS.config.update(configS3);
export const s3: S3 = new AWS.S3();

export default {
  s3,
};
