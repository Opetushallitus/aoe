import type { Page } from '@playwright/test'

export type Tapa = 'Haku' | 'Katselu' | 'Lataus' | 'Muokkaus'
export type Aikajana = 'Päivä' | 'Viikko' | 'Kuukausi'
// Some analytiikka dropdowns (e.g. oppiaineet/tieteenalat/tutkinnot) list the
// same label under multiple optgroups — "Matematiikka" appears under both
// "Perusopetus" and "Korkeakoulutus". For ambiguous values callers must pass
// the optgroup that disambiguates the row (e.g. "Luonnontieteet" for the
// korkeakoulutus tieteenala). Unambiguous values can be passed as a string.
export type OptgroupedValinta = string | { nimi: string; alaryhma: string }
export type UsageFilters = {
  opetusasteet?: string[]
  oppiaineet?: OptgroupedValinta[]
  organisaatiot?: string[]
}

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
    await page.goto('/bryssel/analytiikka', { waitUntil: 'domcontentloaded' })
  }

  const taytaJaHaeOppimateriaalienKayttomaarat = async (
    tapaList: Tapa[],
    aikajana: Aikajana,
    filters?: UsageFilters
  ) => {
    await locators.tapaInput.click()
    for (const tapa of tapaList) {
      await page.getByRole('option', { name: tapa }).click()
    }
    await page.keyboard.press('Escape')
    await locators.aikajana.click()
    await page.getByRole('option', { name: aikajana }).click()
    if (filters?.opetusasteet?.length) {
      await page.locator('ng-select#form-usage-select-educational-levels').click()
      for (const level of filters.opetusasteet) {
        await page.getByRole('option', { name: level }).click()
      }
      await page.keyboard.press('Escape')
    }
    if (filters?.oppiaineet?.length) {
      const oppiaineSelect = page.locator('ng-select#form-usage-select-educational-subjects')
      await oppiaineSelect.click()
      for (const subject of filters.oppiaineet) {
        const nimi = typeof subject === 'string' ? subject : subject.nimi
        const optionName =
          typeof subject === 'string' ? subject : `${subject.nimi} ${subject.alaryhma}`
        await oppiaineSelect.locator('input').pressSequentially(nimi)
        await page.getByRole('option', { name: optionName }).first().click()
      }
      await page.keyboard.press('Escape')
    }
    if (filters?.organisaatiot?.length) {
      await page.locator('ng-select#form-usage-select-organizations').click()
      for (const org of filters.organisaatiot) {
        await page.locator('ng-select#form-usage-select-organizations input').pressSequentially(org)
        await page.getByRole('option', { name: org }).click()
      }
      await page.keyboard.press('Escape')
    }
    await locators.kayttomaaraButton.click()
  }

  const taytaJaHaeJulkaisumaarat = async (
    luokitus: 'Opetusasteet' | 'Oppiaineet' | 'Organisaatiot',
    valinnat: OptgroupedValinta[]
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
      const nimi = typeof valinta === 'string' ? valinta : valinta.nimi
      const optionName =
        typeof valinta === 'string' ? valinta : `${valinta.nimi} ${valinta.alaryhma}`
      await subSelect.locator('input').pressSequentially(nimi)
      await page.getByRole('option', { name: optionName }).first().click()
    }
    await page.keyboard.press('Escape')
    await locators.julkaisuButton.click()
  }

  const taytaJaHaeVanhentuneet = async (opetusasteet: string[]) => {
    await locators.vanhentunutOpetusasteet.click()
    for (const aste of opetusasteet) {
      await page.getByRole('option', { name: aste }).click()
    }
    await page.keyboard.press('Escape')
    await locators.vanhentunutButton.click()
  }

  const haeMaterialActivityYhteensa = async ({
    tapa,
    opetusasteet,
    oppiaineet,
    organisaatiot
  }: {
    tapa: Tapa[]
    opetusasteet?: string[]
    oppiaineet?: OptgroupedValinta[]
    organisaatiot?: string[]
  }): Promise<number> => {
    const body = page
      .waitForResponse((r) => r.url().includes('/materialactivity/') && r.url().includes('/total'))
      .then((r) => r.json())
    await taytaJaHaeOppimateriaalienKayttomaarat(tapa, 'Päivä', {
      opetusasteet,
      oppiaineet,
      organisaatiot
    })
    const totals = (await body).values.map((v: { dayTotal: number }) => v.dayTotal)
    return totals.reduce((sum: number, val: number) => sum + (val || 0), 0)
  }

  const haeHakumaaratYhteensa = async ({
    filters
  }: {
    filters?: UsageFilters
  } = {}): Promise<number> => {
    const body = page
      .waitForResponse((r) => r.url().includes('/searchrequests/') && r.url().includes('/total'))
      .then((r) => r.json())
    await taytaJaHaeOppimateriaalienKayttomaarat(['Haku'], 'Päivä', filters)
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

  const urlPatternForLuokitus = {
    Opetusasteet: '/educationallevel/all',
    Oppiaineet: '/educationalsubject/all',
    Organisaatiot: '/organization/all'
  } as const

  const haeJulkaisumaaratYhteensa = async ({
    luokitus,
    valinnat
  }: {
    luokitus: 'Opetusasteet' | 'Oppiaineet' | 'Organisaatiot'
    valinnat: OptgroupedValinta[]
  }): Promise<number> => {
    const urlPattern = urlPatternForLuokitus[luokitus]
    const body = page
      .waitForResponse((r) => r.url().includes(urlPattern) && r.status() === 200)
      .then((r) => r.json())
    await taytaJaHaeJulkaisumaarat(luokitus, valinnat)
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
    haeJulkaisumaaratYhteensa,
    goto,
    ...locators
  }
}
