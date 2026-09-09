import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { Writable } from 'node:stream'
import type { AddressInfo } from 'node:net'
import express from 'express'
import winston from 'winston'
import { logger } from './winstonLogger.ts'
import morganLogger from './morganLogger.ts'

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
logger.level = 'http'

const app = express()
app.use(morganLogger)
app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.get('/api/v1/userdata', (_req, res) => res.json({}))
app.get('/api/v1/thing', (_req, res) => res.json({ ok: true }))
app.get('/api/v1/verify', (_req, res) => res.redirect('/'))
app.get('/api/secure/redirect', (_req, res) => res.redirect('/'))

let server: ReturnType<typeof app.listen>
let base: string
const settle = () => new Promise((resolve) => setTimeout(resolve, 50))

describe('morganLogger', () => {
  before(async () => {
    server = app.listen(0)
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })
  after(() => server.close())

  it('logs successful and failed responses at http level with duration and size', async () => {
    lines.length = 0
    await fetch(`${base}/api/v1/thing`)
    await fetch(`${base}/api/v1/missing`)
    await settle()
    const entries = lines.map((l) => JSON.parse(l) as { level: string; message: string })
    assert.equal(entries.length, 2)
    assert.equal(entries[0].level, 'http')
    assert.match(entries[0].message, /^200 GET \/api\/v1\/thing \d+\.\d+ ms \d+ /)
    assert.match(entries[1].message, /^404 GET \/api\/v1\/missing \d+\.\d+ ms /)
  })

  it('drops the query string on the email verification and OIDC callback routes only', async () => {
    lines.length = 0
    await fetch(`${base}/api/v1/verify?id=eyJhbGciOi.secret.token`, { redirect: 'manual' })
    await fetch(`${base}/api/secure/redirect?code=abc123&state=xyz`, { redirect: 'manual' })
    await fetch(`${base}/api/v1/thing?page=2`)
    await settle()
    const messages = lines.map((l) => (JSON.parse(l) as { message: string }).message)
    assert.match(messages[0], /^302 GET \/api\/v1\/verify \d/)
    assert.match(messages[1], /^302 GET \/api\/secure\/redirect \d/)
    assert.match(messages[2], /^200 GET \/api\/v1\/thing\?page=2 \d/)
    assert.equal(messages.join('\n').includes('secret'), false)
    assert.equal(messages.join('\n').includes('abc123'), false)
  })

  it('skips the health probe and the userdata poll', async () => {
    lines.length = 0
    await fetch(`${base}/health`)
    await fetch(`${base}/api/v1/userdata`)
    await settle()
    assert.deepEqual(lines, [])
  })
})
