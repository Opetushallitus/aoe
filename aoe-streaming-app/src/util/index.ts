import morganHttpLogger from './morgan-http-logger'
import postHttpProcessor from './post-http-processor'
import winstonLogger from './winston-logger'

export { default as morganHttpLogger } from './morgan-http-logger'
export { default as postHttpProcessor } from './post-http-processor'
export { default as winstonLogger } from './winston-logger'

export default {
  morganHttpLogger,
  postHttpProcessor,
  winstonLogger
}
