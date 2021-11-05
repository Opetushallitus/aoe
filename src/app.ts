import apiRoot from './api/routes-root';
import apiV1 from './api/routes-v1';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import express, { ErrorRequestHandler, NextFunction, Request, Response, Router } from 'express';
import { morganHttpLogger, postHttpProcessor, winstonLogger } from './util';

const app = express();
const apiRouterRoot: Router = Router();
const apiRouterV1: Router = Router();
apiRoot(apiRouterRoot);
apiV1(apiRouterV1);

// CORS Configuration (cross-origin read only)
const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET',
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Set application to operate correctly behind a proxy server (get client information from X-Forwarded-* headers)
// app.set('trust proxy', 1);

// Root status page with Pug template
app.set('views', './views');
app.set('view engine', 'pug');

// HTTP request handlers
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morganHttpLogger);

// Connected API versions and custom middlewares
app.use('/', apiRouterRoot);
app.use('/api/v1', postHttpProcessor, apiRouterV1);
app.use('/favicon.ico', express.static('./views/favicon.ico'));

// Default error handler
app.use(((err: any, req: Request, res: Response, next: NextFunction) => {
    winstonLogger.error(err.stack);
    res.status(err.statusCode || 500);
    res.type('json');
    res.json({
        errors: {
            status: err.statusCode || 500,
            message: err.message || 'Unexpected error occurred'
        }
    });
    next();
}) as ErrorRequestHandler);

export default app;
