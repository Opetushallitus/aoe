import { expect, test } from '@playwright/test'
import { BrysselEtusivu } from './pages/BrysselEtusivu'
import { Etusivu } from './pages/Etusivu'

test('käyttäjä voi hakea analytiikka sivulta oppimateriaaalien käyttömääriä', async ({ page }) => {
  const etusivu = BrysselEtusivu(page)
  await etusivu.goto()

  const analytiikka = await etusivu.clickBrysselAnalytiikka()
  await analytiikka.taytaJaHaeOppimateriaalienKayttomaarat(['Haku', 'Katselu'], 'Kuukausi')

  await expect(analytiikka.kayttomaaraChart).toBeVisible()
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
  const materiaalienHallinta = await brysselPage.clickBrysselMateriaalinHallinta()

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
test('Pääkäyttäjä voi luoda INFO-tiedotteen ja se näkyy julkisesti', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const tiedotteet = await brysselPage.clickBrysselPalvelunHallinta()

  const tiedoteTeksti = `Testitiedote INFO ${Date.now()}`
  await tiedotteet.luoTiedote('Yleinen tiedote tai ohjeistus palvelun käyttäjille', tiedoteTeksti)

  // Verify notification appears in admin table
  await expect(tiedotteet.notificationTable.getByText(tiedoteTeksti)).toBeVisible()

  // Verify notification appears publicly as warning banner
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const notification = page.locator('.alert-warning .service-notification', { hasText: tiedoteTeksti })
  await expect(notification).toBeVisible()

  // Cleanup: delete the notification
  await brysselPage.goto()
  const tiedotteetCleanup = await brysselPage.clickBrysselPalvelunHallinta()
  await tiedotteetCleanup.poistaTiedote(tiedoteTeksti)
})
test('Pääkäyttäjä voi luoda ERROR-tiedotteen ja se näkyy julkisesti', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const tiedotteet = await brysselPage.clickBrysselPalvelunHallinta()

  const tiedoteTeksti = `Testitiedote ERROR ${Date.now()}`
  await tiedotteet.luoTiedote('Tekninen häiriö tai käyttöä rajoittava tapahtuma', tiedoteTeksti)

  // Verify notification appears in admin table
  await expect(tiedotteet.notificationTable.getByText(tiedoteTeksti)).toBeVisible()

  // Verify notification appears publicly as danger banner
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const notification = page.locator('.alert-danger .service-notification', { hasText: tiedoteTeksti })
  await expect(notification).toBeVisible()

  // Cleanup
  await brysselPage.goto()
  const tiedotteetCleanup = await brysselPage.clickBrysselPalvelunHallinta()
  await tiedotteetCleanup.poistaTiedote(tiedoteTeksti)
})
test('Pääkäyttäjä voi poistaa tiedotteen ja se katoaa julkisesta näkymästä', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const tiedotteet = await brysselPage.clickBrysselPalvelunHallinta()

  const tiedoteTeksti = `Poistettava tiedote ${Date.now()}`
  await tiedotteet.luoTiedote('Yleinen tiedote tai ohjeistus palvelun käyttäjille', tiedoteTeksti)

  // Verify it's visible publicly
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.service-notification', { hasText: tiedoteTeksti })).toBeVisible()

  // Delete it
  await brysselPage.goto()
  const tiedotteetDelete = await brysselPage.clickBrysselPalvelunHallinta()
  await tiedotteetDelete.poistaTiedote(tiedoteTeksti)

  // Verify it's gone publicly
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.service-notification', { hasText: tiedoteTeksti })).not.toBeVisible()
})
