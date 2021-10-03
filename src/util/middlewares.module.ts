import { NextFunction, Request, Response } from 'express';
import winstonLogger from './winston-logger.module';

/**
 * Post processor middleware to handle asynchronous events right after HTTP requests.
 * @param req  Request<any>
 * @param res  Response<any>
 * @param next NextFunction
 * @see process.nextTick(callback[, ...args])
 * https://nodejs.org/dist/latest-v14.x/docs/api/process.html#process_process_nexttick_callback_args
 */
export const postHttpProcessor = (req: Request, res: Response, next: NextFunction): void => {
    const postProcess = () => {

        // Remove the event listeners to call postProcess() only once
        res.removeListener('finish', postProcess);
        res.removeListener('close', postProcess);

        // Process asynchronously right after current event loop completion
        process.nextTick(() => {
            winstonLogger.http('Post process triggered after ' + req.method + ' request on ' + req.url);
        });
    }
    res.on('finish', postProcess);
    res.on('close', postProcess);

    if (next) next();
}
