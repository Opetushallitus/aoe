import { describe, it, type TestContext } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { findPreviewEntry, isH5PArchive } from './archivePreviewEntry.ts'

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
  it('returns the package folder of an H5P package with h5p.json', (t) => {
    const folder = extractedArchive(t, ['h5p.json', 'content/index.html'])
    assert.equal(findPreviewEntry(folder, true), folder)
  })

  it('returns index.html of an HTML archive even when it also holds h5p.json', (t) => {
    const folder = extractedArchive(t, ['h5p.json', 'site/index.html'])
    assert.equal(findPreviewEntry(folder, false), path.join(folder, 'site', 'index.html'))
  })

  it('returns false for an H5P package without h5p.json, even with an index.html', (t) => {
    const folder = extractedArchive(t, ['index.html'])
    assert.equal(findPreviewEntry(folder, true), false)
  })
})

describe('isH5PArchive', () => {
  it('tells .h5p keys from .zip keys', () => {
    assert.equal(isH5PArchive('Crossword-1.h5p'), true)
    assert.equal(isH5PArchive('Site-1.zip'), false)
  })
})
