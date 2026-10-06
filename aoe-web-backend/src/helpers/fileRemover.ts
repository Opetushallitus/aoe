import * as log from '@util/winstonLogger'
import fs from 'fs'
import { readdir, rm, rmdir } from 'fs/promises'
import path from 'path'

const errnoCode = (e: unknown): string | undefined =>
  e instanceof Error && 'code' in e && typeof e.code === 'string' ? e.code : undefined

const listEntries = async (dirPath: string): Promise<fs.Dirent[]> => {
  try {
    return await readdir(dirPath, { withFileTypes: true })
  } catch (e) {
    if (errnoCode(e) === 'ENOENT') {
      return []
    }
    log.error('Failed to list directory for cleanup', e)
    return []
  }
}

export async function rmDir(dirPath: string, removeSelf: boolean): Promise<void> {
  const entries = await listEntries(dirPath)
  for (const entry of entries) {
    if (entry.name.startsWith('.nfs')) {
      continue
    }
    const filePath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      await rmDir(filePath, true)
    } else {
      await rm(filePath, { force: true })
    }
  }

  if (!removeSelf) {
    return
  }

  try {
    await rmdir(dirPath)
  } catch (e) {
    const code = errnoCode(e)
    if (code === 'ENOTEMPTY' || code === 'ENOENT') {
      return
    }
    log.error('Failed to remove directory during cleanup', e)
  }
}
