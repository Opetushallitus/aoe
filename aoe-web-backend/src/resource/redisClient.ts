import { config } from '@/config'
import { RedisClientOptions } from '@redis/client'
import { error, info } from '@util/winstonLogger'
import { createClient } from 'redis'

export const redisClient = createClient({
  legacyMode: true,
  url: `${config.REDIS_OPTIONS.protocol}://${config.REDIS_OPTIONS.username}:${encodeURIComponent(
    config.REDIS_OPTIONS.pass
  )}@${config.REDIS_OPTIONS.host}:${config.REDIS_OPTIONS.port}`
} as RedisClientOptions)
  .on('ready', () => {
    info(
      `REDIS [${config.REDIS_OPTIONS.protocol}://${config.REDIS_OPTIONS.host}:${config.REDIS_OPTIONS.port}] Connection is operable`
    )
  })
  .on('error', (err: Error): void => {
    error(
      `REDIS [${config.REDIS_OPTIONS.protocol}://${config.REDIS_OPTIONS.host}:${config.REDIS_OPTIONS.port}] Error`,
      err
    )
  })

const redisInit = async (): Promise<void> => {
  await redisClient.connect()
}
void redisInit()
