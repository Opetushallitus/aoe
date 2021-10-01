import app from './app';
import consoleStamp from 'console-stamp';
import logger from './util/logger';
import { Server } from 'net';

// Add timestamp to console logging
consoleStamp(console, {
    format: ':date(yyyy-mm-dd HH:MM:ss)'
});

// Express server starting
if (!process.env.PORT) process.exit(1);
const PORT: number = parseInt(process.env.PORT as string, 10);
const server: Server = app.listen(PORT, () => {
    logger.info(`App is running at http://localhost:${PORT} in ${app.get('env')} mode`);
});

// Socket event handlers for the debugging purposes
// server.on('connection', (socket: Socket) => {
//     logger.debug('SOCKET OPENED: ' + JSON.stringify(socket.address()));
//     socket.on('end', () => console.log('SOCKET END: other end of the socket sends a FIN packet'));
//     socket.on('timeout', () => console.log('SOCKET TIMEOUT'));
//     socket.on('error', (error: Error) => console.log('SOCKET FAILED: ' + JSON.stringify(error)));
//     socket.on('close', (isError: boolean) => {
//         const errorObject = {error: isError};
//         logger.debug('SOCKET CLOSED: ' + JSON.stringify(errorObject));
//     });
// });

export default server;
