import { Router, Response, Request, NextFunction } from 'express';

const apiRouterV1: Router = Router();

/**
 * API version 1.0
 */
apiRouterV1.get('/health', (req: Request, res: Response, next: NextFunction) => {

    // When HTTP header 'Accept' is present, require 'application/json' otherwise 404 Not Found
    if (req.accepts('json')) {
        res.send({operable: true});
        return next();
    }
    res.sendStatus(404);
})

export default apiRouterV1;
