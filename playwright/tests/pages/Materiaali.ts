import { expect, type Page } from '@playwright/test'
import { Header } from './Header'
import { blob as blobConsumer } from 'node:stream/consumers'

export const Materiaali = (page: Page) => {
  const locators = {
    lataaDropdown: page.getByRole('button', { name: 'Lataa' }),
    lisaaArvioButton: page.getByRole('button', { name: 'Lisää arvio' }),
    katsoKaikkiArviotLink: page.getByRole('link', { name: 'Katso kaikki arviot' }),
    sisaltoAverage: page
      .locator('div')
      .filter({ has: page.getByText('Sisältö:', { exact: true }) })
      .first(),
    ulkoasuAverage: page
      .locator('div')
      .filter({ has: page.getByText('Ulkoasu:', { exact: true }) })
      .first(),
    preview: async (tiedosto: string) => {
      const materiaaliNumero = await getMateriaaliNumero()
      return page.getByTestId(`preview-${materiaaliNumero}-${tiedosto}`)
    },
    versiohistoriaToggle: page.getByRole('button', { name: 'Versiohistoria' }),
    versiohistoriaItems: page.locator('#version-history .dropdown-item-version-history')
  }

  const expectHeading = async (materiaali: string) => {
    await expect(page.getByRole('heading', { name: materiaali })).toBeVisible()
  }

  const getMateriaaliNumero = async () => {
    await page.waitForURL(/https:\/\/demo.aoe.fi\/#\/materiaali\/\d+/, {
      waitUntil: 'domcontentloaded'
    })
    const oppimateriaaliNumero = Number(page.url().split('/').reverse().at(0))
    expect(oppimateriaaliNumero).toBeGreaterThan(0)
    return oppimateriaaliNumero
  }

  const lataaTiedosto = async (materiaaliNimi: string) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('link', { name: materiaaliNimi }).click()
    const download = await downloadPromise
    return await blobConsumer(await download.createReadStream())
  }

  const lataaKaikkiTiedostot = async () => {
    return lataaTiedosto('Lataa kaikki tiedostot')
  }

  const expectVersiohistoriaPiilotettu = async () => {
    await expect(locators.versiohistoriaToggle).toBeHidden()
  }

  const expectVersiohistoriaNakyvissa = async () => {
    await expect(locators.versiohistoriaToggle).toBeVisible()
  }

  const avaaVersiohistoria = async () => {
    if (!(await locators.versiohistoriaItems.first().isVisible())) {
      await locators.versiohistoriaToggle.click()
    }
    await expect(locators.versiohistoriaItems.first()).toBeVisible()
    return locators.versiohistoriaItems
  }

  const valitseVersio = async (index: number) => {
    await avaaVersiohistoria()
    await locators.versiohistoriaItems.nth(index).click()
    await page.waitForURL(/\/#\/materiaali\/\d+\/\d+/, { waitUntil: 'domcontentloaded' })
  }

  // The tablist renders file names with the extension stripped (e.g. 'blank.pdf' -> 'blank'),
  // so callers can pass either the real file name or the bare stem.
  const tabNameForFile = (fileName: string) => fileName.replace(/\.[^.]+$/, '')

  const expectTiedosto = async (fileName: string) => {
    await expect(
      page.getByRole('tab', { name: tabNameForFile(fileName), exact: true })
    ).toBeVisible()
  }

  const expectEiTiedostoa = async (fileName: string) => {
    await expect(
      page.getByRole('tab', { name: tabNameForFile(fileName), exact: true })
    ).toHaveCount(0)
  }

  const clickVerkkosivu = async () => {
    const materiaaliNumero = await getMateriaaliNumero()
    await page.getByTestId(`preview-link-${materiaaliNumero}`).click()
  }
  const lisaaKokoelmaan = async (kokoelmaName: string) => {
    await page.getByRole('button', { name: 'Lisää kokoelmaan' }).click()
    await page.getByRole('textbox', { name: 'Kokoelman nimi' }).fill(kokoelmaName)
    await page.getByRole('button', { name: 'Tallenna' }).click()
    await page.getByLabel(kokoelmaName).click({ force: true })
    await page.getByRole('button', { name: 'Lisää', exact: true }).click()
  }

  const lisaaArvio = async (arvio: {
    ratingContent: string
    ratingVisual: string
    feedbackPositive: string
    feedbackSuggest: string
    feedbackPurpose: string
  }) => {
    await locators.lisaaArvioButton.click()
    await page.getByLabel('Sisältö (1-5)').waitFor({ state: 'visible' })
    await page.getByLabel('Sisältö (1-5)').fill(arvio.ratingContent)
    await page.getByLabel('Ulkoasu (1-5)').fill(arvio.ratingVisual)
    await page.getByLabel('Mitä hyvää materiaalissa on?').fill(arvio.feedbackPositive)
    await page.getByLabel('Mitä voisi vielä kehittää?').fill(arvio.feedbackSuggest)
    await page.getByLabel('Miten hyödynsin materiaalia?').fill(arvio.feedbackPurpose)
    await page.getByRole('button', { name: 'Tallenna' }).click()
    await expect(page.getByRole('heading', { name: 'Lisää arvio' })).not.toBeVisible()
  }

  const clickKatsoKaikkiArviot = async () => {
    await locators.katsoKaikkiArviotLink.click()
  }

  return {
    header: Header(page),
    ...locators,
    expectHeading,
    getMateriaaliNumero,
    lataaTiedosto,
    lataaKaikkiTiedostot,
    clickVerkkosivu,
    lisaaKokoelmaan,
    lisaaArvio,
    clickKatsoKaikkiArviot,
    expectVersiohistoriaPiilotettu,
    expectVersiohistoriaNakyvissa,
    avaaVersiohistoria,
    valitseVersio,
    expectTiedosto,
    expectEiTiedostoa
  }
}
