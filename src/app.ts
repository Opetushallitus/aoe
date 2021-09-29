import * as dotenv from "dotenv";
import express from 'express';
import compression from 'compression';
import lusca from 'lusca';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
    origin: ['*'],
    methods: ['GET'],
    optionsSuccessStatus: 204,
};
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(flash());
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '1mb'}));
app.use(compression());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection);

app.set('port', 3000);
app.set('trust proxy', 1);

export default app;
