import winston, { format, Logform } from 'winston'
import { ConsoleTransportOptions } from 'winston/lib/winston/transports'
// Options for console logging
const logLevel: string | undefined = process.env.LOG_LEVEL
const consoleOptions: ConsoleTransportOptions = {
  level: process.env.NODE_ENV === 'production' ? logLevel || 'error' : logLevel || 'debug',
  handleExceptions: true
}

// Configuration for logging format and transports
export default winston.createLogger({
  exitOnError: false,
  format: format.combine(
    format.splat(), // Use also printf format with argument specifiers %d %s %o etc.
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.printf(
      (log: Logform.TransformableInfo) =>
        `[${log.level.toUpperCase()}] ${log.timestamp} ${log.message}`
    )
  ),
  transports: [new winston.transports.Console(consoleOptions)]
})
