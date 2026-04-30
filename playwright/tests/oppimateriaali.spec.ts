import { expect, type Page, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import type { TaytaOpts } from './pages/UusiOppimateriaali'

const lisaaJaMuokkaaOppimateriaalia = async (page: Page, opts: TaytaOpts = {}) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi()
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi, opts)
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
}

test('käyttäjä voi lisätä ja muokata oppimateriaalia', async ({ page }) => {
  const TwoMinutesInMs = 2 * 60 * 1000
  test.setTimeout(TwoMinutesInMs)
  await test.step(`lisää oppimateriaali koulutusasteelle perusopetus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, {
      koulutustiedot: { koulutusasteet: ['perusopetuksen vuosiluokat 1-2'] }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle varhaiskasvatus ja esiopetus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, {
      koulutustiedot: { koulutusasteet: ['varhaiskasvatus', 'esiopetus'] }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle lukiokoulutus ja ammatillinen koulutus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, {
      koulutustiedot: {
        koulutusasteet: ['lukiokoulutus', 'ammatillinen koulutus'],
        ammatillinenTutkinnonOsa: 'Huippuosaajana toimiminen'
      }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle TUVA`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, {
      koulutustiedot: {
        koulutusasteet: ['tutkintoon valmentava koulutus, TUVA'],
        tuvaOppiaine: 'Perustaitojen vahvistaminen'
      }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle korkeakoulutus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, {
      koulutustiedot: {
        koulutusasteet: ['korkeakoulutus'],
        tieteenala: 'Metsätiede'
      },
      tarkemmatTiedot: {
        ominaisuudet: ['tekstitys', 'selkokieli'],
        esteet: ['ei äänihaittaa']
      }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle taiteen perusopetus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, {
      koulutustiedot: { koulutusasteet: ['taiteen perusopetus'] }
    })
  })
})

test('käyttäjä voi lisätä oppimateriaaleja eri kielillä', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()

  const materiaalienNimet: string[] = []

  for (const kieli of ['inarinsaame', 'viro', 'ruotsi', 'suomi']) {
    await test.step(`lisää oppimateriaali kielellä ${kieli}`, async () => {
      const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
      const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
      const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi(`Materiaali ${kieli}`)
      materiaalienNimet.push(materiaaliNimi)
      await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi, {
        tiedostot: { kieli }
      })
    })
  }

  await test.step(`tarkasta materiaalien löytyminen`, async () => {
    const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
    await expect(omatMateriaalit.locators.julkaistutMateriaalitHeading).toBeVisible()
    for (const materiaaliNimi of materiaalienNimet) {
      await omatMateriaalit.expectToFindMateriaali(materiaaliNimi)
    }
  })
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
