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

  const readPdfUrl = () => {
    const viewerFrame = page.frames().find((f) => f.url().includes('/assets/pdfjs/'))
    return viewerFrame ? new URL(viewerFrame.url()).searchParams.get('file') : null
  }

  let pdfUrl = ''
  await expect(async () => {
    await page.reload()
    await expect.poll(readPdfUrl, { timeout: 10_000 }).toContain('/api/v1/pdf/content/')
    pdfUrl = readPdfUrl() ?? ''
  }).toPass({ timeout: 90_000, intervals: [2_000] })

  const res = await page.request.get(pdfUrl)
  expect(res.status()).toBe(200)
  const body = await res.body()
  expect(body.subarray(0, 5).toString()).toBe('%PDF-')
})
