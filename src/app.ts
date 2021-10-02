import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from 'errorhandler';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

import logger from './util/logger';
import routerRootModule from './route/router-root.module';
import routerV1Module from './route/router-v1.module';

dotenv.config();

const app = express();

// Morgan configuration for HTTP logging
const morganHttpLogger = morgan(':status :method :url :req[accept] HTTP/:http-version :remote-addr :user-agent', {
    skip: (req: Request, res: Response) => res.statusCode < 400,
    stream: {
        write: (message: string) => logger.http(message.slice(0, -1)) // Remove \n character to avoid empty lines (bug)
    }
});

// CORS Configuration (cross-origin read only)
const corsOptions: cors.CorsOptions = {
    origin: '*',
    methods: 'GET',
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Set appliaction to operate correctly behind a proxy server (get client information from  X-Forwarded-* headers)
// app.set('trust proxy', 1);

// Root status page with Pug template
app.set('views', './views');
app.set('view engine', 'pug');

// Connected middlewares and API versions
app.use(morganHttpLogger);
app.use('/', routerRootModule);
app.use('/api/v1', routerV1Module);
app.use('/favicon.ico', express.static('./views/favicon.ico'));
app.use(errorHandler());

export default app;
