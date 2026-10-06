import type { NextFunction, Request, Response } from 'express'

export const h5pSecurityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader(
    'Content-Security-Policy',
    'sandbox allow-scripts allow-popups allow-forms allow-fullscreen'
  )
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
}
