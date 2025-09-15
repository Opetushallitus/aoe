import { Response } from 'express'
import winstonLogger from '@util/winstonLogger'

export class ErrorHandler extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super()
    this.statusCode = statusCode
    this.message = message
  }
}

const genericErrorMessage =
  'Palvelussamme on tällä hetkellä vikatilanne. Selvitämme ongelmaa ja korjaamme sen mahdollisimman pian. Ajankohtaisimmat tiedot Twitter-kanavallamme @aoe_suomi.'
const genericErrorMessageEn =
  'We currently have an error that affects using the service. We will fix the problem as soon as possible. Find the latest information on our Twitter channel @aoe_suomi.'
const genericErrorMessageSv =
  'Vi har för närvarande ett fel som påverkar användningen av tjänsten. Vi löser problemet så snart som möjligt. Hitta den senaste informationen på vår Twitter-kanal @aoe_suomi.'

export const handleError = (err: any, res: Response): void => {
  let { statusCode } = err
  let { message } = err
  winstonLogger.error(`Request default error handler: ${message}`)
  // send generic error message
  message = {
    fi: genericErrorMessage,
    en: genericErrorMessageEn,
    sv: genericErrorMessageSv
  }
  if (!statusCode) {
    statusCode = 500
  }
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  })
}
