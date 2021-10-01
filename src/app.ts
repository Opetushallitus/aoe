import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import router from './router/router';

dotenv.config();

const app = express();

// CORS Configuration
const corsOptions: cors.CorsOptions = {
    origin: '*',
    methods: 'GET',
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

app.set('port', 3000);
app.set('trust proxy', 1);
app.set('views', './views');
app.set('view engine', 'pug');

app.use('/', router);
app.use("/favicon.ico", express.static('./views/favicon.ico'));

export default app;
