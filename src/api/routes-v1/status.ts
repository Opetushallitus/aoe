import { Router, Response, Request, NextFunction } from 'express';

/**
 * API version 1.0
 */
export default (router: Router): void => {
    router.get('/status', (req: Request, res: Response, next: NextFunction) => {

        // When HTTP header 'Accept' is present, require 'application/json' otherwise 404 Not Found
        if (req.accepts('json')) {
            res.send({ operable: true });
            return next();
        }
        res.sendStatus(404);
    })
}
