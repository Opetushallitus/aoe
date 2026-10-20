import fs from 'node:fs'
import path from 'node:path'

// Find all files named pattern under dir, skipping __MACOSX resource forks.
const searchRecursive = (dir: string, pattern: string): string[] => {
  let results: string[] = []
  fs.readdirSync(dir).forEach((dirInner) => {
    // Skip macOS resource fork directories
    if (dirInner === '__MACOSX') {
      return
    }
    dirInner = path.resolve(dir, dirInner)
    const stat = fs.statSync(dirInner)
    if (stat.isDirectory()) {
      results = results.concat(searchRecursive(dirInner, pattern))
    }
    if (stat.isFile() && path.basename(dirInner) === pattern) {
      results.push(dirInner)
    }
  })
  return results
}

// Keyed by the storage key, which is unique per upload, so materials sharing an original
// filename never share a folder. The slice drops the 4-character .zip/.h5p extension.
export const extractionFolderOf = (fileKey: string): string =>
  `${process.env.HTML_FOLDER}/${fileKey}`.slice(0, -4)

export const isH5PArchive = (fileKey: string): boolean => fileKey.toLowerCase().endsWith('.h5p')

// An H5P package is previewed from its root folder, which must hold h5p.json. An HTML
// archive is previewed from its first index.html (or index.htm). Returns false when missing.
export const findPreviewEntry = (extractedFolder: string, isH5P: boolean): string | false => {
  if (isH5P) {
    return fs.existsSync(path.join(extractedFolder, 'h5p.json')) && extractedFolder
  }
  const [indexHtmlPath] = searchRecursive(extractedFolder, 'index.html')
  if (indexHtmlPath) {
    return indexHtmlPath
  }
  const [indexHtmPath] = searchRecursive(extractedFolder, 'index.htm')
  return indexHtmPath || false
}

// Search for an already-extracted archive on disk for a given storage key.
// Returns its preview entry (see findPreviewEntry), or false if the extracted folder doesn't exist.
export const findExistingPreviewEntry = (fileKey: string): string | false => {
  const extractedFolder = extractionFolderOf(fileKey)
  try {
    if (!fs.existsSync(extractedFolder)) {
      return false
    }
    return findPreviewEntry(extractedFolder, isH5PArchive(fileKey))
  } catch {
    return false
  }
}
