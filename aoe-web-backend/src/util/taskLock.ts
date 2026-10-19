import * as log from '@util/winstonLogger'
import type { IDatabase } from 'pg-promise'
import { z } from 'zod'

export type TaskRun<T> = (
  connection: Pick<IDatabase<unknown>, 'any' | 'none'>,
  signal: AbortSignal
) => Promise<T>

const taskLockSchema = z.object({ acquired: z.boolean() })

export const runTaskWithLock = async <T>(
  database: IDatabase<unknown>,
  taskName: string,
  run: TaskRun<T>
): Promise<T | null> => {
  const controller = new AbortController()
  const connection = await database.connect({
    direct: true,
    onLost: (error) => controller.abort(error)
  })
  try {
    const { acquired } = taskLockSchema.parse(
      await connection.one(
        `SELECT pg_try_advisory_lock(hashtext('aoe-scheduled-task'), hashtext($1)) AS acquired`,
        [taskName]
      )
    )
    if (!acquired) {
      log.info(`Task ${taskName} skipped: another worker is running`)
      return null
    }
    controller.signal.throwIfAborted()
    return await run(connection, controller.signal)
  } finally {
    await connection.done()
  }
}
