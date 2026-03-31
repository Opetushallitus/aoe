// oidcConfig.ts
import { insertUserToDatabase } from '@services/authService'
import * as log from '@util/winstonLogger'
import { Express, Response, Request } from 'express'
import { Cookie } from 'express-session'
import { setTimeout as delay } from 'node:timers/promises'
import * as client from 'openid-client'
import passport from 'passport'

interface User {
  uid: string
  name: string
}

declare module 'express-session' {
  interface SessionData {
    oidcState?: string
  }
}

function createCustomFetch(timeout: number, maxRetries: number): client.CustomFetch {
  return async (url, options) => {
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch(url, {
          ...(options as RequestInit),
          signal: AbortSignal.timeout(timeout)
        })
        if (!res.ok) {
          const body = await res.clone().text()
          log.error(`OIDC fetch error: ${res.status} ${body}`)
        }
        return res
      } catch (err) {
        if (attempt < maxRetries) {
          await delay(1000 * 2 ** attempt)
          continue
        }
        throw err
      }
    }
  }
}

export async function registerOidcStrategy(app: Express) {
  const customFetch = createCustomFetch(
    Number(process.env.HTTP_OPTIONS_TIMEOUT) || 5000,
    Number(process.env.HTTP_OPTIONS_RETRY) || 2
  )

  const config = await client.discovery(
    new URL(process.env.PROXY_URI as string),
    process.env.CLIENT_ID as string,
    process.env.CLIENT_SECRET as string,
    undefined,
    {
      [client.customFetch]: customFetch,
      execute: process.env.NODE_ENV === 'development' ? [client.allowInsecureRequests] : []
    }
  )

  passport.serializeUser((user: User, done): void => done(null, user))
  passport.deserializeUser((userinfo: any, done): void => done(null, userinfo))

  app.get('/api/login', (req: Request, res: Response) => {
    const state = client.randomState()
    req.session.oidcState = state

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.CLIENT_ID as string,
      redirect_uri: process.env.REDIRECT_URI as string,
      scope: 'openid profile offline_access',
      state
    })

    const authUrl = client.buildAuthorizationUrl(config, params)
    res.redirect(authUrl.href)
  })

  app.get('/api/secure/redirect', async (req: Request, res: Response) => {
    try {
      const tokens = await client.authorizationCodeGrant(
        config,
        new URL(req.url, process.env.REDIRECT_URI),
        {
          expectedState: req.session.oidcState
        }
      )

      const claims = tokens.claims()
      if (!claims) {
        throw new Error('No ID token claims in token response')
      }

      const userinfo = await client.fetchUserInfo(config, tokens.access_token, claims.sub)
      await insertUserToDatabase(userinfo)

      const name = `${userinfo.given_name} ${userinfo.family_name}`
      const user: User = { uid: userinfo.uid as string, name }

      req.login(user, (err) => {
        if (err) {
          log.error('Login failed', err)
          return res.redirect(process.env.FAILURE_REDIRECT_URI as string)
        }
        delete req.session.oidcState
        res.redirect(process.env.SUCCESS_REDIRECT_URI as string)
      })
    } catch (err) {
      log.error('OIDC callback failed', err)
      res.redirect(process.env.FAILURE_REDIRECT_URI as string)
    }
  })

  app.post('/api/logout', (req: Request, res: Response): void => {
    const cookieRef: Cookie = req.session.cookie
    req.logout(() => {})
    req.session.destroy((error): void => {
      log.debug('Logout request /logout | session termination errors', error)
      res.clearCookie('connect.sid', {
        maxAge: -1,
        signed: cookieRef.signed,
        expires: cookieRef.expires || undefined,
        httpOnly: cookieRef.httpOnly,
        path: cookieRef.path,
        domain: cookieRef.domain,
        secure: !!cookieRef.secure,
        sameSite: cookieRef.sameSite
      })
      res.status(200).json({ message: 'logged out' })
    })
  })

  log.info('OIDC authentication initialized')
}
