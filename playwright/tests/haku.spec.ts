import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import { MateriaaliFormi } from './pages/MateriaaliFormi'

test.describe
  .serial('haku', () => {
    let materiaaliNimi: string

    test('luo oppimateriaali ja odota indeksointia', async ({ page }) => {
      test.setTimeout(120_000)

      const etusivu = Etusivu(page)
      await etusivu.goto()

      const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
      await omatMateriaalit.locators.luoUusiMateriaali.click()
      const { form, randomMateriaaliNimi } = MateriaaliFormi(page)
      materiaaliNimi = randomMateriaaliNimi()
      await form.oppimateriaalinNimi(materiaaliNimi)
      await form.lisaaTiedosto()
      const perustiedot = await form.seuraava()
      await perustiedot.lisaaHenkilo()
      await perustiedot.lisaaAsiasana()
      await perustiedot.lisaaOppimateriaalinTyyppi()
      const koulutustiedot = await perustiedot.seuraava()
      await koulutustiedot.valitseKoulutusasteet('korkeakoulutus')
      await koulutustiedot.valitseTieteenala('Matematiikka')
      const tarkemmatTiedot = await koulutustiedot.seuraava()
      const lisenssitiedot = await tarkemmatTiedot.seuraava()
      await lisenssitiedot.valitseLisenssi()
      const hyodynnetytMateriaalit = await lisenssitiedot.seuraava()
      const esikatseluJaTallennus = await hyodynnetytMateriaalit.seuraava()
      const materiaali = await esikatseluJaTallennus.tallenna(materiaaliNimi)
      await materiaali.expectHeading(materiaaliNimi)

      const hakuTulos = page.locator('article.search-result h1 a', {
        hasText: materiaaliNimi
      })
      await expect(async () => {
        await etusivu.goto()
        await etusivu.hae(materiaaliNimi)
        await expect(hakuTulos).toBeVisible({ timeout: 5000 })
      }).toPass({ timeout: 60_000, intervals: [5000] })
    })

    test('käyttäjä voi etsiä luodun oppimateriaalin etusivun haulla', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()

      const hakuTulokset = await etusivu.hae(materiaaliNimi)
      await hakuTulokset.expectToFindMateriaali(materiaaliNimi)

      const avattuMateriaali = await hakuTulokset.clickMateriaali(materiaaliNimi)
      await avattuMateriaali.expectHeading(materiaaliNimi)
    })

    test('käyttäjä voi etsiä oppimateriaalia koulutusasteen perusteella', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()

      await etusivu.valitseKoulutusaste('korkeakoulutus')
      const hakuTulokset = await etusivu.hae(materiaaliNimi)
      await hakuTulokset.expectToFindMateriaali(materiaaliNimi)
    })

    test('käyttäjä voi etsiä oppimateriaalia oppimateriaalin tyypin perusteella', async ({
      page
    }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()

      await etusivu.valitseOppimateriaalinTyyppi('teksti')
      const hakuTulokset = await etusivu.hae(materiaaliNimi)
      await hakuTulokset.expectToFindMateriaali(materiaaliNimi)
    })

    test('käyttäjä voi etsiä oppimateriaalia tieteenalan perusteella', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()

      await etusivu.valitseOppiaine('Matematiikka Luonnontieteet')
      const hakuTulokset = await etusivu.hae(materiaaliNimi)
      await hakuTulokset.expectToFindMateriaali(materiaaliNimi)
    })

    test('väärä koulutusaste ei löydä oppimateriaalia', async ({ page }) => {
      const etusivu = Etusivu(page)
      await etusivu.goto()

      await etusivu.valitseKoulutusaste('esiopetus')
      const hakuTulokset = await etusivu.hae(materiaaliNimi)
      await hakuTulokset.expectNoResults()
    })
  })
