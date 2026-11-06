import { db } from '@resource/postgresClient'
import { Request, Response, Router } from 'express'
import { z } from 'zod'

const contentParams = z.object({ folder: z.string(), rest: z.array(z.string()).default([]) })
const preview = z.object({ prefix: z.string().regex(/^files\/\d+\/[0-9a-f]{64}\/$/) }).nullable()

/**
 * Redirects saved links to the retired EFS preview folders, /content/<file key minus .zip>/...,
 * to the same path under the file's S3 preview prefix.
 *
 * @param router express.Router
 */
export const content = (router: Router): void => {
  router.get('/content/:folder{/*rest}', async (req: Request, res: Response): Promise<void> => {
    const { folder, rest } = contentParams.parse(req.params)
    const row = preview.parse(
      await db.oneOrNone(
        `SELECT s3_object_prefix AS prefix
         FROM file_preview
         WHERE source_file_key = $1 AND success AND s3_object_prefix IS NOT NULL
         LIMIT 1`,
        [`${folder}.zip`]
      )
    )
    if (!row) {
      res.sendStatus(404)
      return
    }
    res.redirect(302, `/${row.prefix}${rest.map(encodeURIComponent).join('/')}`)
  })
}
