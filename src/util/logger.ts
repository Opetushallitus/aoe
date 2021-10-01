import winston, { format, Logform, Logger } from 'winston';
import * as stream from 'stream';

const logger: Logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)({
            level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
            handleExceptions: true
        })
    ],
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.printf((info: Logform.TransformableInfo) => `[${info.level.toUpperCase()}] ${info.timestamp} ${info.message}`)
    )
});

logger.stream = () => new stream.Duplex({
    write: (message: string) => {
        logger.info(message);
    }
});

export default logger;
