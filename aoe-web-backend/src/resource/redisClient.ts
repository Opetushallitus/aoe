import config from '@/config';
import { RedisClientOptions } from '@redis/client';
import winstonLogger from '@util/winstonLogger';
import { createClient } from 'redis';

const redisHost: string = config.REDIS_OPTIONS.host;
const redisPort: number = config.REDIS_OPTIONS.port;

const redisClient = createClient({
  url: `redis://${config.REDIS_OPTIONS.username}:${encodeURIComponent(
    config.REDIS_OPTIONS.pass,
  )}@${redisHost}:${redisPort}`,
} as RedisClientOptions)
  .on('ready', () => {
    winstonLogger.debug('REDIS [redis://%s:%d] Connection is operable', redisHost, redisPort);
  })
  .on('error', (err: Error): void => {
    winstonLogger.error('REDIS [redis://%s:%d] Error: %o', redisHost, redisPort, err);
  });

const redisInit = async (): Promise<void> => {
  await redisClient.connect();
};
void redisInit();

export default redisClient;
