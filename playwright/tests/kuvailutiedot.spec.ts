import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import { SocialMetadataModal } from './pages/SocialMetadataModal'

test('toinen käyttäjä voi lisätä kuvailutietoja toisen käyttäjän materiaaliin', async ({
  page,
  browser
}) => {
  // Phase 1: Create material as aoeuser (pre-authenticated via storageState)
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Kuvailutiedot materiaali')
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  // Phase 2: Log in as tuomas.jukola and add kuvailutietoja
  const metadataContext = await browser.newContext({
    storageState: undefined,
    ignoreHTTPSErrors: true
  })
  const metadataPage = await metadataContext.newPage()
  await metadataPage.goto('/', { waitUntil: 'domcontentloaded' })
  await metadataPage.waitForTimeout(1000)
  await metadataPage.getByRole('button', { name: 'Log in' }).click()
  await metadataPage.getByRole('textbox', { name: 'Username' }).fill('tuomas.jukola')
  await metadataPage.getByRole('textbox', { name: 'Password' }).fill('password123')
  await metadataPage.getByRole('button', { name: 'Login' }).click()
  await metadataPage.waitForURL('/#/etusivu', {
    waitUntil: 'domcontentloaded'
  })

  // Set language to Finnish
  await metadataPage.getByRole('button', { name: 'Suomi: Vaihda kieli suomeksi' }).click()

  // Navigate to the material page
  await metadataPage.goto(`/#/materiaali/${materiaaliNumero}`, {
    waitUntil: 'domcontentloaded'
  })

  // Accept terms of service if prompted (first login for this user)
  try {
    await metadataPage.getByText('Olen lukenut').click({ timeout: 1000 })
    await metadataPage.getByRole('button', { name: 'Tallenna' }).click()
    await metadataPage.goto(`/#/materiaali/${materiaaliNumero}`, {
      waitUntil: 'domcontentloaded'
    })
  } catch (_e) {
    console.log('Terms of Service already accepted, skipping')
  }

  // Click "Lisää kuvailutietoja" to open the modal
  await metadataPage.getByRole('button', { name: 'Lisää kuvailutietoja' }).click()

  // Fill all metadata fields
  const socialMetadata = SocialMetadataModal(metadataPage)
  await socialMetadata.lisaaAsiasana('PDF')
  await socialMetadata.lisaaSaavutettavuusominaisuus('tekstitys')
  await socialMetadata.lisaaSaavutettavuuseste('ei esteitä')
  await socialMetadata.lisaaKoulutusaste('korkeakoulutus')
  await socialMetadata.tallenna()

  // Phase 3: Verify metadata values are visible as buttons in the social metadata section
  await expect(
    metadataPage.getByText('Käyttäjien mielestä tämä materiaali soveltuu myös:')
  ).toBeVisible()
  await expect(
    metadataPage.locator('button[aria-labelledby="socialMetadata-keywords"]', { hasText: 'PDF' })
  ).toBeVisible()
  await expect(
    metadataPage.locator('button[aria-labelledby="socialMetadata-accessibilityFeatures"]', {
      hasText: 'tekstitys'
    })
  ).toBeVisible()
  await expect(
    metadataPage.locator('button[aria-labelledby="socialMetadata-accessibilityHazards"]', {
      hasText: 'ei esteitä'
    })
  ).toBeVisible()
  await expect(
    metadataPage.locator('button[aria-labelledby="socialMetadata-educationalLevels"]', {
      hasText: 'korkeakoulutus'
    })
  ).toBeVisible()

  await metadataContext.close()
})
