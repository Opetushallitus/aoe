// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { Server } from 'net';
import { winstonLogger } from './util';

// Express server starting
if (!process.env.PORT) process.exit(1);
const port: number = parseInt(process.env.PORT as string, 10);
const server: Server = app.listen(port, () => {
    winstonLogger.log('info', 'App is running at http://localhost:%d in %s mode', port, app.get('env'));
});

// Socket event handlers for the debugging purposes
// server.on('connection', (socket: Socket) => {
//     winstonLogger.debug('SOCKET OPENED: ' + JSON.stringify(socket.address()));
//     socket.on('end', () => console.log('SOCKET END: other end of the socket sends a FIN packet'));
//     socket.on('timeout', () => console.log('SOCKET TIMEOUT'));
//     socket.on('error', (error: Error) => console.log('SOCKET FAILED: ' + JSON.stringify(error)));
//     socket.on('close', (isError: boolean) => {
//         const errorObject = {error: isError};
//         winstonLogger.debug('SOCKET CLOSED: ' + JSON.stringify(errorObject));
//     });
// });

export default server;
