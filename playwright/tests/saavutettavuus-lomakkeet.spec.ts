import { test } from './a11yFixture'
import { expect } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import { MateriaaliFormi } from './pages/MateriaaliFormi'
import { scanWizard } from './pages/scanWizard'
import { checkA11y, expectNoViolations } from './pages/axe'
import { disableRulesFor } from './a11ySuppressions'
import { isKnownGap } from './a11yGaps'

test.use({ viewport: { width: 1280, height: 720 } })

test.describe('a11y forms @ desktop', () => {
  test('Uusi materiaali wizard — every step has no a11y violations', async ({ page }) => {
    test.setTimeout(180_000)
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    await omat.luoUusiMateriaali()

    const { form, randomMateriaaliNimi } = MateriaaliFormi(page)
    const nimi = randomMateriaaliNimi('A11y lomake')
    let perustiedot: Awaited<ReturnType<typeof form.seuraava>>
    let koulutustiedot: Awaited<ReturnType<NonNullable<typeof perustiedot>['seuraava']>>
    let tarkemmat: Awaited<ReturnType<NonNullable<typeof koulutustiedot>['seuraava']>>
    let lisenssi: Awaited<ReturnType<NonNullable<typeof tarkemmat>['seuraava']>>
    let hyodynnetyt: Awaited<ReturnType<NonNullable<typeof lisenssi>['seuraava']>>

    await scanWizard(page, 'UusiMateriaali', [
      {
        key: 'tiedostot',
        fill: async () => {
          await form.oppimateriaalinNimi(nimi)
          await form.lisaaTiedosto()
        },
        next: async () => {
          perustiedot = await form.seuraava()
        }
      },
      {
        key: 'perustiedot',
        fill: async () => {
          await perustiedot.lisaaHenkilo()
          await perustiedot.lisaaAsiasana()
          await perustiedot.lisaaOppimateriaalinTyyppi()
        },
        next: async () => {
          koulutustiedot = await perustiedot.seuraava()
        }
      },
      {
        key: 'koulutustiedot',
        fill: async () => {
          await koulutustiedot.valitseKoulutusasteet('korkeakoulutus')
        },
        next: async () => {
          tarkemmat = await koulutustiedot.seuraava()
        }
      },
      {
        key: 'tarkemmat',
        next: async () => {
          lisenssi = await tarkemmat.seuraava()
        }
      },
      {
        key: 'lisenssitiedot',
        fill: async () => {
          await lisenssi.valitseLisenssi()
        },
        next: async () => {
          hyodynnetyt = await lisenssi.seuraava()
        }
      },
      {
        key: 'hyodynnetyt',
        next: async () => {
          await hyodynnetyt.seuraava()
        }
      },
      { key: 'esikatselu' }
    ])
  })

  test('Muokkaa materiaalia wizard — every step has no a11y violations', async ({
    page,
    a11yMaterial
  }) => {
    test.setTimeout(120_000)
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    const muokkaa = await omat.startToEditMateriaaliNumero(a11yMaterial.materiaaliNumero)

    const { form } = muokkaa
    let perustiedot: Awaited<ReturnType<typeof form.seuraava>>
    let koulutustiedot: Awaited<ReturnType<NonNullable<typeof perustiedot>['seuraava']>>
    let tarkemmat: Awaited<ReturnType<NonNullable<typeof koulutustiedot>['seuraava']>>
    let lisenssi: Awaited<ReturnType<NonNullable<typeof tarkemmat>['seuraava']>>
    let hyodynnetyt: Awaited<ReturnType<NonNullable<typeof lisenssi>['seuraava']>>

    await scanWizard(page, 'MuokkaaMateriaalia', [
      { key: 'tiedostot', next: async () => (perustiedot = await form.seuraava()) },
      { key: 'perustiedot', next: async () => (koulutustiedot = await perustiedot.seuraava()) },
      { key: 'koulutustiedot', next: async () => (tarkemmat = await koulutustiedot.seuraava()) },
      { key: 'tarkemmat', next: async () => (lisenssi = await tarkemmat.seuraava()) },
      { key: 'lisenssitiedot', next: async () => (hyodynnetyt = await lisenssi.seuraava()) },
      { key: 'hyodynnetyt', next: async () => await hyodynnetyt.seuraava() },
      { key: 'esikatselu' }
    ])
  })

  test('Muokkaa kokoelmaa — edit and preview views have no a11y violations', async ({
    page,
    a11yCollection
  }) => {
    test.setTimeout(120_000)
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    const kokoelma = await omat.startToEditKokoelma(a11yCollection.kokoelmaNimi)

    // Edit view
    const editResults = await checkA11y(page, {
      disableRules: disableRulesFor('MuokkaaKokoelmaa:muokkaus', 'desktop')
    })
    expectNoViolations(editResults, 'MuokkaaKokoelmaa edit view @ desktop')

    // Preview & save view (collection is already published, so the button reads "Tallenna")
    await kokoelma.esikatseluJaTallennusLink.click()
    await page.getByRole('button', { name: 'Tallenna', exact: true }).waitFor()
    const previewResults = await checkA11y(page, {
      disableRules: disableRulesFor('MuokkaaKokoelmaa:esikatselu', 'desktop')
    })
    expectNoViolations(previewResults, 'MuokkaaKokoelmaa preview view @ desktop')
  })

  test('Muokkaa kokoelmaa — publish-without-keywords error state has no a11y violations', async ({
    page,
    a11yCollection
  }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    const kokoelma = await omat.startToEditKokoelma(a11yCollection.kokoelmaNimi)

    // The fixture collection already has keywords, so clear them to force a validation error.
    // Wait for the keywords ng-select to be visible (confirms the basic-details form loaded).
    await kokoelma.keywordsSelect.waitFor()

    // Each ng-select tag renders as .ng-value with an .ng-value-icon.left removal button.
    // Remove all keyword values by clicking each × button.
    await kokoelma.clearKeywords()

    // Navigate to the preview/save tab. When required fields are missing, the tab shows
    // a <span class="bg-danger"> "Pakollinen" (Required) badge — this IS the visible
    // validation error state for the collection form.
    await kokoelma.esikatseluJaTallennusLink.click()
    // Wait for the "Pakollinen" required-field span to confirm the error state is visible.
    await kokoelma.requiredFieldBadge.first().waitFor()
    const results = await checkA11y(page, {
      disableRules: disableRulesFor('MuokkaaKokoelmaa:errors', 'desktop')
    })
    expectNoViolations(results, 'MuokkaaKokoelmaa error state @ desktop')
  })

  test('Uusi materiaali — invalid-input error state has no a11y violations', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    await omat.luoUusiMateriaali()

    const { controls } = MateriaaliFormi(page)

    // Type an invalid character in the name field to trigger the invalidCharacters
    // validation error. The name field allows only specific Unicode letters/symbols;
    // '<' is outside that set and reliably fires `.invalid-feedback`.
    const nameInput = page.getByRole('textbox', { name: 'Oppimateriaalin nimi *', exact: true })
    await nameInput.fill('<')
    // The invalid-feedback renders as soon as the field is dirty+invalid.
    await controls.firstInvalidFeedback.waitFor()

    const results = await checkA11y(page, {
      disableRules: disableRulesFor('UusiMateriaali:errors', 'desktop')
    })
    expectNoViolations(results, 'UusiMateriaali error state @ desktop')
  })

  test('new-material invalid-input error is associated with its field', async ({ page }) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    await omat.luoUusiMateriaali()

    const { controls } = MateriaaliFormi(page)
    const nameField = page.getByRole('textbox', { name: 'Oppimateriaalin nimi *', exact: true })
    await nameField.fill('<') // invalid character triggers validation
    await controls.firstInvalidFeedback.waitFor()

    const ariaInvalid = await nameField.getAttribute('aria-invalid')
    const describedBy = await nameField.getAttribute('aria-describedby')
    let describedByResolves = false
    if (describedBy) {
      for (const id of describedBy.split(/\s+/)) {
        if (await page.locator(`#${id}`).count()) {
          describedByResolves = true
        }
      }
    }
    if (!isKnownGap('error-assoc:new-material')) {
      expect(ariaInvalid, 'name field should have aria-invalid="true"').toBe('true')
      expect(
        describedByResolves,
        'name field should reference its error via aria-describedby'
      ).toBe(true)
    }
  })

  test('collection required-field error is associated with its field', async ({
    page,
    a11yCollection
  }) => {
    test.setTimeout(120_000)
    const etusivu = Etusivu(page)
    await etusivu.goto()
    const omat = await etusivu.header.clickOmatMateriaalit()
    const kokoelma = await omat.startToEditKokoelma(a11yCollection.kokoelmaNimi)
    await kokoelma.keywordsSelect.waitFor()
    await kokoelma.clearKeywords()
    // Trigger Angular validation by attempting to navigate to the preview tab.
    // The requiredFieldBadge appears on the preview tab; navigate back to edit
    // to inspect the keywords field's aria-invalid attribute.
    await kokoelma.esikatseluJaTallennusLink.click()
    await kokoelma.requiredFieldBadge.first().waitFor()
    await page.getByRole('link', { name: 'Perustiedot' }).click()
    await kokoelma.keywordsSelect.waitFor()

    const keywordsInvalid = await kokoelma.keywordsSelect.getAttribute('aria-invalid')
    if (!isKnownGap('error-assoc:collection')) {
      expect(keywordsInvalid, 'keywords field should have aria-invalid="true"').toBe('true')
    }
  })
})
