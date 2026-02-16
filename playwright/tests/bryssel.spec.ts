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
  // Seed the second user by logging in as aoeuser2 in a fresh browser context
  const seedContext = await browser.newContext({
    storageState: undefined,
    ignoreHTTPSErrors: true
  })
  const seedPage = await seedContext.newPage()
  await seedPage.goto('/', { waitUntil: 'domcontentloaded' })
  await seedPage.waitForTimeout(1000)
  await seedPage.getByRole('button', { name: 'Log in' }).click()
  await seedPage.getByRole('textbox', { name: 'Username' }).fill('aoeuser2')
  await seedPage.getByRole('textbox', { name: 'Password' }).fill('password123')
  await seedPage.getByRole('button', { name: 'Login' }).click()
  await seedPage.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' })
  await seedPage.locator('#user-details-dropdown').click()
  await expect(seedPage.getByText('Test_first Test_last')).toBeVisible()
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

  // Verify current owner is the admin user
  const alkuperainenOmistaja = await materiaalienHallinta.getOmistajanNimi(materiaaliNumero)
  expect(alkuperainenOmistaja).toContain('AOE_first AOE_last')

  // Transfer ownership to the second user
  await materiaalienHallinta.vaihdaOmistaja(materiaaliNumero, 'Test_first')

  // Verify the owner changed by re-querying the material info
  const uusiOmistaja = await materiaalienHallinta.getOmistajanNimi(materiaaliNumero)
  expect(uusiOmistaja).toContain('Test_first Test_last')
})
