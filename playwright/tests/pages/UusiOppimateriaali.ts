import type { Page } from '@playwright/test'
import { Header } from './Header'
import { MateriaaliFormi } from './MateriaaliFormi'

export type TaytaOpts = {
  tiedostot?: Array<{
    nimi?: string
    kieli?: string
    kieliversiot?: { en: string; sv: string }
  }>
  perustiedot?: {
    kohderyhma?: string
    kayttotarkoitus?: string
    organisaatio?: string
    tekijanOrganisaatio?: string
    kuvaus?: string
    kansikuva?: boolean
  }
  koulutustiedot?: {
    koulutusasteet?: string[]
    tieteenala?: string
    tuvaOppiaine?: string
    ammatillinenTutkinnonOsa?: string
  }
  tarkemmatTiedot?: {
    ominaisuudet?: string[]
    esteet?: string[]
    vanhenemispaiva?: string
    ikaMin?: string
    ikaMax?: string
    opiskeluaika?: string
    julkaisija?: string
    esitietovaatimus?: string
  }
  hyodynnetytMateriaalit?: { author?: string; url: string; name: string }
}

export type TaytaVerkkosivuOpts = {
  koulutustiedot?: { koulutusasteet?: string[] }
}

export const UusiOppimateriaali = (page: Page) => {
  const taytaJaTallennaUusiMateriaali = async (materiaaliNimi: string, opts: TaytaOpts = {}) => {
    const { form } = MateriaaliFormi(page)
    await form.oppimateriaalinNimi(materiaaliNimi)
    const tiedostot = opts.tiedostot ?? [{}]
    for (let nth = 0; nth < tiedostot.length; nth++) {
      const tiedosto = tiedostot[nth]
      await form.lisaaTiedosto(tiedosto.nimi, nth)
      if (tiedosto.kieli) {
        await form.valitseTiedostonKieli(tiedosto.kieli, nth)
      }
      if (tiedosto.kieliversiot) {
        await form.lisaaTiedostonKieliversiot(
          tiedosto.kieliversiot.en,
          tiedosto.kieliversiot.sv,
          nth
        )
      }
    }
    const perustiedot = await form.seuraava()
    if (opts.perustiedot?.kansikuva) {
      await perustiedot.lataaKansikuva()
    }
    await perustiedot.lisaaHenkilo()
    if (opts.perustiedot?.tekijanOrganisaatio) {
      await perustiedot.valitseTekijanOrganisaatio(opts.perustiedot.tekijanOrganisaatio)
    }
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
    if (opts.perustiedot?.kuvaus) {
      await perustiedot.taytaKuvaus(opts.perustiedot.kuvaus)
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
    if (opts.tarkemmatTiedot?.vanhenemispaiva) {
      await tarkemmatTiedot.valitseVanhenemispaiva(opts.tarkemmatTiedot.vanhenemispaiva)
    }
    if (opts.tarkemmatTiedot?.ikaMin || opts.tarkemmatTiedot?.ikaMax) {
      await tarkemmatTiedot.asetaKohderyhmanIka(
        opts.tarkemmatTiedot.ikaMin ?? '',
        opts.tarkemmatTiedot.ikaMax ?? ''
      )
    }
    if (opts.tarkemmatTiedot?.opiskeluaika) {
      await tarkemmatTiedot.asetaOpiskeluaika(opts.tarkemmatTiedot.opiskeluaika)
    }
    if (opts.tarkemmatTiedot?.julkaisija) {
      await tarkemmatTiedot.lisaaJulkaisija(opts.tarkemmatTiedot.julkaisija)
    }
    if (opts.tarkemmatTiedot?.esitietovaatimus) {
      await tarkemmatTiedot.lisaaEsitietovaatimus(opts.tarkemmatTiedot.esitietovaatimus)
    }
    const lisenssitiedot = await tarkemmatTiedot.seuraava()
    await lisenssitiedot.valitseLisenssi()
    const hyodynnetytMateriaalit = await lisenssitiedot.seuraava()
    if (opts.hyodynnetytMateriaalit) {
      await hyodynnetytMateriaalit.lisaaHyodynnettyMateriaali(opts.hyodynnetytMateriaalit)
    }
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
