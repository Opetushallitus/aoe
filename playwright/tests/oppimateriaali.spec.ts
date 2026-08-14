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

test('kohderyhmän ikä säilyy kun materiaalia muokataan ikäkenttiin koskematta', async ({
  page
}) => {
  const targetAgeMin = '7'
  const targetAgeMax = '12'

  await Etusivu(page).goto()
  const { nimi: materialName, materiaali } = await luoMateriaali(page, 'Kohderyhmän ikä', {
    tarkemmatTiedot: { ikaMin: targetAgeMin, ikaMax: targetAgeMax }
  })
  await materiaali.expectTargetAgeRange(targetAgeMin, targetAgeMax)
  const materialId = await materiaali.getMateriaaliNumero()

  const listing = await tarkastaMateriaalitLoytyy(page, materialName)
  const editForm = (await listing.startToEditMateriaaliNumero(materialId)).form

  // Regression: the age range is stored in INTEGER columns, so GET hands it back as a
  // number and the wizard patches that straight into its text inputs. Walking through to
  // save without retyping the fields PUTs numbers back, which used to be rejected as 400.
  // Stepped through explicitly rather than via siirryEsikatseluun(): only the files step
  // waits for the upload to finish, and the age fields must be passed by untouched.
  const perustiedot = await editForm.seuraava()
  const koulutustiedot = await perustiedot.seuraava()
  const tarkemmatTiedot = await koulutustiedot.seuraava()
  const lisenssitiedot = await tarkemmatTiedot.seuraava()
  const hyodynnetytMateriaalit = await lisenssitiedot.seuraava()
  const preview = await hyodynnetytMateriaalit.seuraava()
  const saved = await preview.tallenna(materialName)
  await saved.expectTargetAgeRange(targetAgeMin, targetAgeMax)
})

test('epäonnistunut tallennus näyttää virheen eikä tyhjennä esikatselua', async ({ page }) => {
  await Etusivu(page).goto()
  const { nimi: materialName, materiaali } = await luoMateriaali(page, 'Tallennusvirhe')
  const materialId = await materiaali.getMateriaaliNumero()

  const listing = await tarkastaMateriaalitLoytyy(page, materialName)
  const editForm = (await listing.startToEditMateriaaliNumero(materialId)).form
  const perustiedot = await editForm.seuraava()
  const koulutustiedot = await perustiedot.seuraava()
  const tarkemmatTiedot = await koulutustiedot.seuraava()
  const lisenssitiedot = await tarkemmatTiedot.seuraava()
  const hyodynnetytMateriaalit = await lisenssitiedot.seuraava()
  const preview = await hyodynnetytMateriaalit.seuraava()

  // Force the metadata save to fail, so the failure path is exercised without depending on
  // whichever backend error happens to be reachable.
  await page.route(`**/api/v1/material/${materialId}`, async (route) => {
    if (route.request().method() !== 'PUT') {
      return route.fallback()
    }
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'forced failure' })
    })
  })

  await preview.submitExpectingFailure()
  await preview.expectSaveError()

  // Building the request body used to delete fields straight off the shared wizard state. The
  // preview only reads that state in ngOnInit, so the damage shows on re-entry — which is what
  // the user hits when they step back to fix something and retry.
  const previewAgain = await (await preview.edellinen()).seuraava()
  await previewAgain.expectFilesStillListed()
})

test('tiedostovaiheen toistuva lähetys ei jätä tiedostoa ilman id:tä', async ({ page }) => {
  test.setTimeout(3 * 60 * 1000)

  await Etusivu(page).goto()
  const { nimi: materialName, materiaali } = await luoMateriaali(page, 'Kaksoislähetys')
  const materialId = await materiaali.getMateriaaliNumero()

  const listing = await tarkastaMateriaalitLoytyy(page, materialName)
  const editForm = (await listing.startToEditMateriaaliNumero(materialId)).form

  // Hold every upload open so a second "Seuraava" lands while the first batch is still in
  // flight. That is the production incident (AOE-122 follow-up): each pending file was
  // uploaded twice, the completed-upload counter hit its target on the duplicates, and the
  // step advanced while two rows had never been given their material id.
  const uploads: string[] = []
  await page.route('**/material/file/*/upload', async (route) => {
    uploads.push(route.request().url())
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await route.continue()
  })

  const savedBodies: { fileDetails?: { id: unknown }[]; materials?: { materialId: unknown }[] }[] =
    []
  page.on('request', (request) => {
    if (request.method() === 'PUT' && /\/material\/\d+$/.test(request.url())) {
      savedBodies.push(request.postDataJSON())
    }
  })

  await editForm.lisaaUusiTiedostoRivi('aoe_test_file.pdf')
  await editForm.lisaaUusiTiedostoRivi('test-image.png')

  const seuraava = page.getByRole('button', { name: 'Seuraava' })
  await seuraava.click()
  await seuraava.click()
  await page.waitForURL(/\/2$/, { timeout: 120_000 })

  // One upload per added file. Uploading a file twice creates a second orphaned material
  // row, and it is the racing responses that strand a row without an id.
  expect(uploads).toHaveLength(2)

  // tallenna() only resolves once the material page renders, so reaching it is the
  // assertion that the save went through.
  const preview = await editForm.siirryEsikatseluun()
  await preview.tallenna(materialName)

  // A row without an id reaches Postgres as the string "null" against a bigint column and
  // aborts the whole update, so the save can only ever fail. It must never be sent.
  expect(savedBodies).toHaveLength(1)
  const [savedBody] = savedBodies
  expect(savedBody.fileDetails?.map((file) => file.id)).not.toContain(null)
  expect(savedBody.materials?.map((material) => material.materialId)).not.toContain(null)
})

test('tiedostovaiheen osittain epäonnistuneen latauksen voi yrittää uudelleen', async ({
  page
}) => {
  test.setTimeout(3 * 60 * 1000)

  await Etusivu(page).goto()
  const { nimi: materialName, materiaali } = await luoMateriaali(page, 'Latauksen uudelleenyritys')
  const materialId = await materiaali.getMateriaaliNumero()

  const listing = await tarkastaMateriaalitLoytyy(page, materialName)
  const editForm = (await listing.startToEditMateriaaliNumero(materialId)).form

  let uploadAttempts = 0
  await page.route('**/material/file/*/upload', async (route) => {
    uploadAttempts += 1
    if (uploadAttempts === 2) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'forced upload failure' })
      })
      return
    }
    await route.continue()
  })

  await editForm.lisaaUusiTiedostoRivi('aoe_test_file.pdf')
  await editForm.lisaaUusiTiedostoRivi('test-image.png')

  const seuraava = page.getByRole('button', { name: 'Seuraava' })
  await seuraava.click()
  await expect(page.getByText('Osa latauksista keskeytyi tai epäonnistui')).toBeVisible({
    timeout: 120_000
  })

  await seuraava.click()
  await page.waitForURL(/\/2$/, { timeout: 120_000 })
  expect(uploadAttempts).toBe(3)
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
  const TwoMinutesInMs = 2 * 60 * 1000
  test.setTimeout(TwoMinutesInMs)

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
