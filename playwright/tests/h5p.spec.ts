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

test('h5p: sisällöt toimivat materiaalisivulla', async ({ context, page }) => {
  // Crossword lays out its grid and Sort Paragraphs shuffles with Math.random: seed it (mulberry32)
  // in every frame of every page so the screenshots are the same on every run.
  await context.addInitScript(() => {
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
  const { materials } = await (
    await page.request.get(`/api/v1/material/${await materiaali.getMateriaaliNumero()}`)
  ).json()
  const tiedostoavaimet = new Map<string, string>(
    materials.map((m: { originalfilename: string; filekey: string }) => [
      m.originalfilename,
      m.filekey
    ])
  )
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
      const kuva = `${tiedosto.replace(/\.h5p$/, '')}.png`
      await expect(page.locator('app-h5p-preview > div')).toHaveScreenshot(kuva)

      const [upotus] = await Promise.all([
        context.waitForEvent('page'),
        page
          .locator('app-h5p-preview')
          .getByRole('link', { name: 'Avaa oppimateriaali uuteen välilehteen' })
          .click()
      ])
      await expect(upotus).toHaveURL(new RegExp(`/h5p/play/${tiedostoavaimet.get(tiedosto)}$`))
      const soitin = upotus.locator('#h5p iframe').contentFrame()
      await expect(soitin.locator(sisalto).first()).toBeVisible({ timeout: 60_000 })
      await expect(upotus).toHaveScreenshot(`play-${kuva}`, { fullPage: true })
      await upotus.close()
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
      await materiaali.lisaaKokoelmaan(kokoelma, { uusi: false })
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

test('h5p: rikkinäisen paketin lataaminen estetään', async ({ page }) => {
  await Etusivu(page).goto()
  const omatMateriaalit = await Etusivu(page).header.clickOmatMateriaalit()
  await omatMateriaalit.locators.luoUusiMateriaali.click()
  await page
    .getByRole('textbox', { name: 'Oppimateriaalin nimi *', exact: true })
    .fill(`Broken H5P test ${Date.now()}`)
  await page.locator('#file0').setInputFiles({
    name: 'rikki.h5p',
    mimeType: 'application/zip',
    buffer: Buffer.from('not a zip')
  })
  await page.getByRole('button', { name: 'Seuraava' }).click()
  await expect(page.getByText('Osa latauksista keskeytyi tai epäonnistui')).toBeVisible({
    timeout: 15_000
  })
})
