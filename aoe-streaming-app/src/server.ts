// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import { Server } from 'net'
import { winstonLogger } from './util'
import { Socket } from 'net'

// Express server starting
if (!process.env.PORT) {
  process.exit(1)
}
const port: number = parseInt(process.env.PORT as string, 10)
const server: Server = app.listen(port, () => {
  winstonLogger.log(
    'info',
    'App is running at http://localhost:%d in %s mode',
    port,
    app.get('env')
  )
})

// Socket event handlers for the debugging purposes
server.on('connection', (socket: Socket) => {
  socket.on('timeout', () => {
    socket.end()
  })
  socket.on('error', () => {
    socket.end()
  })
})

export default server
