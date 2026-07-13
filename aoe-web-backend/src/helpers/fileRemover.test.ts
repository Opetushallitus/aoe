// @ts-nocheck
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { rmDir } from './fileRemover.ts'

const makeTree = (): string => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'filerm-'))
  fs.writeFileSync(path.join(root, 'a.txt'), 'a')
  const data = path.join(root, 'sub', 'data')
  fs.mkdirSync(data, { recursive: true })
  fs.writeFileSync(path.join(data, 'b.txt'), 'b')
  return root
}

describe('rmDir', () => {
  it('empties a nested tree but keeps the root when removeSelf is false', () => {
    const root = makeTree()
    rmDir(root, false)
    assert.equal(fs.existsSync(root), true)
    assert.deepEqual(fs.readdirSync(root), [])
    fs.rmdirSync(root)
  })

  it('removes the directory itself when removeSelf is true', () => {
    const root = makeTree()
    rmDir(root, true)
    assert.equal(fs.existsSync(root), false)
  })

  it('is idempotent: re-running on an already-removed path is a no-op', () => {
    const root = makeTree()
    rmDir(root, true)
    assert.doesNotThrow(() => rmDir(root, true))
  })

  it('does not throw on a path that never existed', () => {
    const missing = path.join(os.tmpdir(), 'filerm-never-existed-4f2a')
    assert.doesNotThrow(() => rmDir(missing, true))
  })

  it('skips .nfs files and tolerates the resulting non-empty directory', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'filerm-'))
    const sub = path.join(root, 'sub')
    fs.mkdirSync(sub)
    fs.writeFileSync(path.join(sub, '.nfs0001'), 'held-open')
    fs.writeFileSync(path.join(sub, 'c.txt'), 'c')

    assert.doesNotThrow(() => rmDir(root, false))
    // Regular file removed, the .nfs file kept, and the dir left in place.
    assert.deepEqual(fs.readdirSync(sub), ['.nfs0001'])

    fs.rmSync(root, { recursive: true, force: true })
  })
})
