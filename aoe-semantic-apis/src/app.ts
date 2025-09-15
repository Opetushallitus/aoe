import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import compression from 'compression' // compress requests
import bodyParser from 'body-parser'
import cron from 'node-cron'
import cors from 'cors'

import router from './routes'
import healthRouter from './healthRoute'
import { client, updateRedis } from './util/redis.utils'
import { winstonLogger } from './util'

const app = express()
const expressSwagger = require('express-swagger-generator')(app)

// Configuration
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', 3000)

if (app.get('env') === 'development') {
  app.use(cors())
}

client.on('error', (error: any) => {
  winstonLogger.error(error)
})

client.on('ready', async () => {
  winstonLogger.info('Pushing data to REDIS')
  await updateRedis()
})

// set cron jobs to run every sunday 03:00
cron.schedule('0 0 3 * * 0', async () => {
  await updateRedis()
  winstonLogger.info('Scheduled update completed for all semantic datasets.')
})

// Prefixed routes
app.use('/ref/api/v1', router)
app.use('/', healthRouter)

// Default error handler.
app.use(((err, req: Request, res: Response, next: NextFunction) => {
  winstonLogger.error(err.stack)
  res.status(err.statusCode || 500)
  res.type('json')
  res.json({
    errors: {
      status: err.statusCode || 500,
      message: 'Unexpected error occurred'
    }
  })
  next()
}) as ErrorRequestHandler)

// Swagger
const options = {
  swaggerDefinition: {
    info: {
      description: 'Koodisto microservice',
      title: 'koodisto-service',
      version: '2.3.2'
    },
    host: 'aoe.fi',
    basePath: '/ref/api/v1',
    produces: ['application/json'],
    schemes: ['https']
  },
  basedir: __dirname, // app absolute path
  files: ['./routes.js'] // Path to the API handle folder
}
expressSwagger(options)

export default app
