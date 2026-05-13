import type { Page } from '@playwright/test'
import { Header } from './Header'
import { MateriaaliFormi } from './MateriaaliFormi'

export type TaytaOpts = {
  tiedostot?: { kieli?: string }
  perustiedot?: { kohderyhma?: string; kayttotarkoitus?: string; organisaatio?: string }
  koulutustiedot?: {
    koulutusasteet?: string[]
    tieteenala?: string
    tuvaOppiaine?: string
    ammatillinenTutkinnonOsa?: string
  }
  tarkemmatTiedot?: {
    ominaisuudet?: string[]
    esteet?: string[]
  }
}

export type TaytaVerkkosivuOpts = {
  koulutustiedot?: { koulutusasteet?: string[] }
}

export const UusiOppimateriaali = (page: Page) => {
  const taytaJaTallennaUusiMateriaali = async (materiaaliNimi: string, opts: TaytaOpts = {}) => {
    const { form } = MateriaaliFormi(page)
    await form.oppimateriaalinNimi(materiaaliNimi)
    await form.lisaaTiedosto()
    if (opts.tiedostot?.kieli) {
      await form.valitseTiedostonKieli(opts.tiedostot.kieli)
    }
    const perustiedot = await form.seuraava()
    await perustiedot.lisaaHenkilo()
    await perustiedot.lisaaAsiasana()
    await perustiedot.lisaaOppimateriaalinTyyppi()
    if (opts.perustiedot?.kohderyhma) {
      await perustiedot.lisaaPaaasiallinenKohderyhma(opts.perustiedot.kohderyhma)
    }
    if (opts.perustiedot?.kayttotarkoitus) {
      await perustiedot.lisaaPaaasiallinenKayttotarkoitus(opts.perustiedot.kayttotarkoitus)
    }
    if (opts.perustiedot?.organisaatio) {
      await perustiedot.lisaaOrganisaatio(opts.perustiedot.organisaatio)
    }
    const koulutustiedot = await perustiedot.seuraava()
    const koulutusasteet = opts.koulutustiedot?.koulutusasteet ?? ['korkeakoulutus']
    await koulutustiedot.valitseKoulutusasteet(...koulutusasteet)
    if (opts.koulutustiedot?.tuvaOppiaine) {
      await koulutustiedot.valitseTutkintoonValmistavanKoulutuksenOppiaine(
        opts.koulutustiedot.tuvaOppiaine
      )
    }
    if (opts.koulutustiedot?.tieteenala) {
      await koulutustiedot.valitseTieteenala(opts.koulutustiedot.tieteenala)
    }
    if (opts.koulutustiedot?.ammatillinenTutkinnonOsa) {
      await koulutustiedot.valitseAmmatillisenKoulutuksenYhteinenTutkinnonOsa(
        opts.koulutustiedot.ammatillinenTutkinnonOsa
      )
    }
    const tarkemmatTiedot = await koulutustiedot.seuraava()
    if (opts.tarkemmatTiedot?.ominaisuudet) {
      await tarkemmatTiedot.valitseSaavutettavuudenOminaisuudet(
        ...opts.tarkemmatTiedot.ominaisuudet
      )
    }
    if (opts.tarkemmatTiedot?.esteet) {
      await tarkemmatTiedot.valitseSaavutettavuudenEsteet(...opts.tarkemmatTiedot.esteet)
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
    opts: TaytaVerkkosivuOpts = {}
  ) => {
    const { form } = MateriaaliFormi(page)
    await form.oppimateriaalinNimi(materiaaliNimi)
    await form.lisaaVerkkosivu(verkkosivu)
    const perustiedot = await form.seuraava()
    await perustiedot.lisaaHenkilo()
    await perustiedot.lisaaAsiasana()
    await perustiedot.lisaaOppimateriaalinTyyppi()
    const koulutustiedot = await perustiedot.seuraava()
    const koulutusasteet = opts.koulutustiedot?.koulutusasteet ?? ['korkeakoulutus']
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
