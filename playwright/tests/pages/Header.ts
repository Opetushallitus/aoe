import { type Page, type Locator, expect } from '@playwright/test'
import { OmatOppimateriaalit } from './OmatOppimateriaalit'
import { KokoelmatPage } from './KokoelmatPage'

export const Header = (page: Page) => {
  const locators = {
    kirjaudu: page.getByRole('button', { name: ' Kirjaudu sisään ' }),
    fi: page.getByRole('button', { name: 'Suomi: Vaihda kieli suomeksi' }),
    navToggler: page.locator('button.navbar-toggler'),
    navCollapseShown: page.locator('.navbar-collapse.show'),
    omatMateriaalitLink: page.getByRole('link', {
      name: 'Omat oppimateriaalit'
    }),
    kokoelmatLink: page.getByRole('link', { name: 'Kokoelmat' })
  }

  // On mobile the navbar is collapsed behind a toggler; on desktop the toggler
  // is hidden and the links are always present. Use the expanded menu's own
  // visibility (the `.show` collapse) as the source of truth rather than the
  // toggler's aria-expanded, which can desync from the actual menu state.
  const openNavIfCollapsed = async () => {
    if (!(await locators.navToggler.isVisible())) {
      return
    }
    if (!(await locators.navCollapseShown.isVisible())) {
      await locators.navToggler.click()
      await expect(locators.navCollapseShown).toBeVisible()
    }
  }

  // Opens the collapsed mobile navigation menu (no-op on desktop).
  const openMobileNav = openNavIfCollapsed

  // On mobile the SPA's post-load redirect can re-collapse the nav right after it
  // opens, so the link disappears before the click. Retry open+click until it lands.
  const clickNavLink = async (link: Locator) => {
    await expect(async () => {
      await openNavIfCollapsed()
      await link.click({ timeout: 3000 })
    }).toPass({ timeout: 20000, intervals: [500, 1000, 2000] })
  }

  const clickOmatMateriaalit = async () => {
    await clickNavLink(locators.omatMateriaalitLink)
    const hyvaksyKayttoehdot = page.getByText('Olen lukenut')
    try {
      await hyvaksyKayttoehdot.click({ timeout: 500 })
      await page.getByRole('button', { name: 'Tallenna' }).click()
      await page.waitForURL('/etusivu', { waitUntil: 'domcontentloaded' })
      await clickNavLink(locators.omatMateriaalitLink)
    } catch (_e) {}
    return OmatOppimateriaalit(page)
  }

  async function clickKokoelmat() {
    await clickNavLink(locators.kokoelmatLink)
    return KokoelmatPage(page)
  }

  return {
    clickOmatMateriaalit,
    clickKokoelmat,
    openMobileNav,
    ...locators
  }
}
