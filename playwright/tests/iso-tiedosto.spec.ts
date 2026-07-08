import { test, expect } from '@playwright/test'
import * as os from 'node:os'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { Etusivu } from './pages/Etusivu'
import { OVER_LIMIT_BYTES, createSparsePdf, expectFileTooLargeError } from './helpers/bigFile'

test('yli 5 Gt tiedosto estetään heti eikä sitä ladata', async ({ page }) => {
  const bigPdf = path.join(os.tmpdir(), `aoe-big-${process.pid}.pdf`)
  createSparsePdf(bigPdf, OVER_LIMIT_BYTES)
  try {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
    await omatMateriaalit.luoUusiMateriaali()

    await page.locator('#file0').setInputFiles(bigPdf)

    await expectFileTooLargeError(page)
    // The guard clears the input, so no file is queued for upload.
    await expect(page.locator('#file0')).toHaveValue('')
  } finally {
    fs.rmSync(bigPdf, { force: true })
  }
})
