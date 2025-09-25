import { config } from '@/config'
import winston, { format, Logger } from 'winston'

// Configuration for logging format and transports
const winstonLogger: Logger = winston.createLogger({
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

// Named function exports that wrap winston logger methods
export const debug = (message: any, ...meta: any[]): void => {
  winstonLogger.debug(message, ...meta)
}

export const info = (message: any, ...meta: any[]): void => {
  winstonLogger.info(message, ...meta)
}

export const warn = (message: any, ...meta: any[]): void => {
  winstonLogger.warn(message, ...meta)
}

export const error = (message: any, ...meta: any[]): void => {
  winstonLogger.error(message, ...meta)
}

export const isDebugEnabled = (): boolean => {
  return winstonLogger.isDebugEnabled()
}
