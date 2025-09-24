import { Request, NextFunction, Response } from 'express'
import winstonLogger from '@util/winstonLogger'

export class StatusError extends Error {
  statusCode: number
  originalErr?: any

  constructor(statusCode: number, message: string, originalErr?: any) {
    super()
    this.statusCode = statusCode
    this.message = message
    this.originalErr = originalErr
  }
}

const genericErrorMessage =
  'Palvelussamme on tällä hetkellä vikatilanne. Selvitämme ongelmaa ja korjaamme sen mahdollisimman pian. Ajankohtaisimmat tiedot Twitter-kanavallamme @aoe_suomi.'
const genericErrorMessageEn =
  'We currently have an error that affects using the service. We will fix the problem as soon as possible. Find the latest information on our Twitter channel @aoe_suomi.'
const genericErrorMessageSv =
  'Vi har för närvarande ett fel som påverkar användningen av tjänsten. Vi löser problemet så snart som möjligt. Hitta den senaste informationen på vår Twitter-kanal @aoe_suomi.'

export const handleError = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  const { message } = err

  winstonLogger.error(message)
  winstonLogger.error(err)
  if (err.originalErr) {
    //TODO: this might be redundant but lets play it safe for now
    winstonLogger.error(err.originalErr)
  }

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
