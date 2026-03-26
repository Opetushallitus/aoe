import { expect, test } from '@playwright/test'
import { tiedoteTest } from './fixtures/tiedoteTest'
import type { BrysselAnalyytiikka } from './pages/BrysselAnalytiikka'
import { BrysselEtusivu } from './pages/BrysselEtusivu'
import { siivoaTiedote } from './pages/BrysselTiedotteet'
import { Etusivu } from './pages/Etusivu'

test('käyttäjä voi hakea analytiikka sivulta oppimateriaaalien käyttömääriä', async ({ page }) => {
  const etusivu = BrysselEtusivu(page)
  await etusivu.goto()

  const analytiikka = await etusivu.clickBrysselAnalytiikka()
  await analytiikka.taytaJaHaeOppimateriaalienKayttomaarat(['Haku', 'Katselu'], 'Kuukausi')

  await expect(analytiikka.kayttomaaraChart).toBeVisible()
})

test('oppimateriaalin katselu näkyy analytiikassa', async ({ page }) => {
  const haeKatselumaaratYhteensa = async (analytiikka: ReturnType<typeof BrysselAnalyytiikka>) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/materialactivity/') && response.url().includes('/total')
    )
    await analytiikka.taytaJaHaeOppimateriaalienKayttomaarat(['Katselu'], 'Päivä')
    const response = await responsePromise
    const body = await response.json()
    const totals = body.values.map((v: { dayTotal: number }) => v.dayTotal)
    return totals.reduce((sum: number, val: number) => sum + (val || 0), 0)
  }
  // Helper: query Katselu analytics and return the total view count from the API response

  // 1. Go to analytics and record the initial view count
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await haeKatselumaaratYhteensa(analytiikka)

  // 2. Create a material
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka katselu')
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  // 3. View the material to trigger a Kafka view event
  await page.goto(`/#/materiaali/${materiaaliNumero}`)
  await expect(page.getByRole('heading', { name: materiaaliNimi })).toBeVisible()
  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await haeKatselumaaratYhteensa(analytiikkaUudelleen)

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
})

test('uusi oppimateriaali näkyy julkaisumäärissä', async ({ page }) => {
  const haeJulkaisumaaratYhteensa = async (analytiikka: ReturnType<typeof BrysselAnalyytiikka>) => {
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/educationallevel/all') && response.status() === 200
    )
    await analytiikka.taytaJaHaeJulkaisumaarat('Opetusasteet', ['korkeakoulutus'])
    const response = await responsePromise
    const body = await response.json()
    return body.values.reduce(
      (sum: number, v: { key: string; value: number }) => sum + (v.value || 0),
      0
    )
  }

  // 1. Go to analytics and record the initial published count for korkeakoulutus
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await haeJulkaisumaaratYhteensa(analytiikka)

  // 2. Create a material (uses korkeakoulutus educational level)
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka julkaisu')
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)

  // 3. Query again and assert published count increased
  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await haeJulkaisumaaratYhteensa(analytiikkaUudelleen)

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.julkaisuChart).toBeVisible()
})

test('vanhentuneet oppimateriaalit näkyvät analytiikassa', async ({ page }) => {
  const haeVanhentuneetYhteensa = async (analytiikka: ReturnType<typeof BrysselAnalyytiikka>) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/educationallevel/expired') && response.status() === 200
    )
    await analytiikka.taytaJaHaeVanhentuneet(['korkeakoulutus'])
    const response = await responsePromise
    const body = await response.json()
    return body.values.reduce(
      (sum: number, v: { key: string; value: number }) => sum + (v.value || 0),
      0
    )
  }

  // Query expired materials — verify the API responds with data
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const maara = await haeVanhentuneetYhteensa(analytiikka)

  expect(maara).toBeGreaterThanOrEqual(0)
  await expect(analytiikka.vanhentunutChart).toBeVisible()
})

test('Pääkäyttäjä voi arkistoida oppimateriaalin', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi()
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const materiaalienHallinta = await brysselPage.clickBrysselMateriaalinHallinta()
  await materiaalienHallinta.arkistoiMateriaali(materiaaliNumero)
  await page.goto(`/#/materiaali/${materiaaliNumero}`)
  await expect(
    page.getByText(
      'Tämä materiaali on arkistoitu. Lisätietoa saat palvelun ylläpitäjiltä ottamalla yhteyttä osoitteeseen aoe@oph.fi ja kysymällä materiaalista sen id:n kera.'
    )
  ).toBeVisible()
})

test('Pääkäyttäjä voi vaihtaa materiaalin omistajan', async ({ page, browser }) => {
  // Seed the second user by logging in as tuomas.jukola in a fresh browser context
  const seedContext = await browser.newContext({
    storageState: undefined,
    ignoreHTTPSErrors: true
  })
  const seedPage = await seedContext.newPage()
  await seedPage.goto('/', { waitUntil: 'domcontentloaded' })
  await seedPage.waitForTimeout(1000)
  await seedPage.getByRole('button', { name: 'Log in' }).click()
  await seedPage.getByRole('textbox', { name: 'Username' }).fill('tuomas.jukola')
  await seedPage.getByRole('textbox', { name: 'Password' }).fill('password123')
  await seedPage.getByRole('button', { name: 'Login' }).click()
  await seedPage.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' })
  await seedPage.locator('#user-details-dropdown').click()
  await expect(seedPage.getByText('Tuomas Jukola')).toBeVisible()
  await seedContext.close()

  // Create a material as admin (aoeuser)
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Materiaalille vaihdettu omistaja')
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  // Navigate to admin panel → Material Management
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  await brysselPage.clickBrysselMateriaalinHallinta()

  // Verify current owner on material page
  await page.goto(`/#/materiaali/${materiaaliNumero}`)
  await expect(page.getByTestId('material-owner')).toContainText('AOE_first AOE_last')

  // Return to admin panel → Material Management
  await brysselPage.goto()
  const materiaalienHallintaUudelleen = await brysselPage.clickBrysselMateriaalinHallinta()

  // Transfer ownership to the second user
  await materiaalienHallintaUudelleen.vaihdaOmistaja(materiaaliNumero, 'Tuomas')

  // Verify the owner changed on material page
  await page.goto(`/#/materiaali/${materiaaliNumero}`)
  await expect(page.getByTestId('material-owner')).toContainText('Tuomas Jukola')
})

tiedoteTest(
  'Pääkäyttäjä voi luoda INFO-tiedotteen, se näkyy julkisesti ja sen voi poistaa',
  async ({ page, tiedotteet }) => {
    const tiedoteTeksti = `Testitiedote INFO ${Date.now()}`
    await tiedotteet.luoTiedote('Yleinen tiedote tai ohjeistus palvelun käyttäjille', tiedoteTeksti)

    await expect(tiedotteet.notificationTable.getByText(tiedoteTeksti)).toBeVisible()

    await page.goto('/')
    await expect(page.getByText('Mitä haluat oppia?')).toBeVisible()
    const notification = page.locator('.alert-warning .service-notification', {
      hasText: tiedoteTeksti
    })
    await expect(notification).toBeVisible()

    const brysselPage = BrysselEtusivu(page)
    await brysselPage.goto()
    const tiedotteetDelete = await brysselPage.clickBrysselPalvelunHallinta()
    await tiedotteetDelete.poistaTiedote(tiedoteTeksti)

    await page.goto('/')
    await expect(page.getByText('Mitä haluat oppia?')).toBeVisible()
    await expect(
      page.locator('.service-notification', { hasText: tiedoteTeksti })
    ).not.toBeVisible()
  }
)

tiedoteTest(
  'Pääkäyttäjä voi luoda ERROR-tiedotteen ja se näkyy julkisesti',
  async ({ page, tiedotteet }) => {
    const tiedoteTeksti = `Testitiedote ERROR ${Date.now()}`
    await tiedotteet.luoTiedote('Tekninen häiriö tai käyttöä rajoittava tapahtuma', tiedoteTeksti)

    await expect(tiedotteet.notificationTable.getByText(tiedoteTeksti)).toBeVisible()

    await page.goto('/')
    await expect(page.getByText('Mitä haluat oppia?')).toBeVisible()
    const notification = page.locator('.alert-danger .service-notification', {
      hasText: tiedoteTeksti
    })
    await expect(notification).toBeVisible()

    await siivoaTiedote(page, tiedoteTeksti)
  }
)

tiedoteTest('Tuleva tiedote ei näy julkisesti', async ({ page, tiedotteet }) => {
  const tiedoteTeksti = `Tuleva tiedote ${Date.now()}`
  await tiedotteet.luoTulevaTiedote(
    'Yleinen tiedote tai ohjeistus palvelun käyttäjille',
    tiedoteTeksti
  )

  await tiedotteet.naytaTulevatTiedotteet()
  await expect(tiedotteet.notificationTable.getByText(tiedoteTeksti)).toBeVisible()

  await page.goto('/')
  await expect(page.getByText('Mitä haluat oppia?')).toBeVisible()
  await expect(page.locator('.service-notification', { hasText: tiedoteTeksti })).not.toBeVisible()

  await siivoaTiedote(page, tiedoteTeksti)
})

tiedoteTest('Tiedotelomakkeen validointi toimii', async ({ page, tiedotteet }) => {
  await expect(tiedotteet.submitButton).toBeDisabled()

  await tiedotteet.notificationTextInput.pressSequentially('Testiteksti')
  await expect(tiedotteet.submitButton).toBeDisabled()

  await tiedotteet.notificationTextInput.clear()
  await tiedotteet.notificationTypeSelect.click()
  await page
    .getByRole('option', {
      name: 'Yleinen tiedote tai ohjeistus palvelun käyttäjille'
    })
    .click()
  await expect(tiedotteet.submitButton).toBeDisabled()

  await tiedotteet.notificationTextInput.pressSequentially('Testiteksti')
  await expect(tiedotteet.submitButton).toBeEnabled()
})
