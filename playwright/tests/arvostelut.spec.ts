import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import { Materiaali } from './pages/Materiaali'

test('materiaalin arvostelu ja arvostelujen näkyvyys kirjautumattomalle käyttäjälle', async ({
  page,
  browser,
}) => {
  // Phase 1: Create material as aoeuser (pre-authenticated via storageState)
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi(
    'Arvosteltava materiaali',
  )
  const materiaali =
    await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  // Phase 2: Log in as tuomas.jukola and submit a review
  const reviewerContext = await browser.newContext({
    storageState: undefined,
    ignoreHTTPSErrors: true,
  })
  const reviewerPage = await reviewerContext.newPage()
  await reviewerPage.goto('/', { waitUntil: 'domcontentloaded' })
  await reviewerPage.waitForTimeout(1000)
  await reviewerPage.getByRole('button', { name: 'Log in' }).click()
  await reviewerPage
    .getByRole('textbox', { name: 'Username' })
    .fill('tuomas.jukola')
  await reviewerPage
    .getByRole('textbox', { name: 'Password' })
    .fill('password123')
  await reviewerPage.getByRole('button', { name: 'Login' }).click()
  await reviewerPage.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' })

  // Set language to Finnish
  await reviewerPage
    .getByRole('button', { name: 'Suomi: Vaihda kieli suomeksi' })
    .click()

  // Accept terms of service if prompted (first login for this user)

  // Navigate to the material page and submit a review
  await reviewerPage.goto(`/#/materiaali/${materiaaliNumero}`, {
    waitUntil: 'domcontentloaded',
  })
  const reviewerMateriaali = Materiaali(reviewerPage)
  try {
    await reviewerPage.getByText('Olen lukenut').click({ timeout: 1000 })
    await reviewerPage.getByRole('button', { name: 'Tallenna' }).click()
    await reviewerPage.goto(`/#/materiaali/${materiaaliNumero}`, {
      waitUntil: 'domcontentloaded',
    })
  } catch (_e) {
    console.log('Terms of Service already accepted, skipping')
  }
  await reviewerMateriaali.lisaaArvio({
    ratingContent: '4',
    ratingVisual: '5',
    feedbackPositive: 'Erittäin hyvä ja selkeä materiaali',
    feedbackSuggest: 'Voisi olla enemmän esimerkkejä',
    feedbackPurpose: 'Käytin opetuksessa',
  })

  await reviewerContext.close()

  // Phase 3: Verify reviews as anonymous (unauthenticated) user
  const anonContext = await browser.newContext({
    storageState: undefined,
    ignoreHTTPSErrors: true,
  })
  const anonPage = await anonContext.newPage()

  // 3a: Check reviews on material page
  await anonPage.goto(`/#/materiaali/${materiaaliNumero}`, {
    waitUntil: 'domcontentloaded',
  })
  // Set language to Finnish
  await anonPage
    .getByRole('button', { name: 'Suomi: Vaihda kieli suomeksi' })
    .click()

  const anonMateriaali = Materiaali(anonPage)

  // Verify review averages show the correct values on the material page
  await expect(anonMateriaali.sisaltoAverage).toContainText('4.0')
  await expect(anonMateriaali.ulkoasuAverage).toContainText('5.0')

  // 3b: Navigate to all reviews page
  await anonMateriaali.clickKatsoKaikkiArviot()
  await anonPage.waitForURL(`/#/materiaali/${materiaaliNumero}/arvostelut`, {
    waitUntil: 'domcontentloaded',
  })

  // Verify review details on arvostelut page
  const arvostelu = anonPage.locator('.rating')
  await expect(arvostelu.locator('.author')).toContainText('Tuomas Jukola')
  await expect(arvostelu.locator('.number-rating .value').nth(0)).toContainText('4')
  await expect(arvostelu.locator('.number-rating .value').nth(1)).toContainText('5')
  await expect(
    arvostelu.getByText('Erittäin hyvä ja selkeä materiaali'),
  ).toBeVisible()
  await expect(
    arvostelu.getByText('Voisi olla enemmän esimerkkejä'),
  ).toBeVisible()
  await expect(arvostelu.getByText('Käytin opetuksessa')).toBeVisible()

  // Verify averages in the summary section
  const averages = anonPage.locator('.averages')
  await expect(averages.locator('.number-rating .value').nth(0)).toContainText('4.0')
  await expect(averages.locator('.number-rating .value').nth(1)).toContainText('5.0')

  await anonContext.close()
})
