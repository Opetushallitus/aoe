import { expect, test } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { Etusivu } from './pages/Etusivu'

type Osa = {
  tiedosto: string
  esikatselu?: string
  pdfTeksti?: string
  kehyksessa?: string
  valilehdenOsoite?: RegExp
  media?: 'video' | 'audio'
  kuva?: true
}

// One material carrying every supported content type, so a regression in any single preview
// path shows up here. `pdfTeksti` is text of the office file's converted PDF, `kehyksessa` a
// locator inside the html preview iframe and its new tab, `media` and `kuva` that the element
// really loaded its source, `esikatselu` a plain page element, and none of them that the type
// only offers a download.
const OSAT: Osa[] = [
  { tiedosto: 'blank.pdf', esikatselu: 'app-pdf-preview' },
  { tiedosto: 'office-test.docx', pdfTeksti: 'office-to-PDF conversion test document' },
  { tiedosto: 'test-presentation.pptx', pdfTeksti: 'pptx-to-PDF conversion test presentation' },
  { tiedosto: 'test-spreadsheet.xlsx', pdfTeksti: 'xlsx-to-PDF conversion test spreadsheet' },
  { tiedosto: 'test-video.mp4', media: 'video' },
  { tiedosto: 'test-audio.mp3', media: 'audio' },
  { tiedosto: 'test-image.png', kuva: true },
  { tiedosto: 'test-photo.jpg', kuva: true },
  {
    tiedosto: 'testing-127.h5p',
    kehyksessa: '.h5p-content',
    valilehdenOsoite: /\/h5p\/play\/testing127-\d+\.h5p$/
  },
  {
    tiedosto: 'test-site.zip',
    kehyksessa: 'text=zip-to-HTML preview test site',
    valilehdenOsoite: /\/content\/test-site\/index\.html$/
  },
  { tiedosto: 'test-bundle.zip' },
  { tiedosto: 'backup-moodle2-course-3-test-course-20260731-1051-nu.mbz' }
]

// `domain` is what the preview button labels itself with: the hostname minus a www. prefix.
const LINKIT = [
  { esitysnimi: 'verkkosivulinkki', linkki: 'https://example.com', domain: 'example.com' },
  { esitysnimi: 'tiedostourl', linkki: 'https://example.com/aineisto.pdf', domain: 'example.com' },
  { esitysnimi: 'aoe-etusivu', linkki: 'https://www.aoe.fi', domain: 'aoe.fi' },
  {
    esitysnimi: 'youtube-video',
    linkki: 'https://www.youtube.com/watch?v=0fbBTsoPlnc',
    domain: 'youtube.com'
  },
  {
    esitysnimi: 'soundcloud-podcast',
    linkki:
      'https://soundcloud.com/opetushallitus/kt-kuuntele-voitto-koetehtavien-kaikki-kuuntelut-5?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
    domain: 'soundcloud.com'
  }
] as const

const UUTEEN_VALILEHTEEN = 'Avaa oppimateriaali uuteen välilehteen'

// The download menu and the tablist both label a file with its name minus the extension.
const tiedostonEsitysnimi = (tiedosto: string) => tiedosto.replace(/\.[^.]+$/, '')
const lahdetiedosto = (tiedosto: string) =>
  fs.readFileSync(path.join(__dirname, '../test-files', tiedosto))

test('materiaalidumppi: kaikki tiedostotyypit samassa materiaalissa', async ({ page, context }) => {
  test.setTimeout(10 * 60 * 1000)

  await Etusivu(page).goto()
  const omatMateriaalit = await Etusivu(page).header.clickOmatMateriaalit()
  const uusi = await omatMateriaalit.luoUusiMateriaali()
  const nimi = uusi.randomMateriaaliNimi('Materiaalidumppi')

  const materiaali = await uusi.taytaJaTallennaUusiMateriaali(nimi, {
    tiedostot: [
      ...OSAT.map(({ tiedosto }) => ({ nimi: tiedosto })),
      ...LINKIT.map(({ linkki, esitysnimi }) => ({ linkki, esitysnimi }))
    ]
  })
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  for (const {
    tiedosto,
    esikatselu,
    pdfTeksti,
    kehyksessa,
    valilehdenOsoite,
    media,
    kuva
  } of OSAT) {
    await test.step(`esikatselu: ${tiedosto}`, async () => {
      await materiaali.valitseTiedosto(tiedosto)
      if (media) {
        // Assert the element read a duration off the stream, not just that it rendered:
        // the player is there whether or not the media itself is served.
        const soitin = page.locator(`app-${media}-preview ${media}`)
        await expect(soitin).toBeVisible()
        await expect
          .poll(() => soitin.evaluate((el: HTMLMediaElement) => el.duration))
          .toBeGreaterThan(0)
      } else if (kuva) {
        const kuvake = page.locator('app-image-preview img')
        await expect(kuvake).toBeVisible()
        await expect
          .poll(() => kuvake.evaluate((el: HTMLImageElement) => el.naturalWidth))
          .toBeGreaterThan(0)
      } else if (pdfTeksti) {
        // Conversion runs after the upload, so reload until the viewer renders the PDF.
        // Reloading resets the tablist, hence reselecting the file inside the poll.
        await expect(async () => {
          await page.reload()
          await materiaali.valitseTiedosto(tiedosto)
          await expect(
            page.locator('app-office-preview').frameLocator('iframe').getByText(pdfTeksti)
          ).toBeVisible({ timeout: 15_000 })
        }).toPass({ timeout: 120_000, intervals: [5_000] })
      } else if (kehyksessa) {
        // Assert the rendered content, not just the iframe element: a failed import or
        // extraction still leaves the iframe in place, it just serves an error body.
        await expect(
          page.locator('app-html-preview').frameLocator('iframe').locator(kehyksessa)
        ).toBeVisible()

        const [valilehti] = await Promise.all([
          context.waitForEvent('page'),
          page.locator('app-html-preview').getByRole('link', { name: UUTEEN_VALILEHTEEN }).click()
        ])
        if (valilehdenOsoite) {
          await expect(valilehti).toHaveURL(valilehdenOsoite)
        }
        await expect(valilehti.locator(kehyksessa)).toBeVisible()
        await valilehti.close()
      } else if (esikatselu) {
        await expect(page.locator(esikatselu)).toBeVisible()
      } else {
        await expect(page.getByText('ei ole esikatseltavissa')).toBeVisible()
      }
    })
  }

  for (const { tiedosto } of OSAT) {
    await test.step(`lataa yksittäin: ${tiedosto}`, async () => {
      // Chromium's per-tab download limiter starts prompting instead of downloading after the
      // tenth file, and the limiter resets on navigation, so reload before each download.
      await page.reload()
      await materiaali.avaaLatausvalikko()
      const blob = await materiaali.lataaTiedosto(tiedostonEsitysnimi(tiedosto))
      // Byte equality with the fixture, so an office file cannot pass by serving its converted
      // PDF, and no file can pass by arriving truncated or as an error body.
      const ladattu = Buffer.from(await blob.arrayBuffer())
      const odotettu = lahdetiedosto(tiedosto)
      expect(ladattu.length, `${tiedosto} latautui väärän kokoisena`).toBe(odotettu.length)
      expect(ladattu.equals(odotettu), `${tiedosto} ei vastaa alkuperäistä tiedostoa`).toBe(true)
    })
  }

  await test.step('lataa kaikki tiedostot', async () => {
    await materiaali.avaaLatausvalikko()
    const nide = Buffer.from(await (await materiaali.lataaKaikkiTiedostot()).arrayBuffer())
    expect(nide.subarray(0, 2).toString()).toBe('PK')
    // s3-zip names the entries with the original filenames, which a zip stores as plain bytes
    // in its headers, so the bundle can be checked without unpacking it.
    for (const { tiedosto } of OSAT) {
      expect(nide.includes(tiedosto), `${tiedosto} puuttuu niteestä`).toBe(true)
    }
  })

  // The link previews are followed for real, but their targets are fulfilled locally so a CI
  // run never sends traffic to youtube.com, soundcloud.com and friends. Matching by origin
  // keeps demo.aoe.fi itself untouched.
  const ulkoisetOriginit = new Set(LINKIT.map(({ linkki }) => new URL(linkki).origin))
  await context.route(
    (url) => ulkoisetOriginit.has(url.origin),
    (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>ulkoinen sivu</h1>' })
  )

  for (const { esitysnimi, linkki, domain } of LINKIT) {
    await test.step(`esikatselu: ${esitysnimi}`, async () => {
      await materiaali.valitseTiedosto(esitysnimi)
      const nappi = page.getByTestId(`preview-link-${materiaaliNumero}`)
      await expect(nappi).toBeVisible()
      await expect(nappi).toHaveAttribute('href', linkki)
      await expect(nappi).toContainText(domain)
      await expect(nappi).toHaveAttribute('target', '_blank')
      // noopener keeps the opened tab from reaching back into this one via window.opener.
      await expect(nappi).toHaveAttribute('rel', /noopener/)

      const [valilehti] = await Promise.all([context.waitForEvent('page'), nappi.click()])
      await expect(valilehti).toHaveURL(new URL(linkki).href)
      // Proves the stub answered instead of the real host: without this the test would still
      // pass while quietly loading youtube.com and friends on every CI run.
      await expect(valilehti.getByRole('heading', { name: 'ulkoinen sivu' })).toBeVisible()
      await valilehti.close()
    })
  }
})
