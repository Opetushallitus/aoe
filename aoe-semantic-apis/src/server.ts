import dotenv from 'dotenv';
dotenv.config();
import config from './config';
import app from './app';
import { winstonLogger } from './util';

app.listen(config.APP.portListen, () => {
  winstonLogger.info('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
});
