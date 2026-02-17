import { expect, type Page } from '@playwright/test'

export const BrysselTiedotteet = (page: Page) => {
  const locators = {
    notificationTypeSelect: page.locator('#notificationType'),
    notificationTextInput: page.locator('#notification'),
    showSinceInput: page.locator('#showSince'),
    showUntilInput: page.locator('#showUntil'),
    submitButton: page.getByRole('button', { name: 'Tallenna' }),
    resetButton: page.getByRole('button', { name: 'Tyhjennä' }),
    showUpcomingCheckbox: page.getByRole('checkbox'),
    notificationTable: page.locator('table')
  }

  async function luoTiedote(
    tyyppi: 'Yleinen tiedote tai ohjeistus palvelun käyttäjille' | 'Tekninen häiriö tai käyttöä rajoittava tapahtuma',
    teksti: string
  ) {
    await locators.notificationTypeSelect.click()
    await page.getByRole('option', { name: tyyppi }).click()
    await locators.notificationTextInput.fill(teksti)
    await locators.submitButton.click()
    await expect(page.getByText('Tiedotteen tallennus onnistui')).toBeVisible()
  }

  async function luoTulevaTiedote(
    tyyppi: 'Yleinen tiedote tai ohjeistus palvelun käyttäjille' | 'Tekninen häiriö tai käyttöä rajoittava tapahtuma',
    teksti: string
  ) {
    await locators.notificationTypeSelect.click()
    await page.getByRole('option', { name: tyyppi }).click()
    await locators.notificationTextInput.fill(teksti)

    // Set showSince to a far future date
    await locators.showSinceInput.click()
    await page.locator('bs-datepicker-navigation-view button.current').first().click()
    await page.getByText('2030').click()
    await page.getByText('Jan').click()
    await page.locator('bs-days-calendar-view span').filter({ hasText: /^15$/ }).first().click()

    await locators.submitButton.click()
    await expect(page.getByText('Tiedotteen tallennus onnistui')).toBeVisible()
  }

  async function poistaTiedote(teksti: string) {
    const row = locators.notificationTable.locator('tr', { hasText: teksti })
    await row.getByRole('button', { name: 'Poista' }).click()
    await expect(page.getByText('Tiedotteen poisto onnistui')).toBeVisible()
  }

  async function naytaTulevatTiedotteet() {
    await locators.showUpcomingCheckbox.check()
  }

  return {
    ...locators,
    luoTiedote,
    luoTulevaTiedote,
    poistaTiedote,
    naytaTulevatTiedotteet
  }
}
