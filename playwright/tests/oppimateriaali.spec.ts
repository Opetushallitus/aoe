import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

test('käyttäjä voi lisätä ja muokata oppimateriaalia', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi()
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()
  await materiaali.header.clickOmatMateriaalit()
  await expect(omatMateriaalit.locators.julkaistutMateriaalitHeading).toBeVisible()
  await omatMateriaalit.expectToFindMateriaali(materiaaliNimi)

  const materiaaliNimiMuutettu = `${materiaaliNimi}_muutettu`
  const muokkaaMateriaalia = await omatMateriaalit.startToEditMateriaaliNumero(materiaaliNumero)
  const muokkausForm = muokkaaMateriaalia.form
  await muokkausForm.oppimateriaalinNimi(materiaaliNimiMuutettu)
  const esikatseluJaTallennut = await muokkausForm
    .seuraava()
    .then((n) => n.seuraava())
    .then((n) => n.seuraava())
    .then((n) => n.seuraava())
    .then((n) => n.seuraava())
    .then((n) => n.seuraava())
  await esikatseluJaTallennut.tallenna(materiaaliNimiMuutettu)
})

test('käyttäjä voi päivittää materiaalista kaikki linkit kerralla ja julkaista materiaalit', async ({
  page
}) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiVerkkosivuMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiVerkkosivuMateriaali.randomMateriaaliNimi()
  const materiaali = await uusiVerkkosivuMateriaali.taytaJaTallennaUusiVerkkosivuMateriaali(
    materiaaliNimi,
    'https://example.com'
  )

  const materiaaliNumero = await materiaali.getMateriaaliNumero()
  await materiaali.header.clickOmatMateriaalit()
  await expect(omatMateriaalit.locators.julkaistutMateriaalitHeading).toBeVisible()
  await omatMateriaalit.expectToFindMateriaali(materiaaliNimi)

  const muokkaaMateriaalia = await omatMateriaalit.startToEditMateriaaliNumero(materiaaliNumero)
  const muokkausForm = muokkaaMateriaalia.form
  await muokkausForm.muokkaaVerkkoSivu('https://example.org')
  const esikatseluJaTallennut = await muokkausForm
    .seuraava()
    .then((n) => n.seuraava())
    .then((n) => n.seuraava())
    .then((n) => n.seuraava())
    .then((n) => n.seuraava())
    .then((n) => n.seuraava())
  await esikatseluJaTallennut.tallenna(materiaaliNimi)
})
test('käyttäjä voi luoda kokoelman ja julkaista sen', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  let omatMateriaalitPage = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalitPage.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi()
  const materiaaliPage = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const kokoelmaName = `Testikokoelma-${materiaaliNimi}`
  await materiaaliPage.lisaaKokoelmaan(kokoelmaName)
  omatMateriaalitPage = await etusivu.header.clickOmatMateriaalit()
  const kokoelmaEditPage = await omatMateriaalitPage.startToEditKokoelma(kokoelmaName)
  const kokoelmaPage = await kokoelmaEditPage.julkaiseKokoelma()
  const kokoelmatPage = await kokoelmaPage.header.clickKokoelmat()
  await expect(await kokoelmatPage.kokoelmaByName(kokoelmaName)).toContainText(
    'Kokoelma on luotu Playwright testissä.'
  )
})
