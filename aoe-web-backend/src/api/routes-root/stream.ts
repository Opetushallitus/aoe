import { Request, Response, Router } from 'express'
import { z } from 'zod'

/**
 * Old streaming service URL, kept working for links outside AOE.
 * Redirects to the regular download route, which serves byte ranges.
 *
 * @param router express.Router
 */
export const stream = (router: Router): void => {
  router.get('/stream/api/v1/material/:filename', (req: Request, res: Response): void => {
    const { filename } = z.object({ filename: z.string().min(1) }).parse(req.params)
    res.redirect(301, `/api/v1/download/${encodeURIComponent(filename)}`)
  })
}
