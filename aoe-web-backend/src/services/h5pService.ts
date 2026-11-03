import { config } from '@/config'
import { errnoCode } from '@/helpers/fileRemover'
import {
  fs,
  fsImplementations,
  H5PConfig,
  H5PEditor,
  H5PPlayer,
  IUser
} from '@lumieducation/h5p-server'
import * as log from '@util/winstonLogger'
import { cp, mkdir, mkdtemp, readdir, rename, rm } from 'node:fs/promises'
import path from 'path'

let h5pConfig: H5PConfig
let h5pEditor: H5PEditor
let h5pPlayer: H5PPlayer

const installBundledLibrary = async (library: string, stagingRoot: string): Promise<void> => {
  const staged = path.join(stagingRoot, library)
  await cp(path.join(config.MEDIA_FILE_PROCESS.h5pPathBundledLibraries, library), staged, {
    recursive: true
  })
  try {
    await rename(staged, path.join(config.MEDIA_FILE_PROCESS.h5pPathLibraries, library))
  } catch (err) {
    const code = errnoCode(err)
    if (code !== 'ENOTEMPTY' && code !== 'EEXIST') {
      throw err
    }
  }
}

const seedLibraries = async (): Promise<void> => {
  const libraries = config.MEDIA_FILE_PROCESS.h5pPathLibraries
  const bundledOnly = [
    path.basename(config.MEDIA_FILE_PROCESS.h5pPathCore),
    path.basename(config.MEDIA_FILE_PROCESS.h5pPathEditor)
  ]
  await mkdir(libraries, { recursive: true })
  const installed = await readdir(libraries)
  const bundled = await readdir(config.MEDIA_FILE_PROCESS.h5pPathBundledLibraries)
  const missing = bundled.filter(
    (library) => !bundledOnly.includes(library) && !installed.includes(library)
  )
  if (missing.length === 0) {
    return
  }
  const stagingRoot = await mkdtemp(path.join(path.dirname(libraries), 'libraries-seed-'))
  try {
    for (const library of missing) {
      await installBundledLibrary(library, stagingRoot)
    }
  } finally {
    await rm(stagingRoot, { recursive: true, force: true })
  }
  log.info(`Seeded ${missing.length} bundled H5P libraries into ${libraries}`)
}

/**
 * Initialize H5P editor and player with a JSON configuration file and static library content.
 * @return {Promise<void>}
 */
export const initializeH5P = async (): Promise<void> => {
  try {
    await seedLibraries()
    h5pConfig = new H5PConfig(
      new fsImplementations.JsonStorage(
        path.resolve(config.MEDIA_FILE_PROCESS.h5pJsonConfiguration)
      ),
      {
        installLibraryLockMaxOccupationTime: 120_000,
        installLibraryLockTimeout: 180_000
      }
    )
    await h5pConfig.load()
    h5pEditor = fs(
      h5pConfig,
      path.resolve(config.MEDIA_FILE_PROCESS.h5pPathLibraries),
      path.resolve(config.MEDIA_FILE_PROCESS.h5pPathTemporaryStorage),
      path.resolve(config.MEDIA_FILE_PROCESS.h5pPathContent)
    )
    h5pPlayer = new H5PPlayer(h5pEditor.libraryStorage, h5pEditor.contentStorage, h5pConfig)
  } catch (err: unknown) {
    log.error('Initialization of H5P editor failed', err)
  }
}

// Anonymous user applied for unauthenticated client users.
export const userH5P: IUser = {
  email: config.MEDIA_FILE_PROCESS.h5pUserEmail,
  id: 'anonymous',
  name: 'anonymous',
  type: 'local'
}
