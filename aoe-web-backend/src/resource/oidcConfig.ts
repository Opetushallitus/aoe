// oidcConfig.ts
import { insertUserToDatabase } from '@services/authService'
import * as log from '@util/winstonLogger'
import { Express, Response, Request } from 'express'
import { Cookie } from 'express-session'
import { setTimeout as delay } from 'node:timers/promises'
import * as client from 'openid-client'
import { Strategy } from 'openid-client/passport'
import passport from 'passport'

interface User {
  uid: string
  name: string
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
          const errorObject = {
            status: res.status,
            statusText: res.statusText,
            url,
            body
          }
          log.error(`OIDC client fetch error: `, errorObject)
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

  passport.use(
    'oidc',
    new Strategy(
      {
        config,
        scope: 'openid profile offline_access',
        callbackURL: process.env.REDIRECT_URI
      },
      async (tokens, done) => {
        try {
          const claims = tokens.claims()
          if (!claims) {
            return done(new Error('No ID token claims in token response'))
          }
          const userinfo = await client.fetchUserInfo(config, tokens.access_token, claims.sub)
          await insertUserToDatabase(userinfo)
          const name = `${userinfo.given_name} ${userinfo.family_name}`
          return done(null, { uid: userinfo.uid, name })
        } catch (err) {
          log.error('Saving user information failed', err)
          return done(err)
        }
      }
    )
  )

  passport.serializeUser((user: User, done): void => done(null, user))
  passport.deserializeUser((userinfo: any, done): void => done(null, userinfo))

  app.get(
    '/api/login',
    passport.authenticate('oidc', {
      successRedirect: '/',
      failureRedirect: '/api/login',
      failureFlash: true
    })
  )

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

  app.get(
    '/api/secure/redirect',
    passport.authenticate('oidc', {
      failureRedirect: process.env.FAILURE_REDIRECT_URI,
      failureFlash: true,
      successRedirect: process.env.SUCCESS_REDIRECT_URI
    })
  )

  log.info('OIDC authentication initialized')
}
