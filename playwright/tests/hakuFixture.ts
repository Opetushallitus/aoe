import { test as base } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import { MateriaaliFormi } from './pages/MateriaaliFormi'

export const test = base.extend<{ julkaistuMateriaaliNimi: string }>({
  julkaistuMateriaaliNimi: async ({ page }, use) => {
    const etusivu = Etusivu(page)
    await etusivu.goto()

    const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
    await omatMateriaalit.locators.luoUusiMateriaali.click()

    const { form, randomMateriaaliNimi } = MateriaaliFormi(page)
    const materiaaliNimi = randomMateriaaliNimi()

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
    await esikatseluJaTallennus.tallenna(materiaaliNimi)

    await use(materiaaliNimi)
  }
})
