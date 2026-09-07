import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Writable } from 'node:stream'
import type { Request, Response, NextFunction } from 'express'
import winston from 'winston'
import { logger } from '@util/winstonLogger'
import { handleError, StatusError } from './errorHandler.ts'

// Capture JSON lines instead of printing them to the console.
const lines: string[] = []
logger.transports.forEach((transport) => {
  transport.silent = true
})
logger.add(
  new winston.transports.Stream({
    stream: new Writable({
      write(chunk, _encoding, callback) {
        lines.push(chunk.toString())
        callback()
      }
    })
  })
)
const lastEntry = (): Record<string, unknown> => JSON.parse(lines[lines.length - 1])

const req = {
  method: 'POST',
  url: '/api/v1/collection/create',
  get: (header: string) => (header === 'User-Agent' ? 'test-agent' : undefined)
} as unknown as Request

const fakeRes = () => {
  const res = { statusCode: 0, body: undefined as unknown }
  return Object.assign(res, {
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.body = body
      return res
    }
  }) as unknown as Response & { statusCode: number; body: unknown }
}
const next = (() => {}) as NextFunction

describe('handleError', () => {
  beforeEach(() => {
    lines.length = 0
  })

  it('logs a 500 at error level with request context and the cause chain as top-level fields', () => {
    const pgError = Object.assign(new Error('duplicate key value violates unique constraint'), {
      code: '23505'
    })
    handleError(new StatusError(500, 'Issue creating collection', pgError), req, fakeRes(), next)
    const entry = lastEntry()
    assert.equal(entry.level, 'error')
    assert.equal(entry.message, 'Issue creating collection')
    assert.equal(entry.statusCode, 500)
    assert.equal(entry.method, 'POST')
    assert.equal(entry.url, '/api/v1/collection/create')
    assert.equal(entry.userAgent, 'test-agent')
    assert.match(String(entry.stack), /^StatusError: Issue creating collection/)
    assert.deepEqual(entry.cause, {
      message: 'duplicate key value violates unique constraint',
      stack: pgError.stack,
      code: '23505'
    })
  })

  it('logs expected client errors at warn level', () => {
    handleError(new StatusError(404, 'Not found'), req, fakeRes(), next)
    assert.equal(lastEntry().level, 'warn')
    assert.equal(lastEntry().statusCode, 404)

    const oidcError = Object.assign(new Error('NoPotentialFlow'), {
      name: 'AuthorizationResponseError'
    })
    handleError(oidcError, req, fakeRes(), next)
    assert.equal(lastEntry().level, 'warn')
    assert.equal(lastEntry().statusCode, 500)
  })

  it('logs but does not respond again when the response was already sent', () => {
    const res = fakeRes()
    ;(res as unknown as { headersSent: boolean }).headersSent = true
    handleError(new StatusError(500, 'Average update failed'), req, res, next)
    assert.equal(lastEntry().message, 'Average update failed')
    assert.equal(res.statusCode, 0)
  })

  it('responds with the status code and the generic trilingual message', () => {
    const res = fakeRes()
    handleError(new StatusError(503, 'Upstream down'), req, res, next)
    assert.equal(res.statusCode, 503)
    const body = res.body as { statusCode: number; message: Record<string, string> }
    assert.equal(body.statusCode, 503)
    assert.deepEqual(Object.keys(body.message), ['fi', 'en', 'sv'])
    assert.equal(body.message.en.includes('Upstream down'), false)
  })
})
