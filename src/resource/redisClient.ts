import redis, { createClient } from 'redis';
import winstonLogger from '@util/winstonLogger';
import config from '@/config';
import { RedisClientOptions } from '@redis/client';

const redisHost: string = config.REDIS_OPTIONS.host;
const redisPort: number = config.REDIS_OPTIONS.port;
const redisPass: string = config.REDIS_OPTIONS.pass;

const redisClient = createClient({
  url: `redis://:${redisPass}@${redisHost}:${redisPort}`,
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
