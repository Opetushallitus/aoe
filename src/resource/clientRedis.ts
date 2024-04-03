import redis, { RedisClient } from 'redis';
import winstonLogger from '@util/winstonLogger';

const redisHost: string = process.env.REDIS_HOST || '';
const redisPort: number = Number(process.env.REDIS_PORT) || 0;
const redisPass: string = process.env.REDIS_PASS || '';

/**
 * Redis Client with Custom Properties
 */
const clientRedis: RedisClient = redis.createClient({
  host: redisHost,
  port: redisPort,
  password: redisPass,
  family: '4', // IPv4
});

/**
 * Redis Connection Event Handlers
 */
clientRedis.on('connection', () => {
  winstonLogger.debug('REDIS [redis://' + redisHost + ':' + redisPort + '] Connecting...');
});
clientRedis.on('ready', () => {
  winstonLogger.debug('REDIS [redis://' + redisHost + ':' + redisPort + '] Connection is operable');
});
clientRedis.on('reconnecting', () => {
  winstonLogger.debug('REDIS [redis://' + redisHost + ':' + redisPort + '] Reconnecting...');
});
clientRedis.on('error', (error: Error) => {
  winstonLogger.error('REDIS [redis://' + redisHost + ':' + redisPort + '] Error: ' + error);
});

export default clientRedis;
