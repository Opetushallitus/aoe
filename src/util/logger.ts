import winston, { format, Logform, Logger } from 'winston';

const logger: Logger = winston.createLogger({
    exitOnError: false,
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.printf((info: Logform.TransformableInfo) => `[${info.level.toUpperCase()}] ${info.timestamp} ${info.message}`)
    ),
    transports: [
        new (winston.transports.Console)({
            level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
            handleExceptions: true
        })
    ]
});

export default logger;
