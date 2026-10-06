import { config } from '@/config'
import {
  downloadFromStorage,
  downloadToTemporaryFile,
  uploadFileToStorage
} from '@query/fileHandling'
import { db } from '@resource/postgresClient'
import * as log from '@util/winstonLogger'
import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import fsPromise from 'fs/promises'
import libre from 'libreoffice-convert'
import path from 'node:path'
import { StatusError } from './errorHandler'
import { z } from 'zod'

const officeMimeTypes = [
  // .doc
  'application/msword',
  // .dot
  'application/msword',
  // .docx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // .dotx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  // .docm
  'application/vnd.ms-word.document.macroEnabled.12',
  // .dotm
  'application/vnd.ms-word.template.macroEnabled.12',
  // .xls
  'application/vnd.ms-excel',
  // .xlt
  'application/vnd.ms-excel',
  // .xla
  'application/vnd.ms-excel',
  // .xlsx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // .xltx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  // .xlsm
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  // .xltm
  'application/vnd.ms-excel.template.macroEnabled.12',
  // .xlam
  'application/vnd.ms-excel.addin.macroEnabled.12',
  // .xlsb
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
  // .ppt
  'application/vnd.ms-powerpoint',
  // .pot
  'application/vnd.ms-powerpoint',
  // .pps
  'application/vnd.ms-powerpoint',
  // .ppa
  'application/vnd.ms-powerpoint',
  // .pptx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // .potx
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  // .ppsx
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  // .ppam
  'application/vnd.ms-powerpoint.addin.macroEnabled.12',
  // .pptm
  'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
  // .potm
  'application/vnd.ms-powerpoint.template.macroEnabled.12',
  // .ppsm
  'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
  // .mdb
  'application/vnd.ms-access',
  // openoffice
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.graphics',
  'application/vnd.oasis.opendocument.chart',
  'application/vnd.oasis.opendocument.formula',
  'application/vnd.oasis.opendocument.image',
  'application/vnd.oasis.opendocument.text-master',
  'application/vnd.oasis.opendocument.text-template',
  'application/vnd.oasis.opendocument.spreadsheet-template',
  'application/vnd.oasis.opendocument.presentation-template',
  'application/vnd.oasis.opendocument.graphics-template',
  'application/vnd.oasis.opendocument.chart-template',
  'application/vnd.oasis.opendocument.formula-template',
  'application/vnd.oasis.opendocument.image-template',
  'application/vnd.oasis.opendocument.text-web'
]

/**
 * Check if a file mimetype is an office format.
 * @param {string} s
 * @return {boolean}
 */
export const isOfficeMimeType = (s: string): boolean => {
  return officeMimeTypes.indexOf(s) >= 0
}

/**
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @return {Promise<void>}
 */
export const downloadPdfFromAllas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.params.key) {
      next(new StatusError(400, 'key missing'))
    }
    const params = {
      Bucket: config.cloudStorage.bucketPDF,
      Key: req.params.key
    }
    await downloadFromStorage(res, params, req.params.key)
  } catch (error) {
    log.error(error)
    next(new StatusError(error.statusCode, 'Issue showing pdf'))
  }
}

/**
 * Convert an office format file to PDF format.
 * @param {string} filepath File path of the original office format file.
 * @param {string} outputPath File path to write the converted PDF to.
 * @return {Promise<string>} File path of the converted PDF.
 */
const convertOfficeFileToPDF = (filepath: string, outputPath: string): Promise<string> => {
  const extension = 'pdf'

  return new Promise((resolve, reject) => {
    try {
      const file = fs.readFileSync(filepath)
      libre.convert(file, extension, undefined, async (err: Error, data: Buffer) => {
        if (err) {
          log.error('Converting an office file to PDF failed in convertOfficeFileToPDF()')
          return reject(err)
        }
        await fsPromise.writeFile(outputPath, data)
        return resolve(outputPath)
      })
    } catch (err) {
      log.error('Error in convertOfficeFileToPDF()', err)
      return reject(err)
    }
  })
}

/**
 * Scheduled process to collect the office file materials without a PDF conversion,
 * create the missing PDF conversions and upstream them to the cloud object storage.
 * {@link src/util/aoeScheduler.ts}
 * @return {Promise<void>}
 */
export const scheduledConvertAndUpstreamOfficeFilesToCloudStorage = async (): Promise<void> => {
  try {
    const officeFiles = await getOfficeFilesWithoutPDF()
    let converted = 0

    for (const file of officeFiles) {
      try {
        await convertOfficeFileToStoredPDF(file.filekey, file.id)
        converted++
      } catch (err) {
        log.error(`PDF conversion/upload failed for [${file.filekey}]`, err)
      }
    }
    log.info(`Converted ${converted} of ${officeFiles.length} office files without a PDF`)
  } catch (err) {
    log.error('Office to PDF conversion failed', err)
    throw err
  }
}

const officeFilesWithoutPDFSchema = z.array(z.object({ id: z.string(), filekey: z.string() }))

const getOfficeFilesWithoutPDF = async (): Promise<z.infer<typeof officeFilesWithoutPDFSchema>> => {
  try {
    return officeFilesWithoutPDFSchema.parse(
      await db.any(
        `
        SELECT id, filekey
        FROM record
        WHERE filekey IS NOT NULL AND pdfkey IS NULL AND mimetype = ANY($1)
        ORDER BY id
      `,
        [officeMimeTypes]
      )
    )
  } catch (err: unknown) {
    log.error('Fetching files without PDFs failed', err)
    throw err
  }
}

export const convertOfficeFileToStoredPDF = async (
  key: string,
  recordId: string
): Promise<void> => {
  const source = await downloadToTemporaryFile(
    { Bucket: config.cloudStorage.bucket, Key: key },
    path.basename(key)
  )
  try {
    const pdfFile = await convertOfficeFileToPDF(
      source.file,
      path.join(source.directory, 'converted.pdf')
    )
    const pdfKey = `${key.substring(0, key.lastIndexOf('.'))}.pdf`
    const pdfObject = await uploadFileToStorage(pdfFile, pdfKey, config.cloudStorage.bucketPDF)
    await updatePdfKey(pdfObject.Key, recordId)
  } finally {
    await fsPromise.rm(source.directory, { recursive: true, force: true })
  }
}

const updatePdfKey = async (key: string, id: string): Promise<void> => {
  await db.none('UPDATE record SET pdfkey = $1 WHERE id = $2', [key, id])
}
