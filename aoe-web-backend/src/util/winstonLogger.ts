import { asyncLocalStorage } from '@/asyncLocalStorage'
import winston, { format, Logger } from 'winston'

const formatters = [
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
]
if (process.env.NODE_ENV === 'development') {
  formatters.push(format.prettyPrint())
}

// Configuration for logging format and transports
export const logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  exitOnError: false,
  format: format.combine(...formatters),
  transports: [
    new winston.transports.Console({
      handleExceptions: true, // uncaught exceptions
      handleRejections: true // unhandled promise rejections (Node 15+)
    })
  ]
})

type Level = 'debug' | 'info' | 'warn' | 'error' | 'http'

// message, stack, code and the cause chain of an Error. Error properties are not enumerable,
// so JSON.stringify would drop them and a nested cause would come out as {}.
const errorFields = (err: Error, depth = 0): Record<string, unknown> => ({
  message: err.message,
  stack: err.stack,
  ...('code' in err && { code: err.code }),
  ...(err.cause !== undefined && {
    cause: err.cause instanceof Error && depth < 5 ? errorFields(err.cause, depth + 1) : err.cause
  })
})

// Build the log entry here instead of letting winston parse the arguments: an Error meta adds
// its message, stack, code (pg SQLSTATE, Node ECONNREFUSED, …; never pg `detail`, it quotes
// row values) and cause, a plain object merges its fields, anything else (string, array,
// number) goes under `detail`. util.format placeholders (%s, %o, …) are not supported; use a
// template string for the message. The current requestId is added from AsyncLocalStorage.
const withRequestId =
  (level: Level) =>
  (message: any, ...meta: any[]): void => {
    const entry: Record<string, unknown> = {
      level,
      message: message instanceof Error ? '' : message,
      requestId: asyncLocalStorage.getStore()?.requestId
    }
    for (const value of message instanceof Error ? [message, ...meta] : meta) {
      if (value instanceof Error) {
        const { message, ...fields } = errorFields(value)
        entry.message = entry.message ? `${entry.message} ${message}` : message
        Object.assign(entry, fields)
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(entry, value)
      } else {
        entry.detail = value
      }
    }
    logger.log(entry as winston.LogEntry)
  }

export const debug = withRequestId('debug')
export const info = withRequestId('info')
export const warn = withRequestId('warn')
export const error = withRequestId('error')
export const http = withRequestId('http')
