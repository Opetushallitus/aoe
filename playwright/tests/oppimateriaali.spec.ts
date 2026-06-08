import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import type { TaytaOpts } from './pages/UusiOppimateriaali'

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

test('käyttäjä voi lisätä oppimateriaaleja eri koulutusasteille', async ({ page }) => {
  const TwoMinutesInMs = 2 * 60 * 1000
  test.setTimeout(TwoMinutesInMs)

  const etusivu = Etusivu(page)
  await etusivu.goto()
  const materiaalienNimet: string[] = []

  const lisaaMateriaali = async (nimi: string, opts: TaytaOpts) => {
    const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
    const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
    const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi(`Materiaali ${nimi}`)
    materiaalienNimet.push(materiaaliNimi)
    await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi, opts)
  }

  await test.step(`lisää oppimateriaali koulutusasteelle perusopetus`, async () => {
    await lisaaMateriaali('perusopetus', {
      koulutustiedot: { koulutusasteet: ['perusopetuksen vuosiluokat 1-2'] }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle varhaiskasvatus ja esiopetus`, async () => {
    await lisaaMateriaali('varhaiskasvatus ja esiopetus', {
      koulutustiedot: { koulutusasteet: ['varhaiskasvatus', 'esiopetus'] }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle lukiokoulutus ja ammatillinen koulutus`, async () => {
    await lisaaMateriaali('lukiokoulutus ja ammatillinen koulutus', {
      koulutustiedot: {
        koulutusasteet: ['lukiokoulutus', 'ammatillinen koulutus'],
        ammatillinenTutkinnonOsa: 'Huippuosaajana toimiminen'
      }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle TUVA`, async () => {
    await lisaaMateriaali('TUVA', {
      koulutustiedot: {
        koulutusasteet: ['tutkintoon valmentava koulutus, TUVA'],
        tuvaOppiaine: 'Perustaitojen vahvistaminen'
      }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle korkeakoulutus`, async () => {
    await lisaaMateriaali('korkeakoulutus', {
      perustiedot: {
        kohderyhma: 'Oppija',
        kayttotarkoitus: 'Kurssimateriaali',
        organisaatio: 'Opetushallitus'
      },
      koulutustiedot: { koulutusasteet: ['korkeakoulutus'], tieteenala: 'Metsätiede' },
      tarkemmatTiedot: {
        ominaisuudet: ['tekstitys', 'selkokieli'],
        esteet: ['ei äänihaittaa']
      },
      hyodynnetytMateriaalit: {
        author: 'Lähde Tekijä',
        url: 'https://source.example.com',
        name: 'Lähdemateriaali'
      }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle taiteen perusopetus`, async () => {
    await lisaaMateriaali('taiteen perusopetus', {
      koulutustiedot: { koulutusasteet: ['taiteen perusopetus'] }
    })
  })

  await test.step(`tarkasta materiaalien löytyminen`, async () => {
    const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
    await expect(omatMateriaalit.locators.julkaistutMateriaalitHeading).toBeVisible()
    for (const materiaaliNimi of materiaalienNimet) {
      await omatMateriaalit.expectToFindMateriaali(materiaaliNimi)
    }
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
