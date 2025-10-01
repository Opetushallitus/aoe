// oidcConfig.ts
import { insertUserToDatabase } from '@services/authService'
import * as log from '@util/winstonLogger'
import { Express, Response, Request } from 'express'
import { Cookie } from 'express-session'
import openidClient, {
  Client,
  custom,
  HttpOptions,
  TokenSet,
  UserinfoResponse
} from 'openid-client'
import passport from 'passport'

const { Issuer, Strategy } = openidClient

interface User {
  uid: string
  name: string
}

export async function registerOidcStrategy(app: Express) {
  // set global client options
  custom.setHttpOptionsDefaults({
    timeout: Number(process.env.HTTP_OPTIONS_TIMEOUT) || 5000,
    retry: Number(process.env.HTTP_OPTIONS_RETRY) || 2
  } as HttpOptions)

  // Discover issuer from OIDC provider
  const oidcIssuer = await Issuer.discover(process.env.PROXY_URI as string)
  const client: Client = new oidcIssuer.Client({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: [process.env.REDIRECT_URI],
    response_types: ['code']
  })

  // Register the OIDC strategy
  passport.use(
    'oidc',
    new Strategy(
      { client },
      async (
        _tokenset: TokenSet,
        userinfo: UserinfoResponse,
        done: (err: any, user?: User) => void
      ) => {
        try {
          await insertUserToDatabase(userinfo)
          const name = `${userinfo.given_name} ${userinfo.family_name}`
          return done(null, { uid: userinfo.uid as string, name })
        } catch (err) {
          log.error('Saving user information failed', err)
          return done(err)
        }
      }
    )
  )

  passport.serializeUser((user: User, done): void => done(null, user))
  passport.deserializeUser((userinfo: any, done): void => done(null, userinfo))

  // Attach login route AFTER strategy is ready
  app.get(
    '/api/login',
    passport.authenticate('oidc', {
      successRedirect: '/',
      failureRedirect: '/api/login',
      failureFlash: true,
      scope: 'openid profile offline_access'
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
