import cors from 'cors';
import dotenv from 'dotenv';
import errorHandler from 'errorhandler';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

import logger from './util/logger';
import router from './route/router';

dotenv.config();

const app = express();

// Morgan configuration for HTTP logging
const morganMiddleware = morgan("combined", {
    skip: (req: Request, res: Response) => res.statusCode < 400,
    stream: {
        write: (message: string) => logger.http(message)
    }
});

// CORS Configuration
const corsOptions: cors.CorsOptions = {
    origin: '*',
    methods: 'GET',
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// app.set('port', 3000);
// app.set('trust proxy', 1);
app.set('views', './views');
app.set('view engine', 'pug');

app.use('/', router);
app.use("/favicon.ico", express.static('./views/favicon.ico'));
app.use(errorHandler());
app.use(morganMiddleware);

export default app;
