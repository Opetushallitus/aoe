import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

// `sisalto` is an element the content type renders itself, so a missing library or a failed
// render fails the test even though the iframe is still there.
const H5P = [
  { tiedosto: 'example-content-crossword-1209160.h5p', sisalto: '.h5p-crossword-cell' },
  {
    tiedosto: 'example-content-image-choice-1209180.h5p',
    sisalto: '.h5p-multi-media-choice-list-item'
  },
  {
    tiedosto: 'example-content-sort-paragraphs-2-1209198.h5p',
    sisalto: '.h5p-sort-paragraphs-paragraph-button-container'
  }
]

test('h5p: sisällöt toimivat materiaalisivulla', async ({ page }) => {
  // Crossword lays out its grid and Sort Paragraphs shuffles with Math.random: seed it (mulberry32)
  // in every frame so the screenshots are the same on every run.
  await page.addInitScript(() => {
    let seed = 1
    Math.random = () => {
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  })
  await Etusivu(page).goto()
  const omatMateriaalit = await Etusivu(page).header.clickOmatMateriaalit()
  const uusi = await omatMateriaalit.luoUusiMateriaali()
  const materiaali = await uusi.taytaJaTallennaUusiMateriaali(uusi.randomMateriaaliNimi('H5P'), {
    tiedostot: H5P.map(({ tiedosto }) => ({ nimi: tiedosto }))
  })
  // The cookie notice is fixed to the viewport and would overlap the preview.
  await page.addStyleTag({ content: 'app-cookie-notice{display:none!important}' })

  for (const { tiedosto, sisalto } of H5P) {
    await test.step(tiedosto, async () => {
      await materiaali.valitseTiedosto(tiedosto)
      await expect(materiaali.esikatselu.h5p.locator(sisalto).first()).toBeVisible({
        timeout: 60_000
      })
      // Only the player: the tablist order of the files is not stable between runs, and the
      // selected tab's border overlaps the tabpanel's edge.
      await expect(page.locator('app-h5p-preview')).toHaveScreenshot(
        `${tiedosto.replace(/\.h5p$/, '')}.png`
      )
    })
  }
})

// A collection page plays every material's preview at once, and h5p-standalone keeps its settings
// in the global window.H5PIntegration, so two content types on one page must both render.
test('h5p: kokoelma näyttää eri sisältötyypit', async ({ page }) => {
  test.setTimeout(3 * 60 * 1000)
  const kaksi = H5P.slice(0, 2)
  const kokoelma = `H5P-kokoelma-${Date.now()}`
  for (const [i, { tiedosto }] of kaksi.entries()) {
    await Etusivu(page).goto()
    const omatMateriaalit = await Etusivu(page).header.clickOmatMateriaalit()
    const uusi = await omatMateriaalit.luoUusiMateriaali()
    const materiaali = await uusi.taytaJaTallennaUusiMateriaali(uusi.randomMateriaaliNimi('H5P'), {
      tiedostot: [{ nimi: tiedosto }]
    })
    if (i === 0) {
      await materiaali.lisaaKokoelmaan(kokoelma)
    } else {
      await page.getByRole('button', { name: 'Lisää kokoelmaan' }).click()
      await page.getByLabel(kokoelma).click({ force: true })
      await page.getByRole('button', { name: 'Lisää', exact: true }).click()
    }
  }
  const omatMateriaalit = await Etusivu(page).header.clickOmatMateriaalit()
  await (await omatMateriaalit.startToEditKokoelma(kokoelma)).julkaiseKokoelma()

  for (const { tiedosto, sisalto } of kaksi) {
    const kehys = page
      .getByRole('tabpanel', { name: tiedosto.replace(/\.h5p$/, '') })
      .locator('app-h5p-preview')
      .frameLocator('iframe')
    await expect(kehys.locator(sisalto).first()).toBeVisible({ timeout: 60_000 })
  }
})
