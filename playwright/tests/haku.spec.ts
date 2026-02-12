import { expect } from '@playwright/test'
import { test } from './hakuFixture'
import { Etusivu } from './pages/Etusivu'

test('käyttäjä voi etsiä luodun oppimateriaalin etusivun haulla', async ({
  page,
  julkaistuMateriaaliNimi
}) => {
  const etusivu = Etusivu(page)
  const hakuTulosLinkki = page.locator('article.search-result h1 a', {
    hasText: julkaistuMateriaaliNimi
  })

  await expect(async () => {
    await etusivu.goto()
    await etusivu.hae(julkaistuMateriaaliNimi)
    await expect(hakuTulosLinkki).toBeVisible({ timeout: 5000 })
  }).toPass({ timeout: 60_000, intervals: [5000] })

  const hakuTulokset = await etusivu.hae(julkaistuMateriaaliNimi)
  const avattuMateriaali = await hakuTulokset.clickMateriaali(julkaistuMateriaaliNimi)
  await avattuMateriaali.expectHeading(julkaistuMateriaaliNimi)
})

test('käyttäjä voi etsiä oppimateriaalia koulutusasteen perusteella', async ({
  page,
  julkaistuMateriaaliNimi
}) => {
  const etusivu = Etusivu(page)
  const hakuTulosLinkki = page.locator('article.search-result h1 a', {
    hasText: julkaistuMateriaaliNimi
  })

  await expect(async () => {
    await etusivu.goto()
    await etusivu.valitseKoulutusaste('korkeakoulutus')
    await etusivu.hae(julkaistuMateriaaliNimi)
    await expect(hakuTulosLinkki).toBeVisible({ timeout: 5000 })
  }).toPass({ timeout: 60_000, intervals: [5000] })
})

test('käyttäjä voi etsiä oppimateriaalia oppimateriaalin tyypin perusteella', async ({
  page,
  julkaistuMateriaaliNimi
}) => {
  const etusivu = Etusivu(page)
  const hakuTulosLinkki = page.locator('article.search-result h1 a', {
    hasText: julkaistuMateriaaliNimi
  })

  await expect(async () => {
    await etusivu.goto()
    await etusivu.valitseOppimateriaalinTyyppi('teksti')
    await etusivu.hae(julkaistuMateriaaliNimi)
    await expect(hakuTulosLinkki).toBeVisible({ timeout: 5000 })
  }).toPass({ timeout: 60_000, intervals: [5000] })
})

test('käyttäjä voi etsiä oppimateriaalia tieteenalan perusteella', async ({
  page,
  julkaistuMateriaaliNimi
}) => {
  const etusivu = Etusivu(page)
  const hakuTulosLinkki = page.locator('article.search-result h1 a', {
    hasText: julkaistuMateriaaliNimi
  })

  await expect(async () => {
    await etusivu.goto()
    await etusivu.valitseOppiaine('Matematiikka Luonnontieteet')
    await etusivu.hae(julkaistuMateriaaliNimi)
    await expect(hakuTulosLinkki).toBeVisible({ timeout: 5000 })
  }).toPass({ timeout: 60_000, intervals: [5000] })
})
