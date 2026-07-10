import { test, expect } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

test('Office-tiedostosta muodostuu ladattava PDF-versio', async ({ page }) => {
  test.setTimeout(2 * 60 * 1000)

  await Etusivu(page).goto()
  const omatMateriaalit = await Etusivu(page).header.clickOmatMateriaalit()
  const uusi = await omatMateriaalit.luoUusiMateriaali()
  const nimi = uusi.randomMateriaaliNimi('Office-muunnos')
  await uusi.taytaJaTallennaUusiMateriaali(nimi, {
    tiedostot: [{ nimi: 'office-test.docx' }]
  })

  const pdfPreview = page
    .locator('app-office-preview')
    .frameLocator('iframe')
    .getByText('office-to-PDF conversion test document')

  await expect(async () => {
    await page.reload()
    await expect(pdfPreview).toBeVisible({ timeout: 15_000 })
  }).toPass({ timeout: 90_000, intervals: [5_000] })
})
