import { describe, it, type TestContext } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { hasAllH5PDependencies } from './h5pPackage.ts'

type Library = { folder: string; dependencies: string[] }

const makeTemporaryDirectory = (t: TestContext): string => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'h5p-'))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  return directory
}

// 'H5P.Question-1.4' -> { machineName: 'H5P.Question', majorVersion: 1, minorVersion: 4 }
const dependency = (folder: string) => {
  const [machineName, version] = folder.split('-')
  const [majorVersion, minorVersion] = version.split('.')
  return { machineName, majorVersion: Number(majorVersion), minorVersion: Number(minorVersion) }
}

const writeJson = (file: string, value: unknown, prefix = ''): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, prefix + JSON.stringify(value))
}

// h5p.json lists versions as strings, library.json as numbers, like real exports do. Every
// library also lists an editor dependency that is never shipped, so a package that passes
// proves editor dependencies are not required for playing.
const makePackage = (
  t: TestContext,
  h5pJsonDependencies: string[],
  libraries: Library[],
  h5pJsonPrefix = ''
): string => {
  const root = makeTemporaryDirectory(t)
  const preloadedDependencies = h5pJsonDependencies.map((folder) => {
    const { machineName, majorVersion, minorVersion } = dependency(folder)
    return { machineName, majorVersion: `${majorVersion}`, minorVersion: `${minorVersion}` }
  })
  writeJson(path.join(root, 'h5p.json'), { preloadedDependencies }, h5pJsonPrefix)
  for (const { folder, dependencies } of libraries) {
    writeJson(path.join(root, folder, 'library.json'), {
      ...dependency(folder),
      preloadedDependencies: dependencies.map(dependency),
      editorDependencies: [dependency('H5PEditor.NotShipped-1.0')]
    })
  }
  return root
}

describe('hasAllH5PDependencies', () => {
  // The timeout turns a regression in cycle handling into a failure instead of a hung run.
  it('accepts a complete package with a dependency cycle, ignoring editor dependencies', {
    timeout: 5000
  }, async (t) => {
    const root = makePackage(
      t,
      ['H5P.Main-1.2'],
      [
        { folder: 'H5P.Main-1.2', dependencies: ['H5P.Question-1.4'] },
        { folder: 'H5P.Question-1.4', dependencies: ['H5P.JoubelUI-1.3'] },
        { folder: 'H5P.JoubelUI-1.3', dependencies: ['H5P.Question-1.4'] }
      ]
    )
    assert.equal(await hasAllH5PDependencies(root), true)
  })

  it('accepts an h5p.json that starts with a byte order mark', async (t) => {
    const root = makePackage(
      t,
      ['H5P.Main-1.2'],
      [{ folder: 'H5P.Main-1.2', dependencies: [] }],
      '\uFEFF'
    )
    assert.equal(await hasAllH5PDependencies(root), true)
  })

  it('rejects a package missing a library needed only by another library', async (t) => {
    const root = makePackage(
      t,
      ['H5P.Main-1.2'],
      [{ folder: 'H5P.Main-1.2', dependencies: ['H5P.WordCloud-0.1'] }]
    )
    assert.equal(await hasAllH5PDependencies(root), false)
  })

  // The planted library.json makes the traversal resolve to a valid library, so only the
  // machineName check can make this fail.
  it('rejects a dependency name that would resolve outside the package', async (t) => {
    const parent = makeTemporaryDirectory(t)
    const root = path.join(parent, 'package')
    writeJson(path.join(root, 'h5p.json'), {
      preloadedDependencies: [{ machineName: '../outside', majorVersion: '1', minorVersion: '0' }]
    })
    writeJson(path.join(parent, 'outside-1.0', 'library.json'), {})
    assert.equal(await hasAllH5PDependencies(root), false)
  })
})
