import { expect, type Page } from '@playwright/test'
import { Header } from './Header'
import { KokoelmaPage } from './KokoelmaPage'

export const MuokkaaKokoelmaa = (page: Page) => {
  const locators = {
    keywordsSelect: page.locator('ng-select[labelforid="keywords"]'),
    keywordRemoveButtons: page.locator('ng-select[labelforid="keywords"] .ng-value-icon'),
    requiredFieldBadge: page.locator('span.bg-danger'),
    esikatseluJaTallennusLink: page.getByRole('link', { name: 'Esikatselu ja tallennus' })
  }

  // Removes all selected keyword tags (to drive the collection into an invalid state).
  const clearKeywords = async () => {
    let count = await locators.keywordRemoveButtons.count()
    while (count > 0) {
      await locators.keywordRemoveButtons.first().click()
      count = await locators.keywordRemoveButtons.count()
    }
  }

  async function julkaiseKokoelma() {
    await page.getByRole('combobox', { name: 'Asiasanat *' }).click()
    await page.getByRole('option', { name: '3D-elokuvat' }).click()
    await page
      .getByRole('textbox', { name: 'Kokoelman kuvausteksti' })
      .fill('Kokoelma on luotu Playwright testissä.')
    await page.getByRole('link', { name: 'Esikatselu ja tallennus' }).click()
    await page.getByRole('button', { name: 'Julkaise', exact: true }).click()
    await expect(page.getByText('Julkaistu:')).toBeVisible()
    return KokoelmaPage(page)
  }

  return {
    header: Header(page),
    ...locators,
    clearKeywords,
    julkaiseKokoelma
  }
}
