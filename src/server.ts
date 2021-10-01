import app from './app';
import consoleStamp from 'console-stamp';
import errorHandler from 'errorhandler';
import { Server } from 'net';

// Add timestamp to console logging
consoleStamp(console, {
    format: ':date(yyyy-mm-dd HH:MM:ss)'
});

// Error Handler
app.use(errorHandler());

// Start Express Server
if (!process.env.PORT) process.exit(1);
const PORT: number = parseInt(process.env.PORT as string, 10);
const server: Server = app.listen(PORT, () => {
    console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
});

// Socket Event Handlers for debugging
// server.on('connection', (socket: Socket) => {
//     console.log('CONNECTION FROM ' + socket.remoteAddress);
//     socket.on('end', () => console.log('SOCKET END: other end of the socket sends a FIN packet'));
//     socket.on('timeout', () => console.log('SOCKET TIMEOUT'));
//     socket.on('error', (error: Error) => console.log('SOCKET ERROR: ' + JSON.stringify(error)));
//     socket.on('close', (isError: boolean) => console.log('SOCKET CLOSED. IT WAS ERROR: ' + isError));
// });

export default server;
