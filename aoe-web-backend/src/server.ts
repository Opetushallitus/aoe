import dotenv from 'dotenv'

// Load the environment variables before anything else.
dotenv.config()

import { app } from './app'
import { Socket } from 'net'
import * as log from '@util/winstonLogger'

const server = app.listen(
  parseInt(process.env.PORT_LISTEN as string, 10) || 3000,
  '0.0.0.0',
  () => {
    log.info(
      `App is running at http://0.0.0.0:${process.env.PORT_LISTEN} in ${app.get('env')} mode`
    )
  }
)

// Socket event handlers for the debugging purposes.
server.on('connection', (socket: Socket) => {
  socket.setTimeout(600 * 60 * 1000)
  socket.on('timeout', () => {
    socket.end()
  })
  socket.on('error', () => {
    socket.end()
  })
})

export default server
