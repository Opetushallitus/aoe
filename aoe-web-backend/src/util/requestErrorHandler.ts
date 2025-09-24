import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

export default async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ 
        errors: result.formatWith(error => error.msg).array() 
    })
  }
  next()
}
