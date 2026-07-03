import { test, expect, type Page } from '@playwright/test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { Etusivu } from './pages/Etusivu'

const OVER_LIMIT_BYTES = 5000000001 // 1 byte over 5 GB

// Writes a valid PDF header, then sparsely extends the file past the size limit
// with truncate. The header keeps type/extension checks happy; the tail is a
// hole that costs almost no disk. The client guard rejects on file.size before
// reading a byte, so the sparseness is never observed.
function createSparsePdf(filePath: string, size: number): void {
  fs.writeFileSync(
    filePath,
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'
  )
  fs.truncateSync(filePath, size)
}

async function expectFileTooLargeError(page: Page): Promise<void> {
  await expect(page.getByText('Tiedosto on liian suuri', { exact: false })).toBeVisible()
}

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
