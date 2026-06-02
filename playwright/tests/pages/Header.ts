import { type Page, expect } from '@playwright/test'
import { OmatOppimateriaalit } from './OmatOppimateriaalit'
import { KokoelmatPage } from './KokoelmatPage'

export const Header = (page: Page) => {
  const locators = {
    kirjaudu: page.getByRole('button', { name: ' Kirjaudu sisään ' }),
    fi: page.getByRole('button', { name: 'Suomi: Vaihda kieli suomeksi' }),
    navToggler: page.locator('button.navbar-toggler'),
    navCollapseShown: page.locator('.navbar-collapse.show'),
    omatMateriaalitLink: page.getByRole('link', { name: 'Omat oppimateriaalit' }),
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

  const clickOmatMateriaalit = async () => {
    await openNavIfCollapsed()
    await locators.omatMateriaalitLink.click()
    const hyvaksyKayttoehdot = page.getByText('Olen lukenut')
    try {
      await hyvaksyKayttoehdot.click({ timeout: 500 })
      await page.getByRole('button', { name: 'Tallenna' }).click()
      await page.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' })
      await openNavIfCollapsed()
      await locators.omatMateriaalitLink.click()
    } catch (_e) {
      console.log('Terms of Service already accepted, skipping')
    }
    return OmatOppimateriaalit(page)
  }
  async function clickKokoelmat() {
    await openNavIfCollapsed()
    await locators.kokoelmatLink.click()
    return KokoelmatPage(page)
  }

  return {
    clickOmatMateriaalit,
    clickKokoelmat,
    openMobileNav,
    ...locators
  }
}
