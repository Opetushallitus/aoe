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

  await expect(async () => {
    await etusivu.goto()
    await etusivu.valitseKoulutusaste('korkeakoulutus')
    const hakuTulokset = await etusivu.hae(julkaistuMateriaaliNimi)
    await hakuTulokset.expectToFindMateriaali(julkaistuMateriaaliNimi, 5000)
  }).toPass({ timeout: 60_000, intervals: [5000] })
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
  }).toPass({ timeout: 60_000, intervals: [5000] })
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
  }).toPass({ timeout: 60_000, intervals: [5000] })
})
