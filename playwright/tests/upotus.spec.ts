import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

test('upotusnäkymä näyttää materiaalin ja sen tiedoston kirjautumattomalle käyttäjälle', async ({
  page,
  browser
}) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi()
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi, {
    tiedostot: [{ nimi: 'test-image.png' }]
  })
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  // The embed view is cookie-free by design, so it is tested without the stored auth state.
  const kirjautumatonKonteksti = await browser.newContext({ storageState: undefined })
  const upotus = await kirjautumatonKonteksti.newPage()
  await upotus.goto(`/embed/${materiaaliNumero}/fi`)

  await expect(upotus.getByRole('link', { name: materiaaliNimi })).toBeVisible()

  // naturalWidth proves the file bytes arrived; toBeVisible alone passes on a broken image.
  const kuva = upotus.locator('img.img-fluid')
  await expect(kuva).toBeVisible()
  expect(await kuva.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)

  expect(await kirjautumatonKonteksti.cookies()).not.toContainEqual(
    expect.objectContaining({ name: 'connect.sid' })
  )
})
