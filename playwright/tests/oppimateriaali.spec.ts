import { expect, type Page, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

const lisaaJaMuokkaaOppimateriaalia = async (page: Page, koulutusasteet = ['korkeakoulutus']) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi()
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(
    materiaaliNimi,
    koulutusasteet
  )
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
  test.setTimeout(750000)
  await test.step(`lisää oppimateriaali koulutusasteelle perusopetus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, ['perusopetuksen vuosiluokat 1-2'])
  })
  await test.step(`lisää oppimateriaali koulutusasteelle varhaiskasvatus ja esiopetus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, ['varhaiskasvatus', 'esiopetus'])
  })
  await test.step(`lisää oppimateriaali koulutusasteelle lukiokoulutus ja ammatillinen koulutus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, ['lukiokoulutus', 'ammatillinen koulutus'])
  })
  await test.step(`lisää oppimateriaali koulutusasteelle TUVA`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, ['tutkintoon valmentava koulutus, TUVA'])
  })
  await test.step(`lisää oppimateriaali koulutusasteelle korkeakoulutus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, ['korkeakoulutus'])
  })
  await test.step(`lisää oppimateriaali koulutusasteelle taiteen perusopetus`, async () => {
    await lisaaJaMuokkaaOppimateriaalia(page, ['taiteen perusopetus'])
  })
})

test('käyttäjä voi lisätä oppimateriaaleja eri kielillä', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()

  const materiaalienNimet: string[] = []

  const lisaaOppimateriaaliKielella = async (kieli: string) => {
    const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
    const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
    const { form, randomMateriaaliNimi } = uusiMateriaali
    const materiaaliNimi = randomMateriaaliNimi(`Materiaali ${kieli}`)
    materiaalienNimet.push(materiaaliNimi)

    await form.oppimateriaalinNimi(materiaaliNimi)
    await form.lisaaTiedosto()
    await form.valitseTiedostonKieli(kieli)

    const perustiedot = await form.seuraava()
    await perustiedot.lisaaHenkilo()
    await perustiedot.lisaaAsiasana()
    await perustiedot.lisaaOppimateriaalinTyyppi()
    await perustiedot.lisaaPaaasiallinenKohderyhma()
    await perustiedot.lisaaPaaasiallinenKayttotarkoitus()

    const koulutustiedot = await perustiedot.seuraava()
    await koulutustiedot.valitseKoulutusasteet('korkeakoulutus')

    const tarkemmatTiedot = await koulutustiedot.seuraava()
    const lisenssitiedot = await tarkemmatTiedot.seuraava()
    await lisenssitiedot.valitseLisenssi()

    const hyodynnetytMateriaalit = await lisenssitiedot.seuraava()
    const esikatseluJaTallennus = await hyodynnetytMateriaalit.seuraava()
    await esikatseluJaTallennus.tallenna(materiaaliNimi)
  }

  await test.step(`lisää oppimateriaali kielellä inarinsaame`, async () => {
    await lisaaOppimateriaaliKielella('inarinsaame')
  })
  await test.step(`lisää oppimateriaali kielellä viro`, async () => {
    await lisaaOppimateriaaliKielella('viro')
  })
  await test.step(`lisää oppimateriaali kielellä ruotsi`, async () => {
    await lisaaOppimateriaaliKielella('ruotsi')
  })
  await test.step(`lisää oppimateriaali kielellä suomi`, async () => {
    await lisaaOppimateriaaliKielella('suomi')
  })

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
