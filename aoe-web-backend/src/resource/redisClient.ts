import config from '@/config'
import { RedisClientOptions } from '@redis/client'
import winstonLogger from '@util/winstonLogger'
import { createClient } from 'redis'

const redisClient = createClient({
  legacyMode: true,
  url: `${config.REDIS_OPTIONS.protocol}://${config.REDIS_OPTIONS.username}:${encodeURIComponent(
    config.REDIS_OPTIONS.pass
  )}@${config.REDIS_OPTIONS.host}:${config.REDIS_OPTIONS.port}`
} as RedisClientOptions)
  .on('ready', () => {
    winstonLogger.info(
      'REDIS [%s://%s:%d] Connection is operable',
      config.REDIS_OPTIONS.protocol,
      config.REDIS_OPTIONS.host,
      config.REDIS_OPTIONS.port
    )
  })
  .on('error', (err: Error): void => {
    winstonLogger.error(
      'REDIS [%s://%s:%d] Error: %o',
      config.REDIS_OPTIONS.protocol,
      config.REDIS_OPTIONS.host,
      config.REDIS_OPTIONS.port,
      err
    )
  })

const redisInit = async (): Promise<void> => {
  await redisClient.connect()
}
void redisInit()

export default redisClient
