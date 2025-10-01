import { config } from '@/config'
import { sequelize } from '@/domain/aoeModels'
import { handleError } from '@/helpers/errorHandler'
import { h5p } from '@api/routes-root/h5p'
import { embed } from '@api/routes-root/embed'
import { v1 } from '@api/routes-v1/v1'
import { v2 } from '@api/routes-v2/v2'
import { registerOidcStrategy } from '@resource/oidcConfig'
import { checkAuthenticated } from '@services/authService'
import { initializeH5P } from '@services/h5pService'
import {
  startScheduledCleaning,
  startScheduledMailJobs,
  startScheduledPdfConvertAndUpstreamOfficeFiles,
  startScheduledRegistrationForPIDs,
  startScheduledSearchIndexUpdate
} from '@util/aoeScheduler'
import morganLogger from '@util/morganLogger'
import * as log from '@util/winstonLogger'
import bodyParser from 'body-parser'
import compression from 'compression'
import flash from 'connect-flash'
import cors, { CorsOptions } from 'cors'
import express, { Express, Request, Response, Router, NextFunction } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import lusca from 'lusca'
import passport from 'passport'
import connectRedis from 'connect-redis'
import session, { SessionOptions } from 'express-session'
import { redisClient } from '@resource/redisClient'
import { db } from './resource/postgresClient'
import { initializeIndices } from './search/es'
import { randomUUID } from 'crypto'
import { asyncLocalStorage } from './asyncLocalStorage'

export async function initApp() {
  const app: Express = express()

  const RedisStore = connectRedis(session)

  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    const requestId = req.headers['x-amz-cf-id'] ? String(req.headers['x-amz-cf-id']) : randomUUID()
    await asyncLocalStorage.run(
      {
        requestId
      },
      async () => {
        await next()
      }
    )
  })

  app.use(
    session({
      store: new RedisStore({ client: redisClient, logErrors: true }),
      resave: config.SESSION_CONFIG_OPTIONS.resave as boolean,
      rolling: config.SESSION_CONFIG_OPTIONS.rolling as boolean,
      saveUninitialized: config.SESSION_CONFIG_OPTIONS.saveUninitialized as boolean,
      secret: config.SESSION_CONFIG_OPTIONS.secret as string,
      proxy: config.SESSION_CONFIG_OPTIONS.proxy,
      cookie: {
        domain: config.SESSION_COOKIE_OPTIONS.domain,
        httpOnly: config.SESSION_COOKIE_OPTIONS.httpOnly,
        maxAge: config.SESSION_COOKIE_OPTIONS.maxAge,
        sameSite: config.SESSION_COOKIE_OPTIONS.sameSite,
        path: config.SESSION_COOKIE_OPTIONS.path,
        secure: config.SESSION_COOKIE_OPTIONS.secure
      }
    } as SessionOptions)
  )

  app.use(passport.initialize())
  app.use(passport.session())

  app.disable('x-powered-by')

  // Load API root modules
  const apiRouterRoot: Router = Router()
  h5p(apiRouterRoot)
  embed(apiRouterRoot)

  // Load API version 1.0
  const apiRouterV1: Router = Router()
  v1(apiRouterV1)

  // Load API version 2.0
  const apiRouterV2: Router = Router()
  v2(apiRouterV2)

  // Process X-Forwarded-* headers behind a proxy server at localhost (127.0.0.1)
  app.set('trust proxy', '127.0.0.1')

  // CORS and Referer configurations for the development environments.
  if (['development', 'localhost'].includes(process.env.NODE_ENV as string)) {
    app.use(
      cors({
        allowedHeaders: [
          'Accept',
          'Authorization',
          'Content-Type',
          'Origin',
          'Range',
          'X-Requested-With'
        ],
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        optionsSuccessStatus: 204,
        origin: true
      } as CorsOptions)
    )
  }

  app.use(compression())
  app.use(flash())
  app.use(morganLogger)

  await registerOidcStrategy(app)

  // Initialize H5P editor
  initializeH5P().catch((err: unknown): void => {
    log.error('Initialization of H5P editor failed', err)
  })

  // Statistics requests forwarded to AOE Analytics Service.
  // Keep the HTTP forwarding before the body parsers to avoid request body changes the proxy cannot handle.
  app.use(
    '/api/v2/statistics',
    checkAuthenticated,
    createProxyMiddleware({
      target: config.SERVER_CONFIG_OPTIONS.oaipmhAnalyticsURL,
      logLevel: 'debug',
      logProvider: () => ({
        debug: log.debug,
        info: log.info,
        warn: log.warn,
        error: log.error,
        log: log.info
      }),
      changeOrigin: true,
      pathRewrite: (path: string) => path.replace('api/v2', 'analytics/api')
    })
  )

  // Synchronize database with Sequelize models.
  const dbInit = async (): Promise<void> => {
    await sequelize.sync({
      logging: false
    })
  }
  dbInit().catch((err: unknown): void => {
    log.error('Synchronizing database with Sequelize models failed', err)
    process.exit(1)
  })

  app.get('/health', async (_req: Request, res: Response) => {
    await db.any('SELECT 1')
    res.json({ status: 'ok' })
  })

  app.use(bodyParser.json({ limit: '1mb' }))
  app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))
  app.use('/favicon.ico', express.static('./views/favicon.ico'))
  app.use('/', apiRouterRoot)
  app.use('/api/v1/', apiRouterV1)
  app.use('/api/v2/', apiRouterV2)
  app.use('/h5p/content', express.static(config.MEDIA_FILE_PROCESS.h5pPathContent))
  app.use('/h5p/core', express.static(config.MEDIA_FILE_PROCESS.h5pPathCore))
  app.use('/h5p/editor', express.static(config.MEDIA_FILE_PROCESS.h5pPathEditor))
  app.use('/h5p/libraries', express.static(config.MEDIA_FILE_PROCESS.h5pPathLibraries))
  app.use('/content/', express.static(config.MEDIA_FILE_PROCESS.htmlFolder))
  app.use(lusca.xframe('SAMEORIGIN'))
  app.use(lusca.xssProtection)

  app.use(handleError)

  app.set('port', 3000)

  // Start scheduled maintenance processes
  initializeIndices()
  startScheduledCleaning()
  startScheduledRegistrationForPIDs()
  startScheduledSearchIndexUpdate()
  startScheduledMailJobs()
  startScheduledPdfConvertAndUpstreamOfficeFiles()

  return app
}
