import { expect, test, type Locator } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

const SELF_MOTIVATED_SUBJECTS = 'ng-select#selfMotivatedEducationSubjects'

/**
 * Adds a free-text tag to an ng-select. These fields surface the "add tag"
 * option via (keyup) handlers, which Playwright's fill() does not trigger, so
 * the text must be typed with pressSequentially.
 */
const lisaaVapaatekstiTagi = async (field: Locator, teksti: string) => {
  await field.click()
  const input = field.getByRole('combobox')
  await input.pressSequentially(teksti)
  await input.press('Enter')
  await input.press('Escape')
}

test('samaa arvoa ei voi lisätä vapaatekstikenttään kahta kertaa', async ({ page }) => {
  // Reach the educational details step of the new-resource wizard.
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()

  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Dedupe-testi')
  await uusiMateriaali.form.oppimateriaalinNimi(materiaaliNimi)
  await uusiMateriaali.form.lisaaTiedosto()
  const perustiedot = await uusiMateriaali.form.seuraava()
  await perustiedot.lisaaHenkilo()
  await perustiedot.lisaaAsiasana()
  await perustiedot.lisaaOppimateriaalinTyyppi()
  const koulutustiedot = await perustiedot.seuraava()

  // Selecting this level reveals the self-motivated education subjects field,
  // a free-text alignment ng-select carrying the aoeAlignmentTagDedupe directive.
  await koulutustiedot.valitseKoulutusasteet('omaehtoinen osaamisen kehittäminen')
  const field = page.locator(SELF_MOTIVATED_SUBJECTS)
  await expect(field).toBeVisible()

  // "viulunsoitto" and "viulun-soitto" normalize to the same DB key, so the
  // second (near-duplicate) value must be silently dropped.
  await lisaaVapaatekstiTagi(field, 'viulunsoitto')
  await lisaaVapaatekstiTagi(field, 'viulun-soitto')

  await expect(field.getByText('viulunsoitto', { exact: true })).toHaveCount(1)
  await expect(field.getByText('viulun-soitto', { exact: true })).toHaveCount(0)

  // Control: a genuinely distinct value still adds normally. This proves the
  // assertions above are real dedupe, not the second tag failing to enter.
  await lisaaVapaatekstiTagi(field, 'trumpetinsoitto')
  await expect(field.getByText('trumpetinsoitto', { exact: true })).toHaveCount(1)
})
