import bodyParser from 'body-parser';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import errorHandler from 'errorhandler';
import express from 'express';
import middleware from './api/middleware';
import morganHttpLogger from './util/morgan-http-logger';

import apiRouterRoot from './api/api-router-root';
import apiRouterV1 from './api/api-router-v1';

dotenv.config();

const app = express();

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
app.use('/api/v1', middleware.postHttpProcessor, apiRouterV1);
app.use('/favicon.ico', express.static('./views/favicon.ico'));
app.use(errorHandler());

export default app;
