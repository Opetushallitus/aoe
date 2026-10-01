import winston, { format } from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [new winston.transports.Console({ handleExceptions: true, handleRejections: true })]
})
