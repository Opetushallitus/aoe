import { expect, type Page } from '@playwright/test'

export const BrysselTiedotteet = (page: Page) => {
  const locators = {
    notificationTypeSelect: page.locator('ng-select#notificationType'),
    notificationTextInput: page.locator('#notification'),
    showSinceInput: page.locator('#showSince'),
    showUntilInput: page.locator('#showUntil'),
    submitButton: page.getByRole('button', { name: 'Tallenna' }),
    showUpcomingCheckbox: page.getByRole('checkbox'),
    notificationTable: page.locator('table')
  }

  const datepicker = page.locator('bs-datepicker-container')

  async function selectTodayInDatepicker() {
    const today = String(new Date().getDate())
    await datepicker.getByText(today, { exact: true }).click()
  }

  async function selectFutureEndDate() {
    const now = new Date()
    const futureDate = new Date(now)
    futureDate.setDate(now.getDate() + 2)
    const futureDay = String(futureDate.getDate())
    if (futureDate.getMonth() !== now.getMonth()) {
      await datepicker.locator('bs-datepicker-navigation-view button.next').click()
    }
    await datepicker.getByText(futureDay, { exact: true }).click()
  }

  type NotificationType =
    | 'Yleinen tiedote tai ohjeistus palvelun käyttäjille'
    | 'Tekninen häiriö tai käyttöä rajoittava tapahtuma'

  async function fillNotificationForm(tyyppi: NotificationType, teksti: string) {
    await locators.notificationTypeSelect.click()
    await page.getByRole('option', { name: tyyppi }).click()
    await locators.notificationTextInput.pressSequentially(teksti)
  }

  async function luoTiedote(tyyppi: NotificationType, teksti: string) {
    await fillNotificationForm(tyyppi, teksti)
    await locators.showSinceInput.click()
    await selectTodayInDatepicker()
    await locators.showUntilInput.click()
    await selectFutureEndDate()
    await locators.submitButton.click()
    await expect(page.getByText('Tiedotteen tallennus onnistui')).toBeVisible()
  }

  async function luoTulevaTiedote(tyyppi: NotificationType, teksti: string) {
    await fillNotificationForm(tyyppi, teksti)
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

export async function siivoaTiedote(page: Page, teksti: string) {
  const { BrysselEtusivu } = await import('./BrysselEtusivu')
  const brysselPage = BrysselEtusivu(page)
  await brysselPage.goto()
  const tiedotteet = await brysselPage.clickBrysselPalvelunHallinta()
  await tiedotteet.naytaTulevatTiedotteet()
  await tiedotteet.poistaTiedote(teksti)
}
