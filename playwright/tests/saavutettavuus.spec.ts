import { test } from './a11yFixture'
import { devices, expect } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import { Materiaali } from './pages/Materiaali'
import { scanA11y } from './pages/axe'
import { isKnownGap } from './a11yGaps'
import { hasHorizontalScroll, headingLevels } from './pages/keyboard'
import { User, authFileByUser } from './auth'

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 720 } },
  { name: 'mobile', viewport: devices['Pixel 5'].viewport }
] as const

type KeyRoute = 'Etusivu' | 'Haku' | 'Materiaali' | 'OmatOppimateriaalit' | 'Kokoelmat'

// Navigate each key route via existing page objects, calling `visit(routeName)` on each.
// Works at any viewport (the header nav handles the collapsed mobile menu).
const visitKeyRoutes = async (
  page: import('@playwright/test').Page,
  a11yMaterial: { materiaaliNimi: string; materiaaliNumero: number },
  visit: (route: KeyRoute) => Promise<void>
) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  await visit('Etusivu')

  await etusivu.hae('matematiikka')
  await page.waitForLoadState('domcontentloaded')
  await visit('Haku')

  await page.goto(`/materiaali/${a11yMaterial.materiaaliNumero}`, {
    waitUntil: 'domcontentloaded'
  })
  await page.getByRole('heading', { name: a11yMaterial.materiaaliNimi }).waitFor()
  await visit('Materiaali')

  const omat = await etusivu.header.clickOmatMateriaalit()
  await omat.locators.julkaistutMateriaalitHeading.waitFor()
  await visit('OmatOppimateriaalit')

  await omat.header.clickKokoelmat()
  await page.waitForLoadState('domcontentloaded')
  await visit('Kokoelmat')
}

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
      await scanA11y(page, 'Etusivu', vp.name)
    })

    test('Haku (search results) has no a11y violations', async ({ page, a11yMaterial }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      await etusivu.hae(a11yMaterial.materiaaliNimi)
      await page.locator('.results-count').first().waitFor()
      await scanA11y(page, 'Haku', vp.name)
    })

    test('Omat oppimateriaalit has no a11y violations', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      const omat = await etusivu.header.clickOmatMateriaalit()
      await omat.locators.julkaistutMateriaalitHeading.waitFor()
      await scanA11y(page, 'OmatOppimateriaalit', vp.name)
    })

    test('Uusi oppimateriaali (form) has no a11y violations', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      const omat = await etusivu.header.clickOmatMateriaalit()
      await omat.luoUusiMateriaali()
      await page.waitForLoadState('domcontentloaded')
      await scanA11y(page, 'UusiOppimateriaali', vp.name)
    })

    test('Materiaali (material view) has no a11y violations', async ({ page, a11yMaterial }) => {
      await page.goto(`/materiaali/${a11yMaterial.materiaaliNumero}`, {
        waitUntil: 'domcontentloaded'
      })
      await page.getByRole('heading', { name: a11yMaterial.materiaaliNimi }).waitFor()
      await scanA11y(page, 'Materiaali', vp.name)
    })

    test('Kokoelmat (collections list) has no a11y violations', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()
      const omat = await etusivu.header.clickOmatMateriaalit()
      await omat.header.clickKokoelmat()
      await page.waitForLoadState('domcontentloaded')
      await scanA11y(page, 'Kokoelmat', vp.name)
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
      await scanA11y(page, 'Kokoelma', vp.name)
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
        await page.goto('/etusivu', { waitUntil: 'domcontentloaded' })
        await page.waitForFunction(() => document.documentElement.lang !== '', null, {
          timeout: 5000
        })
        await scanA11y(page, 'EtusivuPublic', vp.name)
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
        await page.goto('/haku', { waitUntil: 'domcontentloaded' })
        // Angular sets <html lang> after bootstrap; wait so the html-has-lang scan isn't racy
        await page.waitForFunction(() => document.documentElement.lang !== '', null, {
          timeout: 5000
        })
        await scanA11y(page, 'HakuPublic', vp.name)
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
    await scanA11y(page, 'HakuFilter', 'desktop')
  })

  test('open educationalLevels dropdown has no a11y violations', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    await etusivu.filters.educationalLevels.click()
    await page.getByRole('option').first().waitFor()
    await scanA11y(page, 'NgSelect', 'desktop')
  })

  test('open metadata modal has no a11y violations', async ({ browser, a11yMaterial }) => {
    // "Lisää kuvailutietoja" is only offered to a user who is NOT the material's
    // owner, so log in as a second user in a fresh context.
    const context = await browser.newContext({
      storageState: authFileByUser[User.TUOMAS_JUKOLA],
      ignoreHTTPSErrors: true
    })
    const modalPage = await context.newPage()
    try {
      const openMaterial = () =>
        modalPage.goto(`/materiaali/${a11yMaterial.materiaaliNumero}`, {
          waitUntil: 'domcontentloaded'
        })
      await openMaterial()
      // Accept terms of service if this user is prompted on first login.
      try {
        await modalPage.getByText('Olen lukenut').click({ timeout: 1000 })
        await modalPage.getByRole('button', { name: 'Tallenna' }).click()
        await openMaterial()
      } catch (_e) {}

      const addMetadataButton = modalPage.getByRole('button', {
        name: 'Lisää kuvailutietoja'
      })
      await addMetadataButton.waitFor()
      await addMetadataButton.click()
      const modal = modalPage.getByRole('dialog')
      await modal.getByRole('heading', { name: 'Lisää kuvailutietoja' }).waitFor()
      // Wait for the open transition to finish so contrast is measured on the
      // fully-faded-in modal, not a half-transparent one mid-animation.
      await expect(modal).toHaveCSS('opacity', '1')

      // Scope the scan to the dialog — the material page behind it has its own
      // (separately tracked) debt covered by the Materiaali scan.
      await scanA11y(modalPage, 'MetadataModal', 'desktop', {
        include: '[role="dialog"]'
      })
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
    await scanA11y(page, 'MobileNav', 'mobile')
  })
})

test.describe('a11y titles @ desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('page titles are meaningful and unique across routes', async ({ page, a11yMaterial }) => {
    test.setTimeout(120_000)
    const etusivu = Etusivu(page)
    const titles: Record<string, string> = {}

    await etusivu.goto()
    titles.etusivu = await page.title()

    await etusivu.hae('matematiikka')
    await page.waitForLoadState('domcontentloaded')
    titles.haku = await page.title()

    await page.goto(`/materiaali/${a11yMaterial.materiaaliNumero}`, {
      waitUntil: 'domcontentloaded'
    })
    await page.getByRole('heading', { name: a11yMaterial.materiaaliNimi }).waitFor()
    titles.materiaali = await page.title()

    const omat = await etusivu.header.clickOmatMateriaalit()
    await omat.locators.julkaistutMateriaalitHeading.waitFor()
    titles.omatOppimateriaalit = await page.title()

    await omat.header.clickKokoelmat()
    await page.waitForLoadState('domcontentloaded')
    titles.kokoelmat = await page.title()

    const values = Object.values(titles)
    if (!isKnownGap('page-titles-meaningful')) {
      for (const [route, title] of Object.entries(titles)) {
        expect(title.trim(), `empty/blank <title> on ${route}`).not.toBe('')
      }
    }
    if (!isKnownGap('page-titles-unique')) {
      expect(new Set(values).size, `titles not unique per route: ${JSON.stringify(titles)}`).toBe(
        values.length
      )
    }
  })
})

test.describe('a11y reflow @ 320px', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  test('key pages reflow without horizontal scroll at 320px', async ({ page, a11yMaterial }) => {
    test.setTimeout(120_000)
    await visitKeyRoutes(page, a11yMaterial, async (route) => {
      if (isKnownGap(`reflow:${route}`)) {
        return
      }
      const overflows = await hasHorizontalScroll(page)
      expect(overflows, `${route} has horizontal scroll at 320px width`).toBe(false)
    })
  })
})

test.describe('a11y headings @ desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('key pages have one h1 and no skipped heading levels', async ({ page, a11yMaterial }) => {
    test.setTimeout(120_000)
    await visitKeyRoutes(page, a11yMaterial, async (route) => {
      if (isKnownGap(`headings:${route}`)) {
        return
      }
      const levels = await headingLevels(page)
      const h1Count = levels.filter((l) => l === 1).length
      expect(h1Count, `${route} should have exactly one <h1> (found ${h1Count})`).toBe(1)
      for (let i = 1; i < levels.length; i++) {
        expect(
          levels[i] - levels[i - 1],
          `${route} skips a heading level: ${levels.join(',')}`
        ).toBeLessThanOrEqual(1)
      }
    })
  })

  test('key pages have no generic link text or filename alt', async ({ page, a11yMaterial }) => {
    test.setTimeout(120_000)
    const GENERIC = /^(lue lisää|klikkaa|tästä|lisää|näytä|read more|click here|here)$/i

    await visitKeyRoutes(page, a11yMaterial, async (route) => {
      // Links whose entire accessible text is a generic phrase.
      const linkTexts = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href]'))
          .filter((a) => (a as HTMLElement).offsetParent !== null) // visible
          .map((a) => (a.getAttribute('aria-label') || a.textContent || '').trim())
          .filter((t) => t.length > 0)
      )
      const genericLinks = linkTexts.filter((t) => GENERIC.test(t))
      if (!isKnownGap(`link-text:${route}`)) {
        expect(
          genericLinks,
          `${route} has generic-only link text: ${genericLinks.join(' | ')}`
        ).toEqual([])
      }

      // Images whose alt equals their filename.
      const filenameAlts = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img[alt]'))
          .map((img) => ({
            alt: (img.getAttribute('alt') || '').trim(),
            src: (img.getAttribute('src') || '').split('/').pop() || ''
          }))
          .filter((x) => x.alt.length > 0 && x.alt === x.src)
          .map((x) => x.alt)
      )
      if (!isKnownGap(`alt-filename:${route}`)) {
        expect(
          filenameAlts,
          `${route} has <img> alt equal to filename: ${filenameAlts.join(' | ')}`
        ).toEqual([])
      }
    })
  })

  test('search result count is announced in a live region', async ({ page, a11yMaterial }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    await etusivu.hae(a11yMaterial.materiaaliNimi)
    await page.waitForLoadState('domcontentloaded')
    // Wait for the result-count element to be visible so the DOM is settled
    // before we inspect live regions (domcontentloaded fires before Angular renders).
    // The app renders result count as "N - M / T tulosta" inside .results-count.
    await page.locator('.results-count').first().waitFor({ state: 'visible', timeout: 15000 })

    // The result-count text should sit inside an element marked as a live region
    // (aria-live / role=status / role=alert) so screen readers announce it.
    const inLiveRegion = await page.evaluate(() => {
      const live = Array.from(
        document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')
      )
      // Actual count text: "1 - 15 / 31 tulosta" (class="results-count")
      const countRe = /hakutulos|tulosta|\d+\s*\/\s*\d+/i
      return live.some((el) => countRe.test(el.textContent || ''))
    })
    if (!isKnownGap('live-region:search-count')) {
      expect(
        inLiveRegion,
        'search result count should be inside an aria-live/status/alert region'
      ).toBe(true)
    }
  })
})

test.describe('a11y reviews @ desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('Arvostelut (reviews) view has no a11y violations', async ({ browser, a11yMaterial }) => {
    test.setTimeout(120_000)
    const context = await browser.newContext({
      storageState: authFileByUser[User.TUOMAS_JUKOLA],
      ignoreHTTPSErrors: true
    })
    const reviewerPage = await context.newPage()
    try {
      await reviewerPage.goto(`/materiaali/${a11yMaterial.materiaaliNumero}`, {
        waitUntil: 'domcontentloaded'
      })
      // Accept ToS if prompted on first login for this user.
      try {
        await reviewerPage.getByText('Olen lukenut').click({ timeout: 1000 })
        await reviewerPage.getByRole('button', { name: 'Tallenna' }).click()
        await reviewerPage.goto(`/materiaali/${a11yMaterial.materiaaliNumero}`, {
          waitUntil: 'domcontentloaded'
        })
      } catch (_e) {}

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

      await scanA11y(reviewerPage, 'Arvostelut', 'desktop')
    } finally {
      await context.close()
    }
  })
})
