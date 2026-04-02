import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

test('käyttäjä voi ladata kansikuvan uudelle oppimateriaalille', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()

  const { form } = uusiMateriaali
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Thumbnail test')
  await form.oppimateriaalinNimi(materiaaliNimi)
  await form.lisaaTiedosto()

  // Navigate to Perustiedot tab where the thumbnail upload lives
  const perustiedot = await form.seuraava()
  await perustiedot.lataaKansikuva()
  await perustiedot.lisaaHenkilo()
  await perustiedot.lisaaAsiasana()
  await perustiedot.lisaaOppimateriaalinTyyppi()
  const koulutustiedot = await perustiedot.seuraava()
  await koulutustiedot.valitseKoulutusasteet('korkeakoulutus')
  const tarkemmatTiedot = await koulutustiedot.seuraava()
  const lisenssitiedot = await tarkemmatTiedot.seuraava()
  await lisenssitiedot.valitseLisenssi()
  const hyodynnetytMateriaalit = await lisenssitiedot.seuraava()
  const esikatseluJaTallennus = await hyodynnetytMateriaalit.seuraava()
  await esikatseluJaTallennus.tallenna(materiaaliNimi)

  // Verify a user-uploaded thumbnail is shown (served from the backend API, not a default)
  const materialThumbnail = page.locator('img[alt="Oppimateriaalin kansikuva"][src*="/api/"]')
  await expect(materialThumbnail).toBeVisible()
})
