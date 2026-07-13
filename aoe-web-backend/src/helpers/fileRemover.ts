import * as log from '@util/winstonLogger'
import fs from 'fs'
import path from 'path'

const errnoCode = (e: unknown): string | undefined =>
  e instanceof Error && 'code' in e && typeof e.code === 'string' ? e.code : undefined

const listEntries = (dirPath: string): fs.Dirent[] => {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
  } catch (e) {
    if (errnoCode(e) === 'ENOENT') {
      return []
    }
    log.error('Failed to list directory for cleanup', e)
    return []
  }
}

export function rmDir(dirPath: string, removeSelf: boolean): void {
  const entries = listEntries(dirPath)
  for (const entry of entries) {
    if (entry.name.startsWith('.nfs')) {
      continue
    }
    const filePath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      rmDir(filePath, true)
    } else {
      fs.rmSync(filePath, { force: true })
    }
  }

  if (!removeSelf) {
    return
  }

  try {
    fs.rmdirSync(dirPath)
  } catch (e) {
    const code = errnoCode(e)
    if (code === 'ENOTEMPTY' || code === 'ENOENT') {
      return
    }
    log.error('Failed to remove directory during cleanup', e)
  }
}
