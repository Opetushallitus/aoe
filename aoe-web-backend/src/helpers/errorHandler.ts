import type { Request, NextFunction, Response } from 'express'
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

// Client went away mid-download (aborted S3 request or response stream closed early): resolve quietly, no 500.
export const isClientAbortError = (err: unknown): boolean => {
  const e = err as { name?: string; code?: string } | null | undefined
  return e?.name === 'AbortError' || e?.code === 'ERR_STREAM_PREMATURE_CLOSE'
}

const genericErrorMessage =
  'Palvelussamme on tällä hetkellä vikatilanne. Selvitämme ongelmaa ja korjaamme sen mahdollisimman pian.'
const genericErrorMessageEn =
  'We currently have an error that affects using the service. We will fix the problem as soon as possible.'
const genericErrorMessageSv =
  'Vi har för närvarande ett fel som påverkar användningen av tjänsten. Vi löser problemet så snart som möjligt.'

export const handleError = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.statusCode || 500
  // The logger adds the error's message, stack, code and cause chain; the request context
  // goes in as top-level fields so they are queryable in CloudWatch.
  const context = {
    statusCode,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent')
  }

  // 400/404/416 = expected client-error noise (416 = unsatisfiable byte-range on a
  // static file). AuthorizationResponseError = expected OIDC auth-flow failure
  // (e.g. NoPotentialFlow: expired/abandoned/replayed login), not a server fault.
  // -> warn (not an alert). Everything else -> error.
  const expectedClientError = err?.name === 'AuthorizationResponseError'
  if (statusCode === 400 || statusCode === 404 || statusCode === 416 || expectedClientError) {
    log.warn(err, context)
  } else {
    log.error(err, context)
  }

  // A handler that already responded (and then failed, e.g. in a follow-up update) has
  // nothing left to send; trying would throw ERR_HTTP_HEADERS_SENT inside the error handler.
  if (res.headersSent) {
    return
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
