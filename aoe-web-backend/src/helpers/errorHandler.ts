import { Request, NextFunction, Response } from 'express'
import winstonLogger from '@util/winstonLogger'

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
  'Palvelussamme on tällä hetkellä vikatilanne. Selvitämme ongelmaa ja korjaamme sen mahdollisimman pian. Ajankohtaisimmat tiedot Twitter-kanavallamme @aoe_suomi.'
const genericErrorMessageEn =
  'We currently have an error that affects using the service. We will fix the problem as soon as possible. Find the latest information on our Twitter channel @aoe_suomi.'
const genericErrorMessageSv =
  'Vi har för närvarande ett fel som påverkar användningen av tjänsten. Vi löser problemet så snart som möjligt. Hitta den senaste informationen på vår Twitter-kanal @aoe_suomi.'

export const handleError = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  const errorDetails = {
    message: err.message,
    statusCode: err.statusCode || 500,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    stack: err.stack,
    cause: err.cause?.message,
    causeStack: err.cause?.stack
  }

  winstonLogger.error(errorDetails)

  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    statusCode,
    message: {
      fi: genericErrorMessage,
      en: genericErrorMessageEn,
      sv: genericErrorMessageSv
    }
  })
}
