import { config } from '@/config'
import { db } from '@resource/postgresClient'
import type { TaskRun } from '@util/taskLock'
import { type SessionData, Store } from 'express-session'
import { z } from 'zod'

const sessionRowSchema = z.object({
  data: z.looseObject({
    cookie: z.looseObject({
      originalMaxAge: z.number().nullable(),
      expires: z.coerce.date().nullish()
    }),
    passport: z.object({ user: z.looseObject({ uid: z.string() }) }).optional()
  })
})

const expiresAt = (session: SessionData): Date =>
  session.cookie.expires ?? new Date(Date.now() + config.SESSION_COOKIE_OPTIONS.maxAge)

export const deleteExpiredSessions: TaskRun<void> = async (connection) => {
  await connection.none('DELETE FROM session WHERE expires_at < now()')
}

export class PostgresSessionStore extends Store {
  async get(
    sid: string,
    callback: (err: unknown, session?: SessionData | null) => void
  ): Promise<void> {
    try {
      const row = await db.oneOrNone(
        'SELECT data FROM session WHERE sid = $1 AND expires_at > now()',
        [sid]
      )
      if (!row) {
        callback(null, null)
        return
      }
      const { data } = sessionRowSchema.parse(row)
      callback(null, {
        ...data,
        cookie: { ...data.cookie, originalMaxAge: data.cookie.originalMaxAge }
      })
    } catch (err) {
      callback(err)
    }
  }

  async set(sid: string, session: SessionData, callback?: (err?: unknown) => void): Promise<void> {
    try {
      await db.none(
        `INSERT INTO session (sid, data, expires_at)
         VALUES ($1, $2:json, $3)
         ON CONFLICT (sid) DO UPDATE
           SET data = EXCLUDED.data, expires_at = EXCLUDED.expires_at, updated_at = current_timestamp`,
        [sid, session, expiresAt(session)]
      )
      callback?.()
    } catch (err) {
      callback?.(err)
    }
  }

  async destroy(sid: string, callback?: (err?: unknown) => void): Promise<void> {
    try {
      await db.none('DELETE FROM session WHERE sid = $1', [sid])
      callback?.()
    } catch (err) {
      callback?.(err)
    }
  }

  async touch(
    sid: string,
    session: SessionData,
    callback?: (err?: unknown) => void
  ): Promise<void> {
    try {
      await db.none(
        'UPDATE session SET expires_at = $2, updated_at = current_timestamp WHERE sid = $1',
        [sid, expiresAt(session)]
      )
      callback?.()
    } catch (err) {
      callback?.(err)
    }
  }
}
