import { config } from '@/config'
import * as log from '@util/winstonLogger'
import moment from 'moment'
import pgPromise, { IDatabase, IEventContext, IInitOptions, IMain } from 'pg-promise'
import { IClient } from 'pg-promise/typescript/pg-subset'

const PG_HOST: string = config.POSTGRESQL_OPTIONS.host
const PG_PORT: string = config.POSTGRESQL_OPTIONS.port
const PG_USER: string = config.POSTGRESQL_OPTIONS.user
const PG_PASS: string = config.POSTGRESQL_OPTIONS.pass
const PG_DATA: string = config.POSTGRESQL_OPTIONS.data

const PG_URL_FULL: string = [
  'postgres://',
  PG_USER,
  ':',
  PG_PASS,
  '@',
  PG_HOST,
  ':',
  PG_PORT,
  '/',
  PG_DATA
].join('')
const PG_URL_HOST: string = ['postgres://', PG_HOST, ':', PG_PORT].join('')

// Options and error handlers for pg-promise.
const initOptions: IInitOptions = {
  error: (err: Error, e: IEventContext<IClient>) => {
    log.error('PG error', err)
    if (e.cn) {
      log.error(`PG [${PG_URL_HOST}] initialization error`, e.cn)
    }
  }
}

export const pgURL = PG_URL_FULL

// Initialize pg-promise with options.
export const pgp: IMain = pgPromise(initOptions)

// Converter for TYPE_TIMESTAMP
const TYPE_TIMESTAMP = 1114
pgp.pg.types.setTypeParser(TYPE_TIMESTAMP, (str: string) => moment.utc(str).toISOString())

// Initialize DB connection
export const db: IDatabase<IClient, IClient> = pgp(PG_URL_FULL)
