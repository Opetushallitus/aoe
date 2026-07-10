import { expect, test, type Page } from '@playwright/test'
import * as os from 'node:os'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { Etusivu } from './pages/Etusivu'
import type { TaytaOpts } from './pages/UusiOppimateriaali'
import { OVER_LIMIT_BYTES, createSparsePdf, expectFileTooLargeError } from './helpers/bigFile'

// Precondition: goto has run so the nav link is reachable.
const luoMateriaali = async (page: Page, prefix?: string, opts: TaytaOpts = {}) => {
  const omatMateriaalit = await Etusivu(page).header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const nimi = uusiMateriaali.randomMateriaaliNimi(prefix)
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(nimi, opts)
  return { nimi, materiaali }
}

// Returns the listing page object so the caller can chain into edit, etc.
const tarkastaMateriaalitLoytyy = async (page: Page, ...nimet: string[]) => {
  const omatMateriaalit = await Etusivu(page).header.clickOmatMateriaalit()
  await expect(omatMateriaalit.locators.julkaistutMateriaalitHeading).toBeVisible()
  for (const nimi of nimet) {
    await omatMateriaalit.expectToFindMateriaali(nimi)
  }
  return omatMateriaalit
}

test('käyttäjä voi lisätä ja muokata oppimateriaalia', async ({ page }) => {
  const bigPdf = path.join(os.tmpdir(), `aoe-big-edit-${process.pid}.pdf`)
  createSparsePdf(bigPdf, OVER_LIMIT_BYTES)
  try {
    await Etusivu(page).goto()
    const { nimi: materiaaliNimi, materiaali } = await luoMateriaali(page)
    const materiaaliNumero = await materiaali.getMateriaaliNumero()
    const omatMateriaalit = await tarkastaMateriaalitLoytyy(page, materiaaliNimi)

    const materiaaliNimiMuutettu = `${materiaaliNimi}_muutettu`
    const muokkaaMateriaalia = await omatMateriaalit.startToEditMateriaaliNumero(materiaaliNumero)

    // Editing opens on the files step: a brand-new file slot must reject an over-5GB file.
    await page.getByRole('button', { name: 'Lisää tiedosto' }).click()
    const uusiTiedosto = page.locator('input[type="file"]').last()
    await uusiTiedosto.setInputFiles(bigPdf)
    await expectFileTooLargeError(page)
    await expect(uusiTiedosto).toHaveValue('')
    // Drop the now-empty slot so it can't block navigation to save.
    await page.getByRole('button', { name: 'Poista' }).last().click()

    const muokkausForm = muokkaaMateriaalia.form
    await muokkausForm.oppimateriaalinNimi(materiaaliNimiMuutettu)
    const esikatseluJaTallennut = await muokkausForm.siirryEsikatseluun()
    await esikatseluJaTallennut.tallenna(materiaaliNimiMuutettu)
  } finally {
    fs.rmSync(bigPdf, { force: true })
  }
})

test('käyttäjä voi lisätä oppimateriaaleja eri koulutusasteille', async ({ page }) => {
  const TwoMinutesInMs = 2 * 60 * 1000
  test.setTimeout(TwoMinutesInMs)

  await Etusivu(page).goto()
  const materiaalienNimet: string[] = []

  const lisaaMateriaali = async (nimiOsa: string, opts: TaytaOpts) => {
    const { nimi } = await luoMateriaali(page, `Materiaali ${nimiOsa}`, opts)
    materiaalienNimet.push(nimi)
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
    // Fields not tied to a level (kohderyhmä, kuvaus, saavutettavuus, hyödynnetyt, …) are
    // exercised by the "kaikki kentät" test; here we keep only the korkeakoulutus-specific
    // bits: the separate organisaatio row and tieteenala.
    await lisaaMateriaali('korkeakoulutus', {
      perustiedot: { organisaatio: 'Opetushallitus' },
      koulutustiedot: { koulutusasteet: ['korkeakoulutus'], tieteenala: 'Metsätiede' }
    })
  })
  await test.step(`lisää oppimateriaali koulutusasteelle taiteen perusopetus`, async () => {
    await lisaaMateriaali('taiteen perusopetus', {
      koulutustiedot: { koulutusasteet: ['taiteen perusopetus'] }
    })
  })

  await test.step(`tarkasta materiaalien löytyminen`, async () => {
    await tarkastaMateriaalitLoytyy(page, ...materiaalienNimet)
  })
})

test('käyttäjä voi lisätä oppimateriaaleja eri kielillä', async ({ page }) => {
  await Etusivu(page).goto()
  const materiaalienNimet: string[] = []

  for (const kieli of ['inarinsaame', 'viro', 'ruotsi', 'suomi']) {
    await test.step(`lisää oppimateriaali kielellä ${kieli}`, async () => {
      const { nimi } = await luoMateriaali(page, `Materiaali ${kieli}`, { tiedostot: [{ kieli }] })
      materiaalienNimet.push(nimi)
    })
  }

  await test.step(`tarkasta materiaalien löytyminen`, async () => {
    await tarkastaMateriaalitLoytyy(page, ...materiaalienNimet)
  })
})

test('käyttäjä voi päivittää materiaalista kaikki linkit kerralla ja julkaista materiaalit', async ({
  page
}) => {
  await Etusivu(page).goto()
  const omatMateriaalit = await Etusivu(page).header.clickOmatMateriaalit()
  const uusiVerkkosivuMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiVerkkosivuMateriaali.randomMateriaaliNimi()
  const materiaali = await uusiVerkkosivuMateriaali.taytaJaTallennaUusiVerkkosivuMateriaali(
    materiaaliNimi,
    'https://example.com'
  )

  const materiaaliNumero = await materiaali.getMateriaaliNumero()
  const listaus = await tarkastaMateriaalitLoytyy(page, materiaaliNimi)

  const muokkaaMateriaalia = await listaus.startToEditMateriaaliNumero(materiaaliNumero)
  const muokkausForm = muokkaaMateriaalia.form
  await muokkausForm.muokkaaVerkkoSivu('https://example.org')
  const esikatseluJaTallennut = await muokkausForm.siirryEsikatseluun()
  await esikatseluJaTallennut.tallenna(materiaaliNimi)
})

test('käyttäjä voi luoda materiaalin melkein kaikki kentät täytettynä', async ({ page }) => {
  await Etusivu(page).goto()
  const { nimi } = await luoMateriaali(page, 'Kaikki kentät', {
    tiedostot: [{ kieliversiot: { en: 'blank eng', sv: 'blank sv' } }],
    perustiedot: {
      tekijanOrganisaatio: '3D Group Oy',
      kohderyhma: 'Huoltaja',
      kayttotarkoitus: 'Interaktiivinen materiaali',
      kuvaus: 'Testi materiaali missä on kaikki kentät käytössä',
      kansikuva: true
    },
    koulutustiedot: { koulutusasteet: ['varhaiskasvatus'] },
    tarkemmatTiedot: {
      ominaisuudet: ['tekstitys'],
      esteet: ['välähtely'],
      ikaMin: '18',
      ikaMax: '20',
      opiskeluaika: '1h 30 min',
      julkaisija: 'otava',
      esitietovaatimus: 'matikka'
    },
    hyodynnetytMateriaalit: {
      author: 'koira hyödyntäjä',
      url: 'https://www.google.com',
      name: 'google'
    }
  })

  // Verify the user-uploaded thumbnail is shown (served from the backend API, not a default).
  await expect(page.locator('img[alt="Oppimateriaalin kansikuva"][src*="/api/"]')).toBeVisible()

  await tarkastaMateriaalitLoytyy(page, nimi)
})

test('käyttäjä voi luoda kokoelman ja julkaista sen', async ({ page }) => {
  await Etusivu(page).goto()
  const { nimi, materiaali } = await luoMateriaali(page)
  const kokoelmaName = `Testikokoelma-${nimi}`
  await materiaali.lisaaKokoelmaan(kokoelmaName)
  const omatMateriaalitPage = await Etusivu(page).header.clickOmatMateriaalit()
  const kokoelmaEditPage = await omatMateriaalitPage.startToEditKokoelma(kokoelmaName)
  const kokoelmaPage = await kokoelmaEditPage.julkaiseKokoelma()
  const kokoelmatPage = await kokoelmaPage.header.clickKokoelmat()
  await expect(await kokoelmatPage.kokoelmaByName(kokoelmaName)).toContainText(
    'Kokoelma on luotu Playwright testissä.'
  )
})
