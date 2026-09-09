import morgan from 'morgan'
import type { Request, Response } from 'express'
import * as log from '@util/winstonLogger'

// Two routes carry secrets in the query string: the OIDC callback (code, state; the path is
// fixed in oidcConfig.ts) and the email verification link (a JWT). Log only the path for
// those.
const PATHS_WITHOUT_QUERY = new Set(['/api/secure/redirect', '/api/v1/verify'])
morgan.token('url', (req: Request) =>
  PATHS_WITHOUT_QUERY.has(req.path) ? req.path : req.originalUrl || req.url
)

// One line per response at the http level, with duration and size. Skipped: the load
// balancer health probe (every 5 s, says nothing) and the frequent userdata poll.
export default morgan(
  ':status :method :url :response-time ms :res[content-length] :req[accept] HTTP/:http-version :remote-addr :user-agent',
  {
    skip: (req: Request, _res: Response): boolean => {
      const { path, method }: { path: string; method: string } = req
      if (path === '/health') {
        return true
      }
      return /\/userdata$/.test(path) && method === 'GET'
    },
    stream: {
      write: (message: string) => log.http(message.slice(0, -1)) // Remove last character \n to avoid empty lines
    }
  }
)
