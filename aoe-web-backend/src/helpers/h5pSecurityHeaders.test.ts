import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import type { NextFunction, Request, Response } from 'express'
import { h5pSecurityHeaders } from './h5pSecurityHeaders.ts'

const makeRes = () => {
  const headers: Record<string, string> = {}
  const res = { setHeader: (k: string, v: string) => (headers[k] = v) } as unknown as Response
  return { res, headers }
}

describe('h5pSecurityHeaders', () => {
  it('sandboxes the response into an opaque origin and never grants same-origin', () => {
    const { res, headers } = makeRes()
    let nextCalled = false
    h5pSecurityHeaders({} as Request, res, (() => (nextCalled = true)) as NextFunction)
    assert.equal(
      headers['Content-Security-Policy'],
      'sandbox allow-scripts allow-popups allow-forms allow-fullscreen'
    )
    assert.ok(!headers['Content-Security-Policy'].includes('allow-same-origin'))
    assert.equal(nextCalled, true)
  })

  it('also blocks MIME sniffing', () => {
    const { res, headers } = makeRes()
    h5pSecurityHeaders({} as Request, res, (() => {}) as NextFunction)
    assert.equal(headers['X-Content-Type-Options'], 'nosniff')
  })
})
