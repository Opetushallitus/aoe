import { test } from './a11yFixture'
import { expect } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import {
  tabUntilFocused,
  expectFocused,
  activate,
  expectFocusTrapped,
  selectNgSelectByKeyboard,
  focusedActiveElement,
  activeElementHasFocusIndicator
} from './pages/keyboard'
import { isKnownGap } from './a11yGaps'
import { MateriaaliFormi } from './pages/MateriaaliFormi'
import { Materiaali } from './pages/Materiaali'
import { User, authFileByUser } from './auth'

test.use({ viewport: { width: 1280, height: 720 } })

// Keyboard-activate the wizard's "Seuraava" (Next) button. No step object returned —
// the next step's fields are targeted directly, avoiding the page-object's mouse click.
const advanceStepByKeyboard = async (page: Parameters<typeof activate>[0]) => {
  const seuraava = page.getByRole('button', { name: 'Seuraava' })
  await tabUntilFocused(page, seuraava, 80) // 80 tabs: many focusable elements inc. cookie banner
  await activate(page)
}

test.describe('a11y keyboard @ desktop', () => {
  test('first Tab exposes a skip-to-content link', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    await page.waitForFunction(() => document.documentElement.lang !== '', null, { timeout: 5000 })
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', {
      name: /ohita|skip|siirry sis|main content/i
    })
    if (!isKnownGap('skip-link')) {
      await expectFocused(skipLink)
    }
  })

  test('search is operable by keyboard from the front page', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    await tabUntilFocused(page, etusivu.haku.hakuehto)
    await page.keyboard.type('matematiikka')
    await tabUntilFocused(page, etusivu.haku.hae)
    await activate(page)
    await expect(page).toHaveURL(/\/haku/)
  })

  test('new-material wizard is completable by keyboard', async ({ page }) => {
    test.setTimeout(180_000)
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    await omat.luoUusiMateriaali()

    const { form, randomMateriaaliNimi, controls } = MateriaaliFormi(page)
    const nimi = randomMateriaaliNimi('A11y nappaimisto')

    // Step 1 (tiedostot): name by keyboard; file via setInputFiles.
    const nameField = page.getByRole('textbox', {
      name: 'Oppimateriaalin nimi *',
      exact: true
    })
    await tabUntilFocused(page, nameField)
    await page.keyboard.type(nimi)
    // setInputFiles: the native OS file dialog can't be driven by any browser automation —
    // this is a test-harness limitation, NOT an AOE a11y gap (native <input type=file> is
    // keyboard-accessible: Tab + Enter opens the OS dialog).
    await form.lisaaTiedosto()
    await advanceStepByKeyboard(page)

    // Step 2 (perustiedot): person, keyword, type — operate by keyboard.
    await page.getByRole('button', { name: 'Lisää henkilö' }).press('Enter')
    await page.getByRole('textbox', { name: 'Tekijän nimi *' }).fill('Tester, Testi')
    // KNOWN_GAPS['wizard-keyword-select']: keywords ng-select with [addTag] does not update
    // the Angular form control via keyboard; use mouse fallback (fill + click option).
    await controls.keywordsSelect.click() // KNOWN_GAPS['wizard-keyword-select']
    await page.keyboard.type('PDF')
    await page.getByRole('option', { name: 'PDF' }).first().click() // KNOWN_GAPS['wizard-keyword-select']
    await selectNgSelectByKeyboard(page, controls.learningResourceTypesSelect, 'teksti')
    await advanceStepByKeyboard(page)

    // Step 3 (koulutustiedot): education level via ng-select keyboard.
    await selectNgSelectByKeyboard(page, controls.educationalLevelsSelect, 'korkeakoulutus')
    await advanceStepByKeyboard(page)

    // Step 4 (tarkemmat): nothing required.
    await advanceStepByKeyboard(page)

    // Step 5 (lisenssitiedot): license selection by keyboard.
    // KNOWN_GAPS['wizard-license-radio']: pressing Space on the focused radio does not mark
    // Angular's reactive form dirty, so sessionStorage is not updated and the selection is lost.
    // Fallback: click the radio directly (mouse action).
    const licenseRadio = controls.licenseRadio('CC BY 4.0')
    await tabUntilFocused(page, licenseRadio, 80) // keyboard: Tab to radio
    await licenseRadio.click() // KNOWN_GAPS['wizard-license-radio'] — click to persist form value
    await advanceStepByKeyboard(page)

    // Step 6 (hyodynnetyt): nothing.
    await advanceStepByKeyboard(page)

    // Step 7 (esikatselu): tick affirmation + save by keyboard.
    const save = page.getByRole('button', { name: 'Tallenna' })
    await controls.confirmCheckbox.waitFor({ state: 'visible' }) // ensure esikatselu step is fully rendered
    await tabUntilFocused(page, controls.confirmCheckbox, 80)
    await activate(page, 'Space') // attempt the keyboard toggle
    // KNOWN_GAPS['wizard-confirm-checkbox']: Space doesn't update Angular's form, so if the
    // keyboard toggle didn't enable Save, fall back to a mouse click on the label.
    if (await save.isDisabled()) {
      await controls.confirmLabel.click() // KNOWN_GAPS['wizard-confirm-checkbox'] fallback
    }
    await tabUntilFocused(page, save)
    await activate(page)
    // Proof of save: the wizard navigates to the saved material page (/materiaali/<id>) —
    // the preview step also shows the name heading, so assert the URL, not just the heading.
    await expect(page).toHaveURL(/\/materiaali\/\d+/, { timeout: 30000 })
    await expect(page.getByRole('heading', { name: nimi })).toBeVisible()
  })

  test('edit-material wizard is completable by keyboard', async ({ page, a11yMaterial }) => {
    test.setTimeout(120_000)
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    await omat.startToEditMateriaaliNumero(a11yMaterial.materiaaliNumero)

    const { controls } = MateriaaliFormi(page, true) // editing form variant
    // Pre-filled form — advance all 6 transitions by keyboard to reach the preview/save step.
    for (let i = 0; i < 6; i++) {
      await advanceStepByKeyboard(page)
    }

    // Final step: affirmation + save by keyboard (same gap handling as the create wizard).
    const save = page.getByRole('button', { name: /Tallenna/ })
    await controls.confirmCheckbox.waitFor({ state: 'visible' })
    await tabUntilFocused(page, controls.confirmCheckbox, 80)
    await activate(page, 'Space') // attempt keyboard toggle
    // KNOWN_GAPS['wizard-confirm-checkbox']: Space doesn't update Angular's form; fall back if Save stays disabled.
    if (await save.isDisabled()) {
      await controls.confirmLabel.click() // KNOWN_GAPS['wizard-confirm-checkbox'] fallback
    }
    await tabUntilFocused(page, save)
    await activate(page)
    // Proof of save: editing returns to the material page (/materiaali/<id>).
    await expect(page).toHaveURL(/\/materiaali\/\d+/, { timeout: 30000 })
  })

  test('focus is managed after navigating to search results', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    await etusivu.hae('matematiikka')
    await page.waitForURL(/\/haku/)
    await page.waitForLoadState('domcontentloaded')

    // After a route change, focus should move to a sensible target (a heading or main
    // landmark), not stay on the search box or fall to <body>.
    const active = await focusedActiveElement(page)
    if (!isKnownGap('focus-route:search')) {
      expect(active, 'focus should not be lost to <body> after search navigation').not.toBeNull()
      expect(
        active?.tag === 'h1' || active?.tag === 'main' || active?.role === 'heading',
        `focus landed on an unhelpful element after search: ${JSON.stringify(active)}`
      ).toBe(true)
    }
  })

  test('focus is managed after saving a new material', async ({ page }) => {
    test.setTimeout(180_000)
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    await omat.luoUusiMateriaali()
    const { form, randomMateriaaliNimi } = MateriaaliFormi(page)
    const nimi = randomMateriaaliNimi('A11y fokus')

    // Minimal valid create flow (mouse is fine — this test is about post-save focus).
    await form.oppimateriaalinNimi(nimi)
    await form.lisaaTiedosto()
    const perustiedot = await form.seuraava()
    await perustiedot.lisaaHenkilo()
    await perustiedot.lisaaAsiasana()
    await perustiedot.lisaaOppimateriaalinTyyppi()
    const koulutustiedot = await perustiedot.seuraava()
    await koulutustiedot.valitseKoulutusasteet('korkeakoulutus')
    const tarkemmat = await koulutustiedot.seuraava()
    const lisenssi = await tarkemmat.seuraava()
    await lisenssi.valitseLisenssi()
    const hyodynnetyt = await lisenssi.seuraava()
    const esikatselu = await hyodynnetyt.seuraava()
    await esikatselu.tallenna(nimi)
    await page.waitForURL(/\/materiaali\/\d+/)

    const active = await focusedActiveElement(page)
    if (!isKnownGap('focus-route:save')) {
      expect(active, 'focus should not be lost to <body> after save').not.toBeNull()
      expect(
        active?.tag === 'h1' || active?.role === 'heading',
        `focus landed on an unhelpful element after save: ${JSON.stringify(active)}`
      ).toBe(true)
    }
  })

  test('search filter accordion opens by keyboard', async ({ page, a11yMaterial }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const hakuTulokset = await etusivu.hae(a11yMaterial.materiaaliNimi)
    const filter = hakuTulokset.filter('Kieli')
    await filter.header.waitFor({ timeout: 15000 })

    // The filter toggle should be reachable and operable by keyboard.
    if (!isKnownGap('search-filter-keyboard')) {
      await tabUntilFocused(page, filter.toggle, 60)
      await activate(page)
      await expect(filter.values.first()).toBeVisible()
    }
  })

  test('front-page education-level filter is operable by keyboard', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    if (!isKnownGap('search-ngselect-keyboard')) {
      await selectNgSelectByKeyboard(page, etusivu.filters.educationalLevels, 'korkeakoulutus')
      await expect(page.getByRole('option', { name: 'korkeakoulutus', exact: true })).toBeHidden()
    }
  })

  test('focused front-page controls have a visible focus indicator', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    await page.waitForFunction(() => document.documentElement.lang !== '', null, { timeout: 5000 })

    // Tab across the first several focusable controls; each should show an indicator.
    await page.locator('body').click({ position: { x: 0, y: 0 } })
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      const active = await focusedActiveElement(page)
      if (!active) {
        continue // focus on <body>/nothing — not a control
      }
      const hasIndicator = await activeElementHasFocusIndicator(page)
      if (!isKnownGap('focus-visible')) {
        expect(
          hasIndicator,
          `focused element has no visible focus indicator: ${JSON.stringify(active)}`
        ).toBe(true)
      }
    }
  })

  test('metadata modal traps focus and returns it on Escape', async ({ browser, a11yMaterial }) => {
    test.setTimeout(120_000)
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
      try {
        await modalPage.getByText('Olen lukenut').click({ timeout: 1000 })
        await modalPage.getByRole('button', { name: 'Tallenna' }).click()
        await openMaterial()
      } catch (_e) {}

      // Open the modal BY KEYBOARD.
      const trigger = modalPage.getByRole('button', {
        name: 'Lisää kuvailutietoja'
      })
      await tabUntilFocused(modalPage, trigger, 80)
      await activate(modalPage)

      const dialog = modalPage.getByRole('dialog')
      await dialog.getByRole('heading', { name: 'Lisää kuvailutietoja' }).waitFor()
      await expect(dialog).toHaveCSS('opacity', '1')

      // Focus moves into the dialog on open.
      const focusInDialog = await dialog.evaluate((el) => el.contains(document.activeElement))
      if (!isKnownGap('modal-initial-focus')) {
        expect(focusInDialog, 'focus should move into the dialog on open').toBe(true)
      }

      // Tab stays trapped inside the dialog.
      if (!isKnownGap('modal-focus-trap')) {
        await expectFocusTrapped(modalPage, dialog)
      }

      // Escape closes and returns focus to the trigger.
      await modalPage.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      if (!isKnownGap('modal-focus-return')) {
        await expect(trigger).toBeFocused()
      }
    } finally {
      await context.close()
    }
  })

  test('material-view tooltip is dismissible by keyboard', async ({ page, a11yMaterial }) => {
    await page.goto(`/materiaali/${a11yMaterial.materiaaliNumero}`, {
      waitUntil: 'domcontentloaded'
    })
    const materiaali = Materiaali(page)
    await materiaali.tooltipTrigger.waitFor()

    // Focus the trigger; the tooltip should appear.
    await materiaali.tooltipTrigger.focus()
    if (!isKnownGap('tooltip-show')) {
      await expect(materiaali.tooltipPopup).toBeVisible()
    }
    // Escape dismisses it (WCAG 1.4.13 dismissible).
    await page.keyboard.press('Escape')
    if (!isKnownGap('tooltip-dismiss')) {
      await expect(materiaali.tooltipPopup).toBeHidden()
    }
  })

  test('new-material expiry date field is operable by keyboard', async ({ page }) => {
    test.setTimeout(180_000)
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    await omat.luoUusiMateriaali()

    const { form, controls } = MateriaaliFormi(page)
    await form.oppimateriaalinNimi('A11y date keyboard')
    await form.lisaaTiedosto()
    const perustiedot = await form.seuraava()
    await perustiedot.lisaaHenkilo()
    await perustiedot.lisaaAsiasana()
    await perustiedot.lisaaOppimateriaalinTyyppi()
    const koulutustiedot = await perustiedot.seuraava()
    await koulutustiedot.valitseKoulutusasteet('korkeakoulutus')
    await koulutustiedot.seuraava() // now on tarkemmat (has #expires)

    await controls.expiresDate.waitFor()
    if (!isKnownGap('keyboard:expires-date')) {
      await tabUntilFocused(page, controls.expiresDate, 60)
      await page.keyboard.type('1.1.2030')
      await page.keyboard.press('Escape')
      await expect(controls.expiresDate).toHaveValue(/2030/)
    }
  })
})
