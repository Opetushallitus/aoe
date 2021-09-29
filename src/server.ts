import consoleStamp from 'console-stamp';
import errorHandler from 'errorhandler';
import app from './app';

/**
 * Add timestamp to console logging.
 */
consoleStamp(console, {
    format: ':date(yyyy-mm-dd HH:MM:ss)',
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
if (!process.env.PORT) process.exit(1);
const PORT: number = parseInt(process.env.PORT as string, 10);
const server = app.listen(PORT, () => {
    console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
});

/**
 * Socket timeout.
 */
server.on('connection', (socket) => {
    socket.setTimeout(600 * 60 * 1000);
});

export default server;
