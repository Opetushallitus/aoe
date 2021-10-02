import { Router, Response, Request, NextFunction } from 'express';

const routerV1Module: Router = Router();

/**
 * API version 1.0
 */
routerV1Module.get('/health', (req: Request, res: Response, next: NextFunction) => {
    // When HTTP header 'Accept' is present, require 'application/json' otherwise response 404 Not Found
    if (req.accepts('json')) {
        res.send({operable: true});
        return next();
    }
    res.sendStatus(404);
})

export default routerV1Module;
