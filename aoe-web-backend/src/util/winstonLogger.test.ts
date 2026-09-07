import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Writable } from 'node:stream'
import { globSync, readFileSync } from 'node:fs'
import winston from 'winston'
import { asyncLocalStorage } from '@/asyncLocalStorage'
import * as log from './winstonLogger.ts'

// Capture JSON lines instead of printing them to the console.
const lines: string[] = []
log.logger.transports.forEach((transport) => {
  transport.silent = true
})
log.logger.add(
  new winston.transports.Stream({
    stream: new Writable({
      write(chunk, _encoding, callback) {
        lines.push(chunk.toString())
        callback()
      }
    })
  })
)
log.logger.level = 'debug'

const lastEntry = (): Record<string, unknown> => JSON.parse(lines[lines.length - 1])

describe('winstonLogger meta handling', () => {
  beforeEach(() => {
    lines.length = 0
  })

  it('keeps a string meta readable under "detail" instead of exploding it into "0","1",…', () => {
    log.error('Redis down', 'connection refused')
    const entry = lastEntry()
    assert.equal(entry.message, 'Redis down')
    assert.equal(entry.detail, 'connection refused')
    assert.equal('0' in entry, false)
  })

  it('keeps an array meta as an array under "detail"', () => {
    log.debug('insertCollection: SELECT 1', ['alice', 'my collection'])
    const entry = lastEntry()
    assert.deepEqual(entry.detail, ['alice', 'my collection'])
    assert.equal('0' in entry, false)
  })

  it('still merges a plain object meta into the entry', () => {
    log.info('indexed', { count: 3, index: 'aoe' })
    const entry = lastEntry()
    assert.equal(entry.count, 3)
    assert.equal(entry.index, 'aoe')
  })

  it('still extracts message and stack from an Error meta', () => {
    const err = new Error('boom')
    log.error('Saving failed', err)
    const entry = lastEntry()
    assert.equal(entry.message, 'Saving failed boom')
    assert.match(String(entry.stack), /^Error: boom/)
  })

  it('keeps the code of an Error meta (pg SQLSTATE, Node system errors)', () => {
    const pgError = Object.assign(
      new Error('duplicate key value violates unique constraint "users_pkey"'),
      {
        code: '23505',
        detail: 'Key (username)=(alice) already exists.'
      }
    )
    log.error('Saving a new user failed', pgError)
    const entry = lastEntry()
    assert.equal(entry.code, '23505')
    assert.equal('detail' in entry, false)
  })

  it('serialises the cause chain of an Error meta', () => {
    const root = Object.assign(new Error('connection refused'), { code: 'ECONNREFUSED' })
    const wrapped = new Error('Fetching reference data failed', { cause: root })
    log.error('Scheduled job failed', wrapped)
    const entry = lastEntry()
    assert.equal(entry.message, 'Scheduled job failed Fetching reference data failed')
    assert.match(String(entry.stack), /^Error: Fetching reference data failed/)
    assert.deepEqual(entry.cause, {
      message: 'connection refused',
      stack: root.stack,
      code: 'ECONNREFUSED'
    })
  })

  it('keeps a non-Error cause as it is', () => {
    const wrapped = new Error('Parsing failed', { cause: 'unexpected token' })
    log.error('Import failed', wrapped)
    assert.equal(lastEntry().cause, 'unexpected token')
  })

  it('treats an Error passed as the message like an Error meta', () => {
    const root = new Error('disk full')
    const err = Object.assign(new Error('Write failed', { cause: root }), { code: 'ENOSPC' })
    log.error(err)
    const entry = lastEntry()
    assert.equal(entry.message, 'Write failed')
    assert.match(String(entry.stack), /^Error: Write failed/)
    assert.equal(entry.code, 'ENOSPC')
    assert.deepEqual(entry.cause, { message: 'disk full', stack: root.stack })
  })

  it('does not let a meta object override level, message or requestId', () => {
    asyncLocalStorage.run({ requestId: 'req-7' }, () => {
      log.debug('headers', { level: 'error', message: 'spoofed', requestId: 'x', host: 'aoe.fi' })
    })
    const entry = lastEntry()
    assert.equal(entry.level, 'debug')
    assert.equal(entry.message, 'headers')
    assert.equal(entry.requestId, 'req-7')
    assert.equal(entry.host, 'aoe.fi')
  })

  it('does not support util.format placeholders: the meta is kept as detail', () => {
    log.error('Upstream failed for %s', 'file.pdf')
    const entry = lastEntry()
    assert.equal(entry.message, 'Upstream failed for %s')
    assert.equal(entry.detail, 'file.pdf')
  })

  it('adds the requestId from AsyncLocalStorage', () => {
    asyncLocalStorage.run({ requestId: 'req-42' }, () => {
      log.warn('inside request')
    })
    assert.equal(lastEntry().requestId, 'req-42')
  })
})

describe('winstonLogger call sites', () => {
  it('use template strings instead of util.format placeholders', () => {
    // The wrapper no longer runs winston's splat format, so '%s' / '%o' would be logged literally.
    const placeholderCall =
      /\b(log|logger|winstonLogger)\.(debug|info|warn|error|http)\(\s*(['"`])(?:(?!\3)[^\\]|\\.)*?%[sdifjoOc]/g
    const offenders = globSync('src/**/*.ts')
      .filter((file) => !file.endsWith('.test.ts'))
      .flatMap((file) => {
        const source = readFileSync(file, 'utf8')
        return [...source.matchAll(placeholderCall)].map(
          (match) => `${file}:${source.slice(0, match.index).split('\n').length}`
        )
      })
    assert.deepEqual(offenders, [])
  })
})
