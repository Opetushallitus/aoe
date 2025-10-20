import { expect, test } from '@playwright/test'
import { BrysselEtusivu } from './pages/BrysselEtusivu'

test('käyttäjä voi hakea analytiikka sivulta oppimateriaaalien käyttömääriä', async ({
  page,
}) => {
  const etusivu = BrysselEtusivu(page)
  await etusivu.goto()

  const analytiikka = await etusivu.clickTopic('analytiikka')
  await analytiikka.taytaJaHaeOppimateriaalienKayttomaarat(
    ['Haku', 'Katselu'],
    'Kuukausi'
  )

  await expect(analytiikka.kayttomaaraChart).toBeVisible()
})
test('käyttäjä voi hakea analytiikka sivulta oppimateriaaalien käyttömääriä', async ({
  page,
}) => {
  const etusivu = BrysselEtusivu(page)
  await etusivu.goto()

  const analytiikka = await etusivu.clickTopic('analytiikka')
  await analytiikka.taytaJaHaeOppimateriaalienKayttomaarat(
    ['Haku', 'Katselu'],
    'Kuukausi'
  )

  await expect(analytiikka.kayttomaaraChart).toBeVisible()
})
