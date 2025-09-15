import apiRoot from './api/routes-root'
import apiV1 from './api/routes-v1'
import bodyParser from 'body-parser'
import compression from 'compression'
import cors, { CorsOptions } from 'cors'
import express, { ErrorRequestHandler, NextFunction, Request, Response, Router } from 'express'
import { morganHttpLogger, postHttpProcessor, winstonLogger } from './util'

const app = express()
const apiRouterRoot: Router = Router()
const apiRouterV1: Router = Router()
apiRoot(apiRouterRoot)
apiV1(apiRouterV1)

// CORS Configuration (cross-origin read only)
const corsOptions: CorsOptions = {
  origin: '*',
  methods: 'GET, HEAD',
  allowedHeaders: ['Range'],
  optionsSuccessStatus: 204
}
app.use(cors(corsOptions))
app.disable('x-powered-by')

// Set application to operate correctly behind a proxy server (get client information from X-Forwarded-* headers)
app.set('trust proxy', '127.0.0.1')

// HTTP request handlers
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morganHttpLogger)

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

// Connected API versions and custom middlewares
app.use('/', apiRouterRoot)
app.use('/stream/api/v1', postHttpProcessor, apiRouterV1)

// Default error handler
app.use(((err: any, req: Request, res: Response, next: NextFunction) => {
  winstonLogger.error(err.stack)
  res.status(err.statusCode || 500)
  res.type('json')
  res.json({
    errors: {
      status: err.statusCode || 500,
      message: err.message || 'Unexpected error occurred'
    }
  })
  next()
}) as ErrorRequestHandler)

export default app
