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

  const haeMaterialActivityYhteensa = async ({
    tapa
  }: {
    tapa: ('Haku' | 'Katselu' | 'Lataus' | 'Muokkaus')[]
  }): Promise<number> => {
    const body = page
      .waitForResponse((r) => r.url().includes('/materialactivity/') && r.url().includes('/total'))
      .then((r) => r.json())
    await taytaJaHaeOppimateriaalienKayttomaarat(tapa, 'Päivä')
    const totals = (await body).values.map((v: { dayTotal: number }) => v.dayTotal)
    return totals.reduce((sum: number, val: number) => sum + (val || 0), 0)
  }

  const haeHakumaaratYhteensa = async (): Promise<number> => {
    const body = page
      .waitForResponse((r) => r.url().includes('/searchrequests/') && r.url().includes('/total'))
      .then((r) => r.json())
    await taytaJaHaeOppimateriaalienKayttomaarat(['Haku'], 'Päivä')
    const totals = (await body).values.map((v: { dayTotal: number }) => v.dayTotal)
    return totals.reduce((sum: number, val: number) => sum + (val || 0), 0)
  }

  const haeVanhentuneetYhteensa = async (opetusasteet: string[]): Promise<number> => {
    const body = page
      .waitForResponse((r) => r.url().includes('/educationallevel/expired') && r.status() === 200)
      .then((r) => r.json())
    await taytaJaHaeVanhentuneet(opetusasteet)
    return (await body).values.reduce(
      (sum: number, v: { key: string; value: number }) => sum + (v.value || 0),
      0
    )
  }

  const haeOpetusasteJulkaisumaaratYhteensa = async (valinnat: string[]): Promise<number> => {
    const body = page
      .waitForResponse((r) => r.url().includes('/educationallevel/all') && r.status() === 200)
      .then((r) => r.json())
    await taytaJaHaeJulkaisumaarat('Opetusasteet', valinnat)
    return (await body).values.reduce(
      (sum: number, v: { key: string; value: number }) => sum + (v.value || 0),
      0
    )
  }

  return {
    taytaJaHaeOppimateriaalienKayttomaarat,
    taytaJaHaeJulkaisumaarat,
    taytaJaHaeVanhentuneet,
    haeMaterialActivityYhteensa,
    haeHakumaaratYhteensa,
    haeVanhentuneetYhteensa,
    haeOpetusasteJulkaisumaaratYhteensa,
    goto,
    ...locators
  }
}
