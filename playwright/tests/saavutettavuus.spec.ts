import { test } from './a11yFixture'
import { devices, expect } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import { checkA11y, expectNoViolations } from './pages/axe'

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 720 } },
  { name: 'mobile', viewport: devices['Pixel 5'].viewport }
] as const

// Known, documented a11y debt — NOT regressions. Keyed by `${page}|${viewport}`.
// Removing an entry makes the scan enforce that rule again.
const KNOWN_ISSUES: Record<string, string[]> = {
  'Etusivu|desktop': ['aria-command-name'], // TODO(a11y): user-details-dropdown missing accessible name — file ticket
  // On mobile the user menu lives in the collapsed nav, so it is only intermittently
  // rendered into the scan — suppress the same debt for a deterministic gate.
  'Etusivu|mobile': ['aria-command-name'], // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  'Haku|desktop': ['aria-command-name', 'aria-valid-attr-value'], // TODO(a11y): user icon + search-filters aria-controls — file ticket
  'Haku|mobile': ['aria-valid-attr-value', 'aria-command-name'], // TODO(a11y): search-filters aria-controls + user icon — file ticket
  'OmatOppimateriaalit|desktop': ['aria-command-name'], // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  'OmatOppimateriaalit|mobile': ['aria-command-name'], // TODO(a11y): #user-details-dropdown missing accessible name (intermittently rendered in collapsed nav) — file ticket
  'UusiOppimateriaali|desktop': ['aria-command-name', 'button-name'], // TODO(a11y): #user-details-dropdown missing accessible name; 10 help-icon buttons (div[formgroupname="name"] > .btn-link) have no accessible name — file ticket
  'UusiOppimateriaali|mobile': ['aria-command-name', 'button-name'], // TODO(a11y): #user-details-dropdown missing accessible name (intermittently rendered in collapsed nav); 10 help-icon buttons (div[formgroupname="name"] > .btn-link) have no accessible name — file ticket
  'Materiaali|desktop': ['aria-command-name', 'button-name', 'nested-interactive'], // TODO(a11y): #user-details-dropdown missing name; .btn-tooltip has no accessible name; .panel-heading contains nested interactive elements — file ticket
  'Materiaali|mobile': ['aria-command-name', 'button-name', 'nested-interactive'], // TODO(a11y): #user-details-dropdown missing name (intermittently rendered in collapsed nav); .btn-tooltip has no accessible name; .panel-heading contains nested interactive elements — file ticket
  'HakuFilter|desktop': [
    'aria-command-name' // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  ],
  'NgSelect|desktop': [
    'aria-allowed-attr', // TODO(a11y): ng-select optgroup (role="group") uses disallowed aria-setsize/aria-posinset — file ticket
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'scrollable-region-focusable' // TODO(a11y): .ng-dropdown-panel-items scroll container not keyboard focusable — file ticket
  ],
  'MobileNav|mobile': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-valid-attr-value' // TODO(a11y): .navbar-toggler has an invalid aria attribute value — file ticket
  ]
}

const disableRulesFor = (pageName: string, viewport: string) =>
  KNOWN_ISSUES[`${pageName}|${viewport}`] ?? []

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
      await modalPage.waitForTimeout(1000)
      await modalPage.getByRole('button', { name: 'Log in' }).click()
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
