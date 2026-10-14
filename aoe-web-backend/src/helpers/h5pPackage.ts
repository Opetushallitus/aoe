import { readFile } from 'node:fs/promises'
import path from 'node:path'
import * as log from '@util/winstonLogger'
import { z } from 'zod'

// h5p.json stores versions as strings, library.json as numbers.
const versionSchema = z.coerce.number().int().nonnegative()

const dependencySchema = z.object({
  // Restricted to path-safe characters so a crafted package cannot point outside its folder.
  machineName: z.string().regex(/^[\w.-]+$/),
  majorVersion: versionSchema,
  minorVersion: versionSchema
})

const dependencyListSchema = z.object({
  preloadedDependencies: z.array(dependencySchema).default([])
})

type Dependency = z.infer<typeof dependencySchema>

const readPreloadedDependencies = async (jsonPath: string): Promise<Dependency[]> => {
  const json = (await readFile(jsonPath, 'utf8')).replace(/^\uFEFF/, '')
  return dependencyListSchema.parse(JSON.parse(json)).preloadedDependencies
}

const assertLibrariesPresent = async (
  packageFolder: string,
  dependencies: Dependency[],
  checkedLibraries: Set<string>
): Promise<void> => {
  for (const { machineName, majorVersion, minorVersion } of dependencies) {
    const libraryFolder = `${machineName}-${majorVersion}.${minorVersion}`
    if (checkedLibraries.has(libraryFolder)) {
      continue
    }
    checkedLibraries.add(libraryFolder)
    const libraryDependencies = await readPreloadedDependencies(
      path.join(packageFolder, libraryFolder, 'library.json')
    )
    await assertLibrariesPresent(packageFolder, libraryDependencies, checkedLibraries)
  }
}

// True when every library the extracted package needs at runtime, transitively from
// h5p.json, has a valid library.json inside the package. Editor dependencies are not
// needed for playing.
export const hasAllH5PDependencies = async (packageFolder: string): Promise<boolean> => {
  try {
    const dependencies = await readPreloadedDependencies(path.join(packageFolder, 'h5p.json'))
    await assertLibrariesPresent(packageFolder, dependencies, new Set())
    return true
  } catch (err) {
    log.info(`H5P package ${packageFolder} is not previewable`, err)
    return false
  }
}
