import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

test.use({ launchOptions: { args: ['--disable-features=LocalNetworkAccessChecks'] } })

const ULKOINEN_SIVUSTO = 'https://ulkoinen-sivusto.example/'

test('upotusnäkymä näyttää materiaalin ja sen tiedoston kirjautumattomalle käyttäjälle', async ({
  page,
  browser
}) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi()
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi, {
    tiedostot: [{ nimi: 'test-image.png' }]
  })
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  // The embed view is cookie-free by design, so it is tested without the stored auth state.
  const kirjautumatonKonteksti = await browser.newContext({ storageState: undefined })
  const upotus = await kirjautumatonKonteksti.newPage()
  await upotus.goto(`/embed/${materiaaliNumero}/fi`)

  await expect(upotus.getByRole('link', { name: materiaaliNimi })).toBeVisible()

  // naturalWidth proves the file bytes arrived; toBeVisible alone passes on a broken image.
  const kuva = upotus.locator('img.img-fluid')
  await expect(kuva).toBeVisible()
  expect(await kuva.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)

  expect(await kirjautumatonKonteksti.cookies()).not.toContainEqual(
    expect.objectContaining({ name: 'connect.sid' })
  )
})

test('toinen sivusto voi upottaa materiaalin H5P-esikatseluineen mutta ei AOE:n etusivua', async ({
  page,
  browser
}) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(
    uusiMateriaali.randomMateriaaliNimi(),
    { tiedostot: [{ nimi: 'testing-127.h5p' }] }
  )
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  const ulkoinenKonteksti = await browser.newContext({
    storageState: undefined,
    ignoreHTTPSErrors: true
  })
  const ulkoinenSivu = await ulkoinenKonteksti.newPage()
  await ulkoinenSivu.route(ULKOINEN_SIVUSTO, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html>
        <iframe title="upotus" src="https://demo.aoe.fi/embed/${materiaaliNumero}/fi" width="1200" height="800"></iframe>
        <iframe title="etusivu" src="https://demo.aoe.fi/" width="1200" height="800"></iframe>`
    })
  )
  await ulkoinenSivu.goto(ULKOINEN_SIVUSTO)

  await expect(
    ulkoinenSivu
      .frameLocator('iframe[title="upotus"]')
      .locator('app-html-preview')
      .frameLocator('iframe')
      .locator('.h5p-content')
  ).toBeVisible({ timeout: 15_000 })

  await expect
    .poll(() => ulkoinenSivu.frames().map((kehys) => kehys.url()))
    .toContain('chrome-error://chromewebdata/')
})
