import { test } from './a11yFixture'
import { devices, expect } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import { Materiaali } from './pages/Materiaali'
import { checkA11y, expectNoViolations } from './pages/axe'
import { disableRulesFor } from './a11ySuppressions'

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 720 } },
  { name: 'mobile', viewport: devices['Pixel 5'].viewport }
] as const

for (const vp of VIEWPORTS) {
  test.describe(`a11y @ ${vp.name}`, () => {
    test.use({ viewport: vp.viewport })

    test('Etusivu (front page) has no a11y violations', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      await page.waitForLoadState('domcontentloaded')
      // Angular sets <html lang> after bootstrap; wait so the html-has-lang scan isn't racy
      await page.waitForFunction(() => document.documentElement.lang !== '', null, {
        timeout: 5000
      })
      const results = await checkA11y(page, { disableRules: disableRulesFor('Etusivu', vp.name) })
      expectNoViolations(results, `Etusivu @ ${vp.name}`)
    })

    test('Haku (search results) has no a11y violations', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      await etusivu.hae('matematiikka') // navigates to the search-results page
      await page.waitForLoadState('domcontentloaded')
      const results = await checkA11y(page, { disableRules: disableRulesFor('Haku', vp.name) })
      expectNoViolations(results, `Haku @ ${vp.name}`)
    })

    test('Omat oppimateriaalit has no a11y violations', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      const omat = await etusivu.header.clickOmatMateriaalit()
      await omat.locators.julkaistutMateriaalitHeading.waitFor()
      const results = await checkA11y(page, {
        disableRules: disableRulesFor('OmatOppimateriaalit', vp.name)
      })
      expectNoViolations(results, `Omat oppimateriaalit @ ${vp.name}`)
    })

    test('Uusi oppimateriaali (form) has no a11y violations', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      const omat = await etusivu.header.clickOmatMateriaalit()
      await omat.luoUusiMateriaali()
      await page.waitForLoadState('domcontentloaded')
      const results = await checkA11y(page, {
        disableRules: disableRulesFor('UusiOppimateriaali', vp.name)
      })
      expectNoViolations(results, `Uusi oppimateriaali @ ${vp.name}`)
    })

    test('Materiaali (material view) has no a11y violations', async ({ page, a11yMaterial }) => {
      await page.goto(`/#/materiaali/${a11yMaterial.materiaaliNumero}`, {
        waitUntil: 'domcontentloaded'
      })
      await page.getByRole('heading', { name: a11yMaterial.materiaaliNimi }).waitFor()
      const results = await checkA11y(page, {
        disableRules: disableRulesFor('Materiaali', vp.name)
      })
      expectNoViolations(results, `Materiaali @ ${vp.name}`)
    })

    test('Kokoelmat (collections list) has no a11y violations', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      const omat = await etusivu.header.clickOmatMateriaalit()
      await omat.header.clickKokoelmat()
      await page.waitForLoadState('domcontentloaded')
      const results = await checkA11y(page, {
        disableRules: disableRulesFor('Kokoelmat', vp.name)
      })
      expectNoViolations(results, `Kokoelmat @ ${vp.name}`)
    })

    test('Kokoelma (single collection) has no a11y violations', async ({
      page,
      a11yCollection
    }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      const omat = await etusivu.header.clickOmatMateriaalit()
      const kokoelmat = await omat.header.clickKokoelmat()
      const link = await kokoelmat.kokoelmaByName(a11yCollection.kokoelmaNimi)
      await link.click()
      await page.waitForLoadState('domcontentloaded')
      const results = await checkA11y(page, {
        disableRules: disableRulesFor('Kokoelma', vp.name)
      })
      expectNoViolations(results, `Kokoelma @ ${vp.name}`)
    })
  })
}

for (const vp of VIEWPORTS) {
  test.describe(`a11y logged-out @ ${vp.name}`, () => {
    test('Etusivu (logged out) has no a11y violations', async ({ browser }) => {
      const context = await browser.newContext({
        storageState: undefined,
        ignoreHTTPSErrors: true,
        viewport: vp.viewport
      })
      const page = await context.newPage()
      try {
        await page.goto('/#/etusivu', { waitUntil: 'domcontentloaded' })
        await page.waitForFunction(() => document.documentElement.lang !== '', null, {
          timeout: 5000
        })
        const results = await checkA11y(page, {
          disableRules: disableRulesFor('EtusivuPublic', vp.name)
        })
        expectNoViolations(results, `Etusivu (logged out) @ ${vp.name}`)
      } finally {
        await context.close()
      }
    })

    test('Haku (logged out) has no a11y violations', async ({ browser }) => {
      const context = await browser.newContext({
        storageState: undefined,
        ignoreHTTPSErrors: true,
        viewport: vp.viewport
      })
      const page = await context.newPage()
      try {
        await page.goto('/#/haku', { waitUntil: 'domcontentloaded' })
        // Angular sets <html lang> after bootstrap; wait so the html-has-lang scan isn't racy
        await page.waitForFunction(() => document.documentElement.lang !== '', null, {
          timeout: 5000
        })
        const results = await checkA11y(page, {
          disableRules: disableRulesFor('HakuPublic', vp.name)
        })
        expectNoViolations(results, `Haku (logged out) @ ${vp.name}`)
      } finally {
        await context.close()
      }
    })
  })
}

test.describe('a11y interactions @ desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('open search filter accordion has no a11y violations', async ({ page, a11yMaterial }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const hakuTulokset = await etusivu.hae(a11yMaterial.materiaaliNimi)
    await page.waitForLoadState('domcontentloaded')
    const filter = hakuTulokset.filter('Kieli')
    await filter.header.waitFor({ timeout: 15000 })
    await filter.open()
    await filter.values.first().waitFor()
    const results = await checkA11y(page, {
      disableRules: disableRulesFor('HakuFilter', 'desktop')
    })
    expectNoViolations(results, 'Search filter accordion (open) @ desktop')
  })

  test('open educationalLevels dropdown has no a11y violations', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    await etusivu.filters.educationalLevels.click()
    await page.getByRole('option').first().waitFor()
    const results = await checkA11y(page, {
      disableRules: disableRulesFor('NgSelect', 'desktop')
    })
    expectNoViolations(results, 'educationalLevels dropdown (open) @ desktop')
  })

  test('open metadata modal has no a11y violations', async ({ browser, a11yMaterial }) => {
    // "Lisää kuvailutietoja" is only offered to a user who is NOT the material's
    // owner, so log in as a second user in a fresh context.
    const context = await browser.newContext({ storageState: undefined, ignoreHTTPSErrors: true })
    const modalPage = await context.newPage()
    try {
      await modalPage.goto('/', { waitUntil: 'domcontentloaded' })
      const logIn = modalPage.getByRole('button', { name: 'Log in' })
      await logIn.waitFor()
      await logIn.click()
      await modalPage.getByRole('textbox', { name: 'Username' }).fill('tuomas.jukola')
      await modalPage.getByRole('textbox', { name: 'Password' }).fill('password123')
      await modalPage.getByRole('button', { name: 'Login' }).click()
      await modalPage.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' })
      const languageSelector = modalPage.getByRole('button', {
        name: 'Suomi: Vaihda kieli suomeksi'
      })
      await languageSelector.waitFor()
      await languageSelector.click()

      const openMaterial = () =>
        modalPage.goto(`/#/materiaali/${a11yMaterial.materiaaliNumero}`, {
          waitUntil: 'domcontentloaded'
        })
      await openMaterial()
      // Accept terms of service if this user is prompted on first login.
      try {
        await modalPage.getByText('Olen lukenut').click({ timeout: 1000 })
        await modalPage.getByRole('button', { name: 'Tallenna' }).click()
        await openMaterial()
      } catch (_e) {
        console.log('Terms of Service already accepted, skipping')
      }

      const addMetadataButton = modalPage.getByRole('button', { name: 'Lisää kuvailutietoja' })
      await addMetadataButton.waitFor()
      await addMetadataButton.click()
      const modal = modalPage.getByRole('dialog')
      await modal.getByRole('heading', { name: 'Lisää kuvailutietoja' }).waitFor()
      // Wait for the open transition to finish so contrast is measured on the
      // fully-faded-in modal, not a half-transparent one mid-animation.
      await expect(modal).toHaveCSS('opacity', '1')

      // Scope the scan to the dialog — the material page behind it has its own
      // (separately tracked) debt covered by the Materiaali scan.
      const results = await checkA11y(modalPage, {
        include: '[role="dialog"]',
        disableRules: disableRulesFor('MetadataModal', 'desktop')
      })
      expectNoViolations(results, 'Metadata modal (open) @ desktop')
    } finally {
      await context.close()
    }
  })
})

test.describe('a11y interactions @ mobile', () => {
  test.use({ viewport: devices['Pixel 5'].viewport })

  test('open mobile nav menu has no a11y violations', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    await etusivu.header.openMobileNav()
    const results = await checkA11y(page, { disableRules: disableRulesFor('MobileNav', 'mobile') })
    expectNoViolations(results, 'Mobile nav menu (open) @ mobile')
  })
})

test.describe('a11y reviews @ desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Arvostelut (reviews) view has no a11y violations', async ({ browser, a11yMaterial }) => {
    test.setTimeout(120_000)
    const context = await browser.newContext({ storageState: undefined, ignoreHTTPSErrors: true })
    const reviewerPage = await context.newPage()
    try {
      await reviewerPage.goto('/', { waitUntil: 'domcontentloaded' })
      const logIn = reviewerPage.getByRole('button', { name: 'Log in' })
      await logIn.waitFor()
      await logIn.click()
      await reviewerPage.getByRole('textbox', { name: 'Username' }).fill('tuomas.jukola')
      await reviewerPage.getByRole('textbox', { name: 'Password' }).fill('password123')
      await reviewerPage.getByRole('button', { name: 'Login' }).click()
      await reviewerPage.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' })
      const languageSelector = reviewerPage.getByRole('button', {
        name: 'Suomi: Vaihda kieli suomeksi'
      })
      await languageSelector.waitFor()
      await languageSelector.click()

      await reviewerPage.goto(`/#/materiaali/${a11yMaterial.materiaaliNumero}`, {
        waitUntil: 'domcontentloaded'
      })
      // Accept ToS if prompted on first login for this user.
      try {
        await reviewerPage.getByText('Olen lukenut').click({ timeout: 1000 })
        await reviewerPage.getByRole('button', { name: 'Tallenna' }).click()
        await reviewerPage.goto(`/#/materiaali/${a11yMaterial.materiaaliNumero}`, {
          waitUntil: 'domcontentloaded'
        })
      } catch (_e) {
        console.log('Terms of Service already accepted, skipping')
      }

      // Submit a review as tuomas.jukola so the "Katso kaikki arviot" link appears.
      const reviewerMateriaali = Materiaali(reviewerPage)
      try {
        await reviewerMateriaali.lisaaArvio({
          ratingContent: '4',
          ratingVisual: '5',
          feedbackPositive: 'Erittäin hyvä ja selkeä materiaali',
          feedbackSuggest: 'Voisi olla enemmän esimerkkejä',
          feedbackPurpose: 'Käytin opetuksessa'
        })
      } catch (_e) {
        // Review may already exist (e.g. test rerun); proceed to the reviews view.
        console.log('Review submission skipped (may already exist)')
      }

      // Open the reviews view.
      await reviewerMateriaali.katsoKaikkiArviotLink.waitFor()
      await reviewerMateriaali.clickKatsoKaikkiArviot()
      await reviewerPage.waitForLoadState('domcontentloaded')

      const results = await checkA11y(reviewerPage, {
        disableRules: disableRulesFor('Arvostelut', 'desktop')
      })
      expectNoViolations(results, 'Arvostelut @ desktop')
    } finally {
      await context.close()
    }
  })
})
