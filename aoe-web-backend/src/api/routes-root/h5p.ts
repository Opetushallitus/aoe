import { db } from '@resource/postgresClient'
import { Router } from 'express'
import { Request, Response } from 'express'
import { z } from 'zod'

const playParams = z.object({ keyS3: z.string() })
// The strict files/<record-id>/<sha256>/ format keeps the prefix safe to inline in the page script.
const extraction = z.object({ prefix: z.string().regex(/^files\/\d+\/[0-9a-f]{64}\/$/) }).nullable()
const PLAYER_PATH = '/assets/h5p-standalone'

/**
 * Root level Open API for H5P interactive web materials.
 * Sessions and cookies are not created.
 *
 * @param router express.Router
 */
export const h5p = (router: Router): void => {
  const moduleRoot = '/h5p'

  router.get(`${moduleRoot}/play/:keyS3`, async (req: Request, res: Response): Promise<void> => {
    const { keyS3 } = playParams.parse(req.params)
    const row = extraction.parse(
      await db.oneOrNone(
        `SELECT e.s3_object_prefix AS prefix
         FROM record r
         JOIN file_preview e
           ON e.record_id = r.id AND e.source_file_key = r.filekey
           AND e.success AND e.s3_object_prefix IS NOT NULL
         WHERE r.filekey = $1
         LIMIT 1`,
        [keyS3]
      )
    )
    if (!row) {
      res.sendStatus(404)
      return
    }
    // The player appends package file paths with a slash.
    const h5pJsonPath = `/${row.prefix.slice(0, -1)}`
    res.send(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>H5P</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0}</style>
<script src="${PLAYER_PATH}/main.bundle.js"></script>
</head>
<body>
<div id="h5p"></div>
<script>
new H5PStandalone.H5P(document.getElementById('h5p'), {
  h5pJsonPath: ${JSON.stringify(h5pJsonPath)},
  frameJs: '${PLAYER_PATH}/frame.bundle.js',
  frameCss: '${PLAYER_PATH}/styles/h5p.css'
})
</script>
</body>
</html>
`)
  })
}
