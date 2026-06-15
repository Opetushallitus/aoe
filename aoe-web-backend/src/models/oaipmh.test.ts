import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { OaiPmhParamsSchema } from './oaipmh.ts'

describe('OaiPmhParamsSchema', () => {
  it('normalizes known verbs to OAI-PMH element casing', () => {
    assert.equal(OaiPmhParamsSchema.parse({ verb: 'identify' }).verb, 'Identify')
    assert.equal(OaiPmhParamsSchema.parse({ verb: 'LISTRECORDS' }).verb, 'ListRecords')
    assert.equal(OaiPmhParamsSchema.parse({ verb: 'listidentifiers' }).verb, 'ListIdentifiers')
  })
})
