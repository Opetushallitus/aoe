import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import errorHandler from 'errorhandler';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

import { postHttpProcessor } from './util/middlewares.module';
import winstonLogger from './util/winston-logger.module';
import apiRouterRoot from './api/api-root.module';
import apiRouterV1 from './api/api-v1.module';

dotenv.config();

const app = express();

// Morgan configuration for HTTP logging
const morganHttpLogger = morgan(':status :method :url :req[accept] HTTP/:http-version :remote-addr :user-agent', {
    skip: (req: Request, res: Response) => res.statusCode < 400,
    stream: {
        write: (message: string) => winstonLogger.http(message.slice(0, -1)) // Remove last character \n to avoid empty lines
    }
});

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

// Connected middlewares and API versions
app.use(morganHttpLogger);
// app.use(httpPostProcessor);
app.use('/', apiRouterRoot);
app.use('/api/v1', postHttpProcessor, apiRouterV1);
app.use('/favicon.ico', express.static('./views/favicon.ico'));
app.use(errorHandler());

export default app;
