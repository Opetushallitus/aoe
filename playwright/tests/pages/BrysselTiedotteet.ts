import { expect, type Page } from '@playwright/test'

export const BrysselTiedotteet = (page: Page) => {
  const locators = {
    notificationTypeSelect: page.locator('ng-select#notificationType'),
    notificationTextInput: page.locator('#notification'),
    showSinceInput: page.locator('#showSince'),
    showUntilInput: page.locator('#showUntil'),
    submitButton: page.getByRole('button', { name: 'Tallenna' }),
    resetButton: page.getByRole('button', { name: 'Tyhjennä' }),
    showUpcomingCheckbox: page.getByRole('checkbox'),
    notificationTable: page.locator('table')
  }

  const datepicker = page.locator('bs-datepicker-container')

  async function selectTodayInDatepicker() {
    const today = String(new Date().getDate())
    await datepicker.getByText(today, { exact: true }).click()
  }

  async function selectFutureEndDate() {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 2)
    const futureDay = String(futureDate.getDate())
    // If adding 2 days crosses into next month, navigate forward
    if (futureDate.getMonth() !== new Date().getMonth()) {
      await datepicker.locator('bs-datepicker-navigation-view button.next').click()
    }
    await datepicker.getByText(futureDay, { exact: true }).click()
  }

  async function luoTiedote(
    tyyppi:
      | 'Yleinen tiedote tai ohjeistus palvelun käyttäjille'
      | 'Tekninen häiriö tai käyttöä rajoittava tapahtuma',
    teksti: string
  ) {
    await locators.notificationTypeSelect.click()
    await page.getByRole('option', { name: tyyppi }).click()
    await locators.notificationTextInput.pressSequentially(teksti)

    // Set start date to today
    await locators.showSinceInput.click()
    await selectTodayInDatepicker()

    // Set end date to a future date
    await locators.showUntilInput.click()
    await selectFutureEndDate()

    await locators.submitButton.click()
    await expect(page.getByText('Tiedotteen tallennus onnistui')).toBeVisible()
  }

  async function luoTulevaTiedote(
    tyyppi:
      | 'Yleinen tiedote tai ohjeistus palvelun käyttäjille'
      | 'Tekninen häiriö tai käyttöä rajoittava tapahtuma',
    teksti: string
  ) {
    await locators.notificationTypeSelect.click()
    await page.getByRole('option', { name: tyyppi }).click()
    await locators.notificationTextInput.pressSequentially(teksti)

    // Set showSince to a future date (today + 2 days)
    await locators.showSinceInput.click()
    await selectFutureEndDate()

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
