import * as path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'
import type { Materiaali } from './pages/Materiaali'
import type { UusiOppimateriaali } from './pages/UusiOppimateriaali'

type MateriaaliPage = ReturnType<typeof Materiaali>
type UusiMateriaaliPage = ReturnType<typeof UusiOppimateriaali>

test('käyttäjä voi vaihtaa materiaalin kolmen version välillä', async ({ page }) => {
  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('Versiohistoria materiaali')

  const materiaali = await luoMateriaaliKahdellaTiedostolla(uusiMateriaali, materiaaliNimi)
  const materiaaliNumero = await materiaali.getMateriaaliNumero()
  await materiaali.expectVersiohistoriaPiilotettu()
  await materiaali.expectTiedosto('blank.pdf')
  await materiaali.expectTiedosto('aoe_test_file.pdf')

  await poistaTiedostoJaTallenna(
    page,
    materiaali,
    materiaaliNumero,
    materiaaliNimi,
    'aoe_test_file.pdf'
  )
  await materiaali.expectVersiohistoriaNakyvissa()
  await expect(await materiaali.avaaVersiohistoria()).toHaveCount(2)
  await materiaali.expectTiedosto('blank.pdf')
  await materiaali.expectEiTiedostoa('aoe_test_file.pdf')

  await lisaaTiedostoJaTallenna(
    page,
    materiaali,
    materiaaliNumero,
    materiaaliNimi,
    'aoe_test_file.pdf',
    'aoe_test_file'
  )
  await expect(await materiaali.avaaVersiohistoria()).toHaveCount(3)
  await materiaali.expectTiedosto('blank.pdf')
  await materiaali.expectTiedosto('aoe_test_file.pdf')

  // Dropdown is newest-first: 0 = v3, 1 = v2, 2 = v1.
  await materiaali.valitseVersio(1)
  await materiaali.expectTiedosto('blank.pdf')
  await materiaali.expectEiTiedostoa('aoe_test_file.pdf')

  await materiaali.valitseVersio(2)
  await materiaali.expectTiedosto('blank.pdf')
  await materiaali.expectTiedosto('aoe_test_file.pdf')

  await materiaali.valitseVersio(0)
  await materiaali.expectTiedosto('blank.pdf')
  await materiaali.expectTiedosto('aoe_test_file.pdf')
})

const luoMateriaaliKahdellaTiedostolla = async (
  uusiMateriaali: UusiMateriaaliPage,
  nimi: string
): Promise<MateriaaliPage> => {
  const { form } = uusiMateriaali
  await form.oppimateriaalinNimi(nimi)
  await form.lisaaTiedosto('blank.pdf', 0)
  await form.lisaaTiedosto('aoe_test_file.pdf', 1)
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
  return esikatseluJaTallennus.tallenna(nimi)
}

const poistaTiedostoJaTallenna = async (
  page: Page,
  materiaali: MateriaaliPage,
  materiaaliNumero: number,
  materiaaliNimi: string,
  tiedostoNimi: string
) => {
  const muokkaa = await avaaMuokkaus(materiaali, materiaaliNumero)
  const tiedostoIndex = await etsiTiedostoRivi(page, tiedostoNimi)
  await page.getByRole('button', { name: 'Poista' }).nth(tiedostoIndex).click()
  const esikatselu = await muokkaa.form.siirryEsikatseluun()
  await esikatselu.tallenna(materiaaliNimi)
}

// Concurrent uploads during creation mean edit-form row order isn't the creation order,
// so look up the row by filename. Poll to ride out the async FormArray patch.
const etsiTiedostoRivi = async (page: Page, tiedostoNimi: string): Promise<number> => {
  const inputs = page.locator('input[readonly][formcontrolname="file"]')
  let targetIndex = -1
  await expect
    .poll(
      async () => {
        const values = await Promise.all((await inputs.all()).map((input) => input.inputValue()))
        targetIndex = values.indexOf(tiedostoNimi)
        return targetIndex
      },
      { message: `${tiedostoNimi} row must appear in edit form` }
    )
    .not.toBe(-1)
  return targetIndex
}

const lisaaTiedostoJaTallenna = async (
  page: Page,
  materiaali: MateriaaliPage,
  materiaaliNumero: number,
  materiaaliNimi: string,
  tiedostoNimi: string,
  displayName: string
) => {
  const muokkaa = await avaaMuokkaus(materiaali, materiaaliNumero)
  await page.getByRole('button', { name: 'Lisää tiedosto' }).click()
  await page
    .locator('[id^="newMaterialFile"]')
    .last()
    .setInputFiles(path.join(__dirname, `../test-files/${tiedostoNimi}`))
  await page.locator('ng-select[id^="newMaterialLanguage"]').last().click()
  await page.getByRole('option', { name: 'suomi' }).click()
  await page.locator('[id^="newMaterialDisplayName"]').last().fill(displayName)
  const esikatselu = await muokkaa.form.siirryEsikatseluun()
  await esikatselu.tallenna(materiaaliNimi)
}

const avaaMuokkaus = async (materiaali: MateriaaliPage, materiaaliNumero: number) => {
  const omat = await materiaali.header.clickOmatMateriaalit()
  return omat.startToEditMateriaaliNumero(materiaaliNumero)
}
