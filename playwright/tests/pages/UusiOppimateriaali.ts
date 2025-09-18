import type { Page } from '@playwright/test'
import { Header } from './Header'
import { MateriaaliFormi } from './MateriaaliFormi'

export const UusiOppimateriaali = (page: Page) => {
  const taytaJaTallennaUusiMateriaali = async (materiaaliNimi: string) => {
    const { form } = MateriaaliFormi(page)
    await form.oppimateriaalinNimi(materiaaliNimi)
    await form.lisaaTiedosto()
    const perustiedot = await form.seuraava()
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
    return await esikatseluJaTallennus.tallenna(materiaaliNimi)
  }
  const taytaJaTallennaUusiVerkkosivuMateriaali = async (
    materiaaliNimi: string,
    verkkosivu: string
  ) => {
    const { form } = MateriaaliFormi(page)
    await form.oppimateriaalinNimi(materiaaliNimi)
    await form.lisaaVerkkosivu(verkkosivu)
    const perustiedot = await form.seuraava()
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
    return await esikatseluJaTallennus.tallenna(materiaaliNimi)
  }
  return {
    header: Header(page),
    ...MateriaaliFormi(page),
    taytaJaTallennaUusiMateriaali,
    taytaJaTallennaUusiVerkkosivuMateriaali
  }
}
