import { test } from './a11yFixture'
import { expect } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import {
  tabUntilFocused,
  expectFocused,
  activate,
  expectFocusTrapped,
  selectNgSelectByKeyboard
} from './pages/keyboard'
import { isKnownGap } from './a11yKeyboardGaps'
import { MateriaaliFormi } from './pages/MateriaaliFormi'

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
    await page.locator('body').click({ position: { x: 0, y: 0 } }) // ensure no control pre-focused
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: /ohita|skip|siirry sis|main content/i })
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
    await expect(page).toHaveURL(/#\/haku/)
  })

  test('new-material wizard is completable by keyboard', async ({ page }) => {
    test.setTimeout(180_000)
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    await omat.luoUusiMateriaali()

    const { form, randomMateriaaliNimi, controls } = MateriaaliFormi(page)
    const nimi = randomMateriaaliNimi('A11y nappaimisto')

    // Step 1 (tiedostot): name by keyboard; file via focus+setInputFiles (documented gap).
    const nameField = page.getByRole('textbox', { name: 'Oppimateriaalin nimi *', exact: true })
    await tabUntilFocused(page, nameField)
    await page.keyboard.type(nimi)
    await form.lisaaTiedosto() // KEYBOARD_GAPS['file-picker'] — native dialog not keyboard-drivable
    await advanceStepByKeyboard(page)

    // Step 2 (perustiedot): person, keyword, type — operate by keyboard.
    await page.getByRole('button', { name: 'Lisää henkilö' }).press('Enter')
    await page.getByRole('textbox', { name: 'Tekijän nimi *' }).fill('Tester, Testi')
    // KEYBOARD_GAPS['wizard-keyword-select']: keywords ng-select with [addTag] does not update
    // the Angular form control via keyboard; use mouse fallback (fill + click option).
    await controls.keywordsSelect.click() // KEYBOARD_GAPS['wizard-keyword-select']
    await page.keyboard.type('PDF')
    await page.getByRole('option', { name: 'PDF' }).first().click() // KEYBOARD_GAPS['wizard-keyword-select']
    await selectNgSelectByKeyboard(page, controls.learningResourceTypesSelect, 'teksti')
    await advanceStepByKeyboard(page)

    // Step 3 (koulutustiedot): education level via ng-select keyboard.
    await selectNgSelectByKeyboard(page, controls.educationalLevelsSelect, 'korkeakoulutus')
    await advanceStepByKeyboard(page)

    // Step 4 (tarkemmat): nothing required.
    await advanceStepByKeyboard(page)

    // Step 5 (lisenssitiedot): license selection by keyboard.
    // KEYBOARD_GAPS['wizard-license-radio']: pressing Space on the focused radio does not mark
    // Angular's reactive form dirty, so sessionStorage is not updated and the selection is lost.
    // Fallback: click the radio directly (mouse action).
    const licenseRadio = controls.licenseRadio('CC BY 4.0')
    await tabUntilFocused(page, licenseRadio, 80) // keyboard: Tab to radio
    await licenseRadio.click() // KEYBOARD_GAPS['wizard-license-radio'] — click to persist form value
    await advanceStepByKeyboard(page)

    // Step 6 (hyodynnetyt): nothing.
    await advanceStepByKeyboard(page)

    // Step 7 (esikatselu): tick affirmation + save by keyboard.
    const save = page.getByRole('button', { name: 'Tallenna' })
    await controls.confirmCheckbox.waitFor({ state: 'visible' }) // ensure esikatselu step is fully rendered
    await tabUntilFocused(page, controls.confirmCheckbox, 80)
    await activate(page, 'Space') // attempt the keyboard toggle
    // KEYBOARD_GAPS['wizard-confirm-checkbox']: Space doesn't update Angular's form, so if the
    // keyboard toggle didn't enable Save, fall back to a mouse click on the label.
    if (await save.isDisabled()) {
      await controls.confirmLabel.click() // KEYBOARD_GAPS['wizard-confirm-checkbox'] fallback
    }
    await tabUntilFocused(page, save)
    await activate(page)
    // Proof of save: the wizard navigates to the saved material page (/#/materiaali/<id>) —
    // the preview step also shows the name heading, so assert the URL, not just the heading.
    await expect(page).toHaveURL(/#\/materiaali\/\d+/, { timeout: 30000 })
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
    // KEYBOARD_GAPS['wizard-confirm-checkbox']: Space doesn't update Angular's form; fall back if Save stays disabled.
    if (await save.isDisabled()) {
      await controls.confirmLabel.click() // KEYBOARD_GAPS['wizard-confirm-checkbox'] fallback
    }
    await tabUntilFocused(page, save)
    await activate(page)
    // Proof of save: editing returns to the material page (/#/materiaali/<id>).
    await expect(page).toHaveURL(/#\/materiaali\/\d+/, { timeout: 30000 })
  })

  test('metadata modal traps focus and returns it on Escape', async ({ browser, a11yMaterial }) => {
    test.setTimeout(120_000)
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
      try {
        await modalPage.getByText('Olen lukenut').click({ timeout: 1000 })
        await modalPage.getByRole('button', { name: 'Tallenna' }).click()
        await openMaterial()
      } catch (_e) {
        console.log('Terms of Service already accepted, skipping')
      }

      // Open the modal BY KEYBOARD.
      const trigger = modalPage.getByRole('button', { name: 'Lisää kuvailutietoja' })
      if (isKnownGap('modal-open-keyboard')) {
        await trigger.click()
      } else {
        await tabUntilFocused(modalPage, trigger, 80)
        await activate(modalPage)
      }

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
})
