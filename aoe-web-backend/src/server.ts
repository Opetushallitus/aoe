import { config } from '@/config'
import { initApp } from './app'
import knex from 'knex'
import * as path from 'path'
import { Socket } from 'net'
import * as log from '@util/winstonLogger'

async function runMigrations(): Promise<void> {
  const db = knex({
    client: 'pg',
    log: {
      warn: (msg) => log.warn(msg),
      error: (msg) => log.error(msg),
      deprecate: (msg) => log.warn(msg),
      debug: (msg) => log.debug(msg)
    },
    pool: { min: 1, max: 1 },
    connection: {
      host: config.POSTGRESQL_OPTIONS.host,
      port: Number(config.POSTGRESQL_OPTIONS.port),
      user: config.POSTGRESQL_OPTIONS.user,
      password: config.POSTGRESQL_OPTIONS.pass,
      database: config.POSTGRESQL_OPTIONS.data
    },
    migrations: {
      directory: path.join(__dirname, '../migrations'),
      extension: 'js',
      tableName: 'knex_migrations'
    }
  })
  try {
    log.info('Running database migrations')
    await db.migrate.latest()
    log.info('Database migrations complete')
  } catch (error) {
    log.error('Database migration failed', error)
    throw error
  } finally {
    await db.destroy()
  }
}

async function startServer() {
  await runMigrations()

  const app = await initApp()

  const server = app.listen(
    parseInt(process.env.PORT_LISTEN as string, 10) || 3000,
    '0.0.0.0',
    () => {
      log.info(
        `App is running at http://0.0.0.0:${process.env.PORT_LISTEN} in ${app.get('env')} mode`
      )
    }
  )

  // Socket event handlers for the debugging purposes.
  server.on('connection', (socket: Socket) => {
    socket.setTimeout(600 * 60 * 1000)
    socket.on('timeout', () => {
      socket.end()
    })
    socket.on('error', () => {
      socket.end()
    })
  })
}

startServer()
