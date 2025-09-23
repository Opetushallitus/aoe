import { config } from '@/config'
import winston, { format, Logger } from 'winston'

// Configuration for logging format and transports
export const winstonLogger: Logger = winston.createLogger({
  level: config.APPLICATION_CONFIG.logLevel,
  exitOnError: false,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true, // uncaught exceptions
      handleRejections: true // unhandled promise rejections (Node 15+)
    })
  ]
})

export default winstonLogger
