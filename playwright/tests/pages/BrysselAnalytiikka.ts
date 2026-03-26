import type { Page } from '@playwright/test'

export const BrysselAnalyytiikka = (page: Page) => {
  const locators = {
    // Käyttömäärät (usage)
    tapaInput: page.getByTestId('käyttötapa'),
    aikajana: page.getByTestId('aikajana'),
    kayttomaaraButton: page.getByTestId('käyttömäärä-button'),
    kayttomaaraChart: page.getByTestId('käyttömäärä-chart'),
    kayttomaaraTyhjennaButton: page.getByTestId('käyttömäärä-tyhjennä'),

    // Julkaisumäärät (published)
    julkaisuLuokitus: page.getByTestId('julkaisu-luokitus'),
    julkaisuButton: page.getByTestId('julkaisu-button'),
    julkaisuChart: page.getByTestId('julkaisu-chart'),
    julkaisuTyhjennaButton: page.getByTestId('julkaisu-tyhjennä'),

    // Vanhentuneet (expired)
    vanhentunutOpetusasteet: page.getByTestId('vanhentunut-opetusasteet'),
    vanhentunutButton: page.getByTestId('vanhentunut-button'),
    vanhentunutChart: page.getByTestId('vanhentunut-chart'),
    vanhentunutTyhjennaButton: page.getByTestId('vanhentunut-tyhjennä')
  }

  const goto = async () => {
    await page.bringToFront()
    await page.goto('/#/bryssel/analytiikka', { waitUntil: 'domcontentloaded' })
  }

  const taytaJaHaeOppimateriaalienKayttomaarat = async (
    tapaList: ('Haku' | 'Katselu' | 'Lataus' | ('Muokkaus' & {}))[],
    aikajana: 'Päivä' | 'Viikko' | ('Kuukausi' & {})
  ) => {
    await locators.tapaInput.click()
    for (const tapa of tapaList) {
      await page.getByRole('option', { name: tapa }).click()
    }
    await page.getByTestId('analytiikka').click()
    await locators.aikajana.click()
    await page.getByRole('option', { name: aikajana }).click()
    await locators.kayttomaaraButton.click()
  }

  const taytaJaHaeJulkaisumaarat = async (
    luokitus: 'Opetusasteet' | 'Oppiaineet' | 'Organisaatiot',
    valinnat: string[]
  ) => {
    await locators.julkaisuLuokitus.click()
    await page.getByRole('option', { name: luokitus }).click()

    // After selecting category, a sub-select appears — pick values from it
    const subSelect = page
      .locator('form', { has: locators.julkaisuButton })
      .locator('ng-select')
      .nth(1)
    await subSelect.click()
    for (const valinta of valinnat) {
      await page.getByRole('option', { name: valinta }).click()
    }
    await page.getByTestId('analytiikka').click()
    await locators.julkaisuButton.click()
  }

  const taytaJaHaeVanhentuneet = async (opetusasteet: string[]) => {
    await locators.vanhentunutOpetusasteet.click()
    for (const aste of opetusasteet) {
      await page.getByRole('option', { name: aste }).click()
    }
    await page.getByTestId('analytiikka').click()
    await locators.vanhentunutButton.click()
  }

  return {
    taytaJaHaeOppimateriaalienKayttomaarat,
    taytaJaHaeJulkaisumaarat,
    taytaJaHaeVanhentuneet,
    goto,
    ...locators
  }
}
