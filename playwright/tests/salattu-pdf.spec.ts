import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import * as path from 'node:path'

test('salatun PDF-tiedoston lataaminen estetään', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  await omatMateriaalit.locators.luoUusiMateriaali.click()

  await page
    .getByRole('textbox', { name: 'Oppimateriaalin nimi *', exact: true })
    .fill(`Encrypted PDF test ${Date.now()}`)

  const encryptedPdfPath = path.join(__dirname, '../test-files/password_protected.pdf')
  await page.locator('#file0').click()
  await page.locator('#file0').setInputFiles(encryptedPdfPath)

  await page.getByRole('button', { name: 'Seuraava' }).click()

  await expect(
    page.getByText('Salasanalla suojatut tai salatut tiedostot eivät ole sallittuja')
  ).toBeVisible({ timeout: 15000 })
})
