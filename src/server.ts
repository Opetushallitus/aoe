// Load environment variables
import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import { Server } from 'net';
import { winstonLogger } from './util';
import { Socket } from 'net';

// Express server starting
if (!process.env.PORT) process.exit(1);
const port: number = parseInt(process.env.PORT as string, 10);
const server: Server = app.listen(port, () => {
    winstonLogger.log('info', 'App is running at http://localhost:%d in %s mode', port, app.get('env'));
});

// Socket event handlers for the debugging purposes
server.on('connection', (socket: Socket) => {
    // winstonLogger.debug('SOCKET OPENED: ' + JSON.stringify(socket.address()));
    // socket.on('end', () => console.log('SOCKET END: other end of the socket sends a FIN packet'));
    socket.on('timeout', () => {
        // winstonLogger.debug('SOCKET TIMEOUT');
        // socket.destroy();
        socket.end();
    });
    socket.on('error', () => {
        // winstonLogger.error('SOCKET ERROR: %s', JSON.stringify(error));
        // socket.destroy();
        socket.end();
    });
    // socket.on('close', (isError: boolean) => {
    //     winstonLogger.debug('SOCKET CLOSED: ' + JSON.stringify({ isError: isError }));
    // });
});

export default server;
