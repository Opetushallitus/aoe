import { Request, NextFunction, Response } from 'express'
import * as log from '@util/winstonLogger'

export class StatusError extends Error {
  statusCode: number
  public cause?: unknown

  constructor(statusCode: number, message: string, cause?: unknown) {
    super(message, cause ? { cause: cause as any } : undefined)

    this.name = 'StatusError'
    this.statusCode = statusCode
    this.cause = cause

    Error.captureStackTrace?.(this, StatusError)
  }
}

const genericErrorMessage =
  'Palvelussamme on tällä hetkellä vikatilanne. Selvitämme ongelmaa ja korjaamme sen mahdollisimman pian.'
const genericErrorMessageEn =
  'We currently have an error that affects using the service. We will fix the problem as soon as possible.'
const genericErrorMessageSv =
  'Vi har för närvarande ett fel som påverkar användningen av tjänsten. Vi löser problemet så snart som möjligt.'

export const handleError = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.statusCode || 500
  const errorDetails = {
    message: err.message,
    statusCode,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    stack: err.stack,
    cause: err.cause?.message,
    causeStack: err.cause?.stack
  }

  // 400/404 = expected client-error noise. AuthorizationResponseError = expected OIDC auth-flow failure
  // (e.g. NoPotentialFlow: expired/abandoned/replayed login), not a server fault.
  // -> warn (not an alert). Everything else -> error.
  const expectedClientError = err?.name === 'AuthorizationResponseError'
  if (statusCode === 400 || statusCode === 404 || expectedClientError) {
    log.warn(errorDetails)
  } else {
    log.error(errorDetails)
  }

  res.status(statusCode).json({
    statusCode,
    message: {
      fi: genericErrorMessage,
      en: genericErrorMessageEn,
      sv: genericErrorMessageSv
    }
  })
}
