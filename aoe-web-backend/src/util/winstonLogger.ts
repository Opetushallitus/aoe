import { asyncLocalStorage } from '@/asyncLocalStorage'
import { config } from '@/config'
import winston, { format, Logger } from 'winston'

// Configuration for logging format and transports
const winstonLogger: Logger = winston.createLogger({
  level: config.APPLICATION_CONFIG.logLevel,
  exitOnError: false,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
    process.env.NODE_ENV === 'development' ? format.prettyPrint() : undefined
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
  const requestId = asyncLocalStorage.getStore()?.requestId
  winstonLogger.debug(message, { ...meta, requestId })
}

export const info = (message: any, ...meta: any[]): void => {
  const requestId = asyncLocalStorage.getStore()?.requestId
  winstonLogger.info(message, { ...meta, requestId })
}

export const warn = (message: any, ...meta: any[]): void => {
  const requestId = asyncLocalStorage.getStore()?.requestId
  winstonLogger.warn(message, { ...meta, requestId })
}

export const error = (message: any, ...meta: any[]): void => {
  const requestId = asyncLocalStorage.getStore()?.requestId
  winstonLogger.error(message, { ...meta, requestId })
}

export const http = (message: any, ...meta: any[]): void => {
  const requestId = asyncLocalStorage.getStore()?.requestId
  winstonLogger.http(message, { ...meta, requestId })
}
