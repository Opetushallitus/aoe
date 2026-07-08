import { expect, type Page } from '@playwright/test'
import * as fs from 'node:fs'

export const OVER_LIMIT_BYTES = 5000000001 // 1 byte over 5 GB

// Writes a valid PDF header, then sparsely extends the file past the size limit
// with truncate. The header keeps type/extension checks happy; the tail is a
// hole that costs almost no disk. The client guard rejects on file.size before
// reading a byte, so the sparseness is never observed.
export function createSparsePdf(filePath: string, size: number): void {
  fs.writeFileSync(
    filePath,
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'
  )
  fs.truncateSync(filePath, size)
}

export async function expectFileTooLargeError(page: Page): Promise<void> {
  await expect(page.getByText('Tiedosto on liian suuri', { exact: false })).toBeVisible()
}
