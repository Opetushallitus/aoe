import { config } from '@/config'
import { isClientAbortError } from '@/helpers/errorHandler'
import { H5PUploadResult } from '@aoe/services/h5pService'
import {
  fs,
  fsImplementations,
  H5PConfig,
  H5PEditor,
  H5PPlayer,
  ILibraryName,
  IUser,
  LibraryName
} from '@lumieducation/h5p-server'
import { downloadToTemporaryFile } from '@query/fileHandling'
import * as log from '@util/winstonLogger'
import { Request, Response } from 'express'
import { rm } from 'node:fs/promises'
import path from 'path'

let h5pConfig: H5PConfig
let h5pEditor: H5PEditor
let h5pPlayer: H5PPlayer

const renderedContent = new Map<string, string>()

export const clearH5PContentCache = (): void => {
  renderedContent.clear()
}

/**
 * Initialize H5P editor and player with a JSON configuration file and static library content.
 * @return {Promise<void>}
 */
export const initializeH5P = async (): Promise<void> => {
  h5pConfig = new H5PConfig(
    new fsImplementations.JsonStorage(path.resolve(config.MEDIA_FILE_PROCESS.h5pJsonConfiguration))
  )
  await h5pConfig.load()
  h5pEditor = fs(
    h5pConfig,
    path.resolve(config.MEDIA_FILE_PROCESS.h5pPathLibraries),
    path.resolve(config.MEDIA_FILE_PROCESS.h5pPathTemporaryStorage),
    path.resolve(config.MEDIA_FILE_PROCESS.h5pPathContent)
  )
  h5pPlayer = new H5PPlayer(h5pEditor.libraryStorage, h5pEditor.contentStorage, h5pConfig)
}

// Anonymous user applied for unauthenticated client users.
export const userH5P: IUser = {
  email: config.MEDIA_FILE_PROCESS.h5pUserEmail,
  id: 'anonymous',
  name: 'anonymous',
  type: 'local'
}

/**
 * Download and prepare compressed H5P media to run as an application.
 * @param {e.Request} req
 * @param {e.Response} res
 * @return {Promise<any>}
 */
export const downloadAndRenderH5P = async (req: Request, res: Response): Promise<string | any> => {
  const keyS3: string = req.params.keyS3

  const cachedContentId: string | undefined = renderedContent.get(keyS3)
  if (cachedContentId) {
    try {
      const htmlH5P: string = await h5pPlayer.render(cachedContentId, userH5P, 'en', {
        ignoreUserPermissions: true
      })
      res.status(200).send(htmlH5P).end()
      return
    } catch (err: unknown) {
      renderedContent.delete(keyS3)
      log.debug('Cached H5P content missing, rebuilding', { keyS3 })
    }
  }

  const paramsS3: { Bucket: string; Key: string } = {
    Bucket: config.CLOUD_STORAGE_CONFIG.bucket,
    Key: keyS3
  }
  const options: { onlyInstallLibraries?: boolean } = {
    onlyInstallLibraries: false
  }
  const controller = new AbortController()
  const abortOnClientDisconnect = (): void => {
    if (!res.writableFinished) {
      controller.abort()
    }
  }
  res.once('close', abortOnClientDisconnect)
  let temporaryPackage: { directory: string; file: string } | undefined
  try {
    temporaryPackage = await downloadToTemporaryFile(paramsS3, controller.signal)

    // Install H5P application and needed library dependencies.
    const result: H5PUploadResult = await h5pEditor.uploadPackage(
      temporaryPackage.file,
      userH5P,
      options
    )

    // Update H5P application with the metadata and return a content ID.
    let mainlib: ILibraryName
    for (const lib of result.metadata.preloadedDependencies as ILibraryName[]) {
      if (lib.machineName === result.metadata.mainLibrary) {
        mainlib = lib
      }
    }
    const savedContentId: string = await h5pEditor.saveOrUpdateContent(
      undefined,
      result.parameters,
      result.metadata,
      LibraryName.toUberName(mainlib, { useWhitespace: true }),
      userH5P
    )

    // Render HTML content of the application.
    const htmlH5P: string = await h5pPlayer.render(savedContentId, userH5P, 'en', {
      ignoreUserPermissions: true
    })
    renderedContent.set(keyS3, savedContentId)
    res.status(200).send(htmlH5P).end()
  } catch (err: unknown) {
    // Client went away (e.g. gateway timeout then reload): the S3 request was
    // cancelled, not a server fault.
    if (controller.signal.aborted || isClientAbortError(err)) {
      return
    }
    log.error('Processing or rendering H5P failed', err)
    throw err
  } finally {
    if (temporaryPackage) {
      await rm(temporaryPackage.directory, { recursive: true, force: true }).catch(
        (err: unknown) => {
          log.error('Removing H5P temporary directory failed', err)
        }
      )
    }
    res.removeListener('close', abortOnClientDisconnect)
  }
}
