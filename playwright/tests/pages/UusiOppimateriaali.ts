import type { Page } from '@playwright/test'
import { Header } from './Header'
import { MateriaaliFormi } from './MateriaaliFormi'

export const UusiOppimateriaali = (page: Page) => {
  const taytaJaTallennaUusiMateriaali = async (
    materiaaliNimi: string,
    koulutusasteet = ['korkeakoulutus'],
    additionalFields = true
  ) => {
    const { form } = MateriaaliFormi(page)
    await form.oppimateriaalinNimi(materiaaliNimi)
    await form.lisaaTiedosto()
    const perustiedot = await form.seuraava()
    await perustiedot.lisaaHenkilo()
    await perustiedot.lisaaAsiasana()
    await perustiedot.lisaaOppimateriaalinTyyppi()
    const koulutustiedot = await perustiedot.seuraava()
    await koulutustiedot.valitseKoulutusasteet(...koulutusasteet)
    if (additionalFields && koulutusasteet.includes('tutkintoon valmentava koulutus, TUVA')) {
      await koulutustiedot.valitseTutkintoonValmistavanKoulutuksenOppiaine(
        'Perustaitojen vahvistaminen'
      )
    }
    if (additionalFields && koulutusasteet.includes('korkeakoulutus')) {
      await koulutustiedot.valitseTieteenala('Metsätiede')
    }
    if (additionalFields && koulutusasteet.includes('ammatillinen koulutus')) {
      await koulutustiedot.valitseAmmatillisenKoulutuksenYhteinenTutkinnonOsa(
        'Huippuosaajana toimiminen'
      )
    }
    const tarkemmatTiedot = await koulutustiedot.seuraava()
    if (additionalFields) {
      await tarkemmatTiedot.valitseSaavutettavuudenOminaisuudet('tekstitys', 'selkokieli')
      await tarkemmatTiedot.valitseSaavutettavuudenEsteet('ei äänihaittaa')
    }
    const lisenssitiedot = await tarkemmatTiedot.seuraava()
    await lisenssitiedot.valitseLisenssi()
    const hyodynnetytMateriaalit = await lisenssitiedot.seuraava()
    const esikatseluJaTallennus = await hyodynnetytMateriaalit.seuraava()
    return await esikatseluJaTallennus.tallenna(materiaaliNimi)
  }
  const taytaJaTallennaUusiVerkkosivuMateriaali = async (
    materiaaliNimi: string,
    verkkosivu: string,
    koulutusasteet = ['korkeakoulutus']
  ) => {
    const { form } = MateriaaliFormi(page)
    await form.oppimateriaalinNimi(materiaaliNimi)
    await form.lisaaVerkkosivu(verkkosivu)
    const perustiedot = await form.seuraava()
    await perustiedot.lisaaHenkilo()
    await perustiedot.lisaaAsiasana()
    await perustiedot.lisaaOppimateriaalinTyyppi()
    const koulutustiedot = await perustiedot.seuraava()
    await koulutustiedot.valitseKoulutusasteet(...koulutusasteet)
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
