import { describe, it, type TestContext } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { findPreviewEntry } from './archivePreviewEntry.ts'

// A fresh extracted-archive folder holding the given files.
const extractedArchive = (t: TestContext, files: string[]): string => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-entry-'))
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }))
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(folder, file)), { recursive: true })
    fs.writeFileSync(path.join(folder, file), '{}')
  }
  return folder
}

describe('findPreviewEntry', () => {
  it('returns the nested index.html of an HTML archive', (t) => {
    const folder = extractedArchive(t, ['site/index.html'])
    assert.equal(findPreviewEntry(folder), path.join(folder, 'site', 'index.html'))
  })
})
