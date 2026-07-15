import { expect, test } from '@playwright/test'
import { tiedoteTest } from './fixtures/tiedoteTest'
import { BrysselEtusivu } from './pages/BrysselEtusivu'
import type { Aikajana, OptgroupedValinta, Tapa } from './pages/BrysselAnalytiikka'
import { Materiaali } from './pages/Materiaali'
import { siivoaTiedote } from './pages/BrysselTiedotteet'
import { Etusivu } from './pages/Etusivu'

test('käyttömäärät voidaan hakea eri aikajana-tarkkuuksilla', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)

  const cases: { aikajana: Aikajana; tapa: Tapa[]; expectedInterval: string }[] = [
    { aikajana: 'Päivä', tapa: ['Katselu'], expectedInterval: 'day' },
    { aikajana: 'Viikko', tapa: ['Katselu'], expectedInterval: 'week' },
    { aikajana: 'Kuukausi', tapa: ['Katselu'], expectedInterval: 'month' }
  ]

  for (const { aikajana, tapa, expectedInterval } of cases) {
    await test.step(`${aikajana}-aikajana`, async () => {
      await brysselPage.goto()
      const analytiikka = await brysselPage.clickBrysselAnalytiikka()

      const body = page
        .waitForResponse(
          (r) => r.url().includes('/materialactivity/') && r.url().includes('/total')
        )
        .then((r) => r.json())
      await analytiikka.taytaJaHaeOppimateriaalienKayttomaarat(tapa, aikajana)
      const result = await body

      expect(result.interval).toBe(expectedInterval)
      expect(Array.isArray(result.values)).toBe(true)
      await expect(analytiikka.kayttomaaraChart).toBeVisible()
    })
  }
})

test('oppimateriaalin katselu näkyy analytiikassa', async ({ page }) => {
  // 1. Go to analytics and record the initial view count
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeMaterialActivityYhteensa({ tapa: ['Katselu'] })

  // 2. Create a material
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka katselu')
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  // 3. View the material to trigger a view event
  await page.goto(`/materiaali/${materiaaliNumero}`)
  await expect(page.getByRole('heading', { name: materiaaliNimi })).toBeVisible()
  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeMaterialActivityYhteensa({ tapa: ['Katselu'] })

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
})

test('oppimateriaalin lataus näkyy analytiikassa', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka lataus')
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await Materiaali(page).getMateriaaliNumero()

  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeMaterialActivityYhteensa({ tapa: ['Lataus'] })

  await page.goto(`/materiaali/${materiaaliNumero}`)
  await expect(page.getByRole('heading', { name: materiaaliNimi })).toBeVisible()
  const materiaaliPage = Materiaali(page)
  await materiaaliPage.lataaDropdown.click()
  await materiaaliPage.lataaTiedosto('blank')

  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeMaterialActivityYhteensa({ tapa: ['Lataus'] })

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
})

test('oppimateriaalin muokkaus näkyy analytiikassa', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka muokkaus')
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await Materiaali(page).getMateriaaliNumero()

  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeMaterialActivityYhteensa({ tapa: ['Muokkaus'] })

  await etusivu.goto()
  const omatMateriaalitUudelleen = await etusivu.header.clickOmatMateriaalit()
  await omatMateriaalitUudelleen.startToEditMateriaaliNumero(materiaaliNumero)

  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeMaterialActivityYhteensa({ tapa: ['Muokkaus'] })

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
})

test('uusi oppimateriaali näkyy julkaisumäärissä', async ({ page }) => {
  // 1. Go to analytics and record the initial published count for korkeakoulutus
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeJulkaisumaaratYhteensa({
    luokitus: 'Opetusasteet',
    valinnat: ['korkeakoulutus']
  })

  // 2. Create a material (uses korkeakoulutus educational level)
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka julkaisu')
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)

  // 3. Query again and assert published count increased
  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeJulkaisumaaratYhteensa({
    luokitus: 'Opetusasteet',
    valinnat: ['korkeakoulutus']
  })

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.julkaisuChart).toBeVisible()
})

test('uusi oppimateriaali näkyy oppiaineiden julkaisumäärissä', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeJulkaisumaaratYhteensa({
    luokitus: 'Oppiaineet',
    valinnat: [{ nimi: 'Matematiikka', alaryhma: 'Luonnontieteet' }]
  })

  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka oppiaine julkaisu')
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi, {
    koulutustiedot: { tieteenala: 'Matematiikka' }
  })

  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeJulkaisumaaratYhteensa({
    luokitus: 'Oppiaineet',
    valinnat: [{ nimi: 'Matematiikka', alaryhma: 'Luonnontieteet' }]
  })

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.julkaisuChart).toBeVisible()
})

test('uusi oppimateriaali näkyy organisaatioiden julkaisumäärissä', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeJulkaisumaaratYhteensa({
    luokitus: 'Organisaatiot',
    valinnat: ['Opetushallitus']
  })

  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka org julkaisu')
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi, {
    perustiedot: { organisaatio: 'Opetushallitus' }
  })

  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeJulkaisumaaratYhteensa({
    luokitus: 'Organisaatiot',
    valinnat: ['Opetushallitus']
  })

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.julkaisuChart).toBeVisible()
})

test('hakutapahtuma tallentuu analytiikkaan', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeHakumaaratYhteensa()

  const etusivu = Etusivu(page)
  await etusivu.goto()
  const hakuTulokset = await etusivu.hae('testihaku')
  await hakuTulokset.expectNoResults()

  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeHakumaaratYhteensa()

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
})

test('haun suodattimet tallentuvat analytiikkaan', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeHakumaaratYhteensa()

  const etusivu = Etusivu(page)
  await etusivu.goto()
  await etusivu.valitseKoulutusaste('korkeakoulutus')
  await etusivu.hae('matematiikka')
  await expect(page.getByRole('heading', { name: 'Hakutulokset' })).toBeVisible()

  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeHakumaaratYhteensa()

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
})

test('hakutapahtuma tallentuu analytiikkaan kun hakutuloksia löytyy', async ({ page }) => {
  // Create a material to guarantee the search returns a result
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Haettava analytiikka')
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)

  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeHakumaaratYhteensa()

  await etusivu.goto()
  const hakuTulokset = await etusivu.hae(materiaaliNimi)
  await hakuTulokset.expectToFindMateriaali(materiaaliNimi)

  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeHakumaaratYhteensa()

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
})

test('oppimateriaalin katselu opetusastesuodattimella näkyy analytiikassa', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka suodatus')
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeMaterialActivityYhteensa({
    tapa: ['Katselu'],
    opetusasteet: ['korkeakoulutus']
  })

  await page.goto(`/materiaali/${materiaaliNumero}`)
  await expect(page.getByRole('heading', { name: materiaaliNimi })).toBeVisible()

  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeMaterialActivityYhteensa({
    tapa: ['Katselu'],
    opetusasteet: ['korkeakoulutus']
  })

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
})

test('haun opetusastesuodatin tallentuu analytiikkaan', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const alkuperainenMaara = await analytiikka.haeHakumaaratYhteensa({
    filters: { opetusasteet: ['korkeakoulutus'] }
  })

  const etusivu = Etusivu(page)
  await etusivu.goto()
  await etusivu.valitseKoulutusaste('korkeakoulutus')
  await etusivu.hae('matematiikka')
  await expect(page.getByRole('heading', { name: 'Hakutulokset' })).toBeVisible()

  await brysselPage.goto()
  const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
  const uusiMaara = await analytiikkaUudelleen.haeHakumaaratYhteensa({
    filters: { opetusasteet: ['korkeakoulutus'] }
  })

  expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
  await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
})

test('oppimateriaalin oppiaine- ja organisaatiosuodattimet toimivat analytiikassa', async ({
  page
}) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Analytiikka suodatus oppiaine')
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi, {
    perustiedot: { organisaatio: 'Opetushallitus' },
    koulutustiedot: { tieteenala: 'Matematiikka' }
  })
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  const brysselPage = BrysselEtusivu(page)

  const cases: { oppiaineet?: OptgroupedValinta[]; organisaatiot?: string[] }[] = [
    { oppiaineet: [{ nimi: 'Matematiikka', alaryhma: 'Luonnontieteet' }] },
    { organisaatiot: ['Opetushallitus'] }
  ]

  for (const filters of cases) {
    await test.step(Object.keys(filters).join(', '), async () => {
      await brysselPage.goto()
      const analytiikka = await brysselPage.clickBrysselAnalytiikka()
      const alkuperainenMaara = await analytiikka.haeMaterialActivityYhteensa({
        tapa: ['Katselu'],
        ...filters
      })

      await page.goto(`/materiaali/${materiaaliNumero}`)
      await expect(page.getByRole('heading', { name: materiaaliNimi })).toBeVisible()

      await brysselPage.goto()
      const analytiikkaUudelleen = await brysselPage.clickBrysselAnalytiikka()
      const uusiMaara = await analytiikkaUudelleen.haeMaterialActivityYhteensa({
        tapa: ['Katselu'],
        ...filters
      })

      expect(uusiMaara).toBeGreaterThan(alkuperainenMaara)
      await expect(analytiikkaUudelleen.kayttomaaraChart).toBeVisible()
    })
  }
})

test('vanhentuneet oppimateriaalit näkyvät analytiikassa', async ({ page }) => {
  const brysselPage = BrysselEtusivu(page)
  const etusivu = Etusivu(page)

  await brysselPage.goto()
  const analytiikka = await brysselPage.clickBrysselAnalytiikka()
  const maara = await analytiikka.haeVanhentuneetYhteensa(['korkeakoulutus'])

  // Non-expired material must not increase the count
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const eiVanhentunutNimi = uusiMateriaali.randomMateriaaliNimi('Ei vanhentunut')
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(eiVanhentunutNimi)

  await brysselPage.goto()
  const analytiikkaEiVanhentunut = await brysselPage.clickBrysselAnalytiikka()
  const maaraEiVanhentunut = await analytiikkaEiVanhentunut.haeVanhentuneetYhteensa([
    'korkeakoulutus'
  ])
  expect(maaraEiVanhentunut).toBe(maara)

  // Expired material must increase the count
  await etusivu.goto()
  const omatMateriaalit2 = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali2 = await omatMateriaalit2.luoUusiMateriaali()
  const vanhentunutNimi = uusiMateriaali2.randomMateriaaliNimi('Vanhentunut materiaali')
  await uusiMateriaali2.taytaJaTallennaUusiMateriaali(vanhentunutNimi, {
    tarkemmatTiedot: { vanhenemispaiva: '01.01.1970' }
  })

  await brysselPage.goto()
  const analytiikkaVanhentunut = await brysselPage.clickBrysselAnalytiikka()
  const maaraVanhentunut = await analytiikkaVanhentunut.haeVanhentuneetYhteensa(['korkeakoulutus'])
  expect(maaraVanhentunut).toBeGreaterThan(maara)
  await expect(analytiikkaVanhentunut.vanhentunutChart).toBeVisible()
})

test('Pääkäyttäjä voi arkistoida oppimateriaalin', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi()
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const materiaalienHallinta = await brysselPage.clickBrysselMateriaalinHallinta()
  await materiaalienHallinta.arkistoiMateriaali(materiaaliNumero)
  await page.goto(`/materiaali/${materiaaliNumero}`)
  await expect(
    page.getByText(
      'Tämä materiaali on arkistoitu. Lisätietoa saat palvelun ylläpitäjiltä ottamalla yhteyttä osoitteeseen aoe@oph.fi ja kysymällä materiaalista sen id:n kera.'
    )
  ).toBeVisible()
})

test('Pääkäyttäjä voi vaihtaa materiaalin omistajan', async ({ page }) => {
  // Create a material as admin (aoeuser)
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Materiaalille vaihdettu omistaja')
  const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()

  // Navigate to admin panel → Material Management
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  await brysselPage.clickBrysselMateriaalinHallinta()

  // Verify current owner on material page
  await page.goto(`/materiaali/${materiaaliNumero}`)
  await expect(page.getByTestId('material-owner')).toContainText('AOE_first AOE_last')

  // Return to admin panel → Material Management
  await brysselPage.goto()
  const materiaalienHallintaUudelleen = await brysselPage.clickBrysselMateriaalinHallinta()

  // Transfer ownership to the second user
  await materiaalienHallintaUudelleen.vaihdaOmistaja(materiaaliNumero, 'Tuomas')

  // Verify the owner changed on material page
  await page.goto(`/materiaali/${materiaaliNumero}`)
  await expect(page.getByTestId('material-owner')).toContainText('Tuomas Jukola')
})

tiedoteTest(
  'Pääkäyttäjä voi luoda INFO-tiedotteen, se näkyy julkisesti ja sen voi poistaa',
  async ({ page, tiedotteet }) => {
    const tiedoteTeksti = `Testitiedote INFO ${Date.now()}`
    await tiedotteet.luoTiedote('Yleinen tiedote tai ohjeistus palvelun käyttäjille', tiedoteTeksti)

    await expect(tiedotteet.notificationTable.getByText(tiedoteTeksti)).toBeVisible()

    await page.goto('/')
    await expect(page.getByText('Mitä haluat oppia?')).toBeVisible()
    const notification = page.locator('.alert-warning .service-notification', {
      hasText: tiedoteTeksti
    })
    await expect(notification).toBeVisible()

    const brysselPage = BrysselEtusivu(page)
    await brysselPage.goto()
    const tiedotteetDelete = await brysselPage.clickBrysselPalvelunHallinta()
    await tiedotteetDelete.poistaTiedote(tiedoteTeksti)

    await page.goto('/')
    await expect(page.getByText('Mitä haluat oppia?')).toBeVisible()
    await expect(
      page.locator('.service-notification', { hasText: tiedoteTeksti })
    ).not.toBeVisible()
  }
)

tiedoteTest(
  'Pääkäyttäjä voi luoda ERROR-tiedotteen ja se näkyy julkisesti',
  async ({ page, tiedotteet }) => {
    const tiedoteTeksti = `Testitiedote ERROR ${Date.now()}`
    await tiedotteet.luoTiedote('Tekninen häiriö tai käyttöä rajoittava tapahtuma', tiedoteTeksti)

    await expect(tiedotteet.notificationTable.getByText(tiedoteTeksti)).toBeVisible()

    await page.goto('/')
    await expect(page.getByText('Mitä haluat oppia?')).toBeVisible()
    const notification = page.locator('.alert-danger .service-notification', {
      hasText: tiedoteTeksti
    })
    await expect(notification).toBeVisible()

    await siivoaTiedote(page, tiedoteTeksti)
  }
)

tiedoteTest('Tuleva tiedote ei näy julkisesti', async ({ page, tiedotteet }) => {
  const tiedoteTeksti = `Tuleva tiedote ${Date.now()}`
  await tiedotteet.luoTulevaTiedote(
    'Yleinen tiedote tai ohjeistus palvelun käyttäjille',
    tiedoteTeksti
  )

  await tiedotteet.naytaTulevatTiedotteet()
  await expect(tiedotteet.notificationTable.getByText(tiedoteTeksti)).toBeVisible()

  await page.goto('/')
  await expect(page.getByText('Mitä haluat oppia?')).toBeVisible()
  await expect(page.locator('.service-notification', { hasText: tiedoteTeksti })).not.toBeVisible()

  await siivoaTiedote(page, tiedoteTeksti)
})

tiedoteTest('Tiedotelomakkeen validointi toimii', async ({ page, tiedotteet }) => {
  await expect(tiedotteet.submitButton).toBeDisabled()

  await tiedotteet.notificationTextInput.pressSequentially('Testiteksti')
  await expect(tiedotteet.submitButton).toBeDisabled()

  await tiedotteet.notificationTextInput.clear()
  await tiedotteet.notificationTypeSelect.click()
  await page
    .getByRole('option', {
      name: 'Yleinen tiedote tai ohjeistus palvelun käyttäjille'
    })
    .click()
  await expect(tiedotteet.submitButton).toBeDisabled()

  await tiedotteet.notificationTextInput.pressSequentially('Testiteksti')
  await expect(tiedotteet.submitButton).toBeEnabled()
})
