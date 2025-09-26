import * as log from '@util/winstonLogger'
import { db } from '@resource/postgresClient'

export const getEdumaterialVersionsWithoutURN = async (limit: number): Promise<any> => {
  try {
    return await db.task(async (t: any) => {
      const query =
        'SELECT educationalmaterialid, publishedat ' +
        'FROM educationalmaterialversion ' +
        'WHERE urn IS NULL ' +
        'ORDER BY educationalmaterialid ' +
        'LIMIT $1'
      return await t.any(query, [limit])
    })
  } catch (err) {
    log.error(`Request for educational material versions without PID failed`, err)
    throw err
  }
}
