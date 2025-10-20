import { expect, type Page } from '@playwright/test'

export const BrysselMateriaalienHallinta = (page: Page) => {
  const locators = {}

  async function arkistoiMateriaali(materiaaliNumero: number) {
    await expect(
      page.getByRole('heading', { name: 'Vaihda materiaalin omistaja' })
    ).toBeVisible()
    await page
      .locator('app-admin-remove-material #materialId')
      .pressSequentially(`${materiaaliNumero}`)

    await expect(
      page.locator('app-admin-remove-material').getByText('AOE_first AOE_last')
    ).toBeVisible()

    await expect(
      page.getByText('Materiaali arkistoitu onnistuneesti')
    ).not.toBeVisible()
    await page.getByRole('button', { name: 'Arkistoi materiaali' }).click()
  }
  return {
    ...locators,
    arkistoiMateriaali,
  }
}
