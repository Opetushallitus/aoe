import { expect } from '@playwright/test'
import { test } from './hakuFixture'
import { Etusivu } from './pages/Etusivu'

test('käyttäjä voi etsiä luodun oppimateriaalin etusivun haulla', async ({
  page,
  julkaistuMateriaaliNimi
}) => {
  const etusivu = Etusivu(page)

  await expect(async () => {
    await etusivu.goto()
    const hakuTulokset = await etusivu.hae(julkaistuMateriaaliNimi)
    await hakuTulokset.expectToFindMateriaali(julkaistuMateriaaliNimi, 5000)
  }).toPass({ timeout: 30_000, intervals: [5000] })

  const hakuTulokset = await etusivu.hae(julkaistuMateriaaliNimi)
  const avattuMateriaali = await hakuTulokset.clickMateriaali(julkaistuMateriaaliNimi)
  await avattuMateriaali.expectHeading(julkaistuMateriaaliNimi)
})

test('käyttäjä voi nähdä hakutulossivun keskeiset suodattimet', async ({
  page,
  julkaistuMateriaaliNimi
}) => {
  const etusivu = Etusivu(page)

  await expect(async () => {
    await etusivu.goto()
    const hakuTulokset = await etusivu.hae(julkaistuMateriaaliNimi)
    await hakuTulokset.expectToFindMateriaali(julkaistuMateriaaliNimi, 5000)
  }).toPass({ timeout: 30_000, intervals: [5000] })

  const hakuTulokset = await etusivu.hae(julkaistuMateriaaliNimi)
  await hakuTulokset.expectToFindMateriaali(julkaistuMateriaaliNimi, 5000)

  for (const { name, value } of [
    { name: 'Kieli', value: /suomi/i },
    { name: 'Koulutusaste', value: 'korkeakoulutus' },
    { name: 'Oppiaine, tutkinto, tieteenala', value: 'Matematiikka' },
    { name: 'Oppimateriaalin tyyppi', value: 'teksti' },
    { name: 'Lisenssi', value: 'CC BY 4.0' }
  ]) {
    const filter = hakuTulokset.filter(name)
    await expect(filter.header).toBeVisible()
    await filter.open()
    await expect(filter.values.filter({ hasText: value }).first()).toBeVisible()
  }
})

test('käyttäjä voi etsiä oppimateriaalia koulutusasteen perusteella', async ({
  page,
  julkaistuMateriaaliNimi
}) => {
  const etusivu = Etusivu(page)

  await expect(async () => {
    await etusivu.goto()
    await etusivu.valitseKoulutusaste('korkeakoulutus')
    const hakuTulokset = await etusivu.hae(julkaistuMateriaaliNimi)
    await hakuTulokset.expectToFindMateriaali(julkaistuMateriaaliNimi, 5000)
  }).toPass({ timeout: 30_000, intervals: [5000] })
})

test('käyttäjä voi etsiä oppimateriaalia usean koulutusasteen perusteella', async ({ page }) => {
  const etusivu = Etusivu(page)

  await etusivu.goto()
  await page.locator('ng-select#educationalLevels').click()

  await expect(page.getByRole('option', { name: 'korkeakoulutus', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'lukiokoulutus', exact: true })).toBeVisible()
})

test('käyttäjä voi etsiä oppimateriaalia oppimateriaalin tyypin perusteella', async ({
  page,
  julkaistuMateriaaliNimi
}) => {
  const etusivu = Etusivu(page)

  await expect(async () => {
    await etusivu.goto()
    await etusivu.valitseOppimateriaalinTyyppi('teksti')
    const hakuTulokset = await etusivu.hae(julkaistuMateriaaliNimi)
    await hakuTulokset.expectToFindMateriaali(julkaistuMateriaaliNimi, 5000)
  }).toPass({ timeout: 30_000, intervals: [5000] })
})

test('käyttäjä voi etsiä oppimateriaalia usean oppimateriaalin tyypin perusteella', async ({
  page
}) => {
  const etusivu = Etusivu(page)

  await etusivu.goto()
  await page.locator('ng-select#learningResourceTypes').click()

  await expect(page.getByRole('option', { name: 'teksti', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'video', exact: true })).toBeVisible()
})

test('käyttäjä voi etsiä oppimateriaalia tieteenalan perusteella', async ({
  page,
  julkaistuMateriaaliNimi
}) => {
  const etusivu = Etusivu(page)

  await expect(async () => {
    await etusivu.goto()
    await etusivu.valitseOppiaine('Matematiikka Luonnontieteet')
    const hakuTulokset = await etusivu.hae(julkaistuMateriaaliNimi)
    await hakuTulokset.expectToFindMateriaali(julkaistuMateriaaliNimi, 5000)
  }).toPass({ timeout: 30_000, intervals: [5000] })
})

test('käyttäjä voi etsiä oppimateriaalia usean oppiaineen, tutkinnon tai tieteenalan perusteella', async ({
  page
}) => {
  const etusivu = Etusivu(page)

  await etusivu.goto()
  await page.locator('ng-select#educationalSubjects').click()

  await expect(
    page.getByRole('option', { name: 'Matematiikka Luonnontieteet', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('option', { name: 'Fysiikka Luonnontieteet', exact: true })
  ).toBeVisible()
})
