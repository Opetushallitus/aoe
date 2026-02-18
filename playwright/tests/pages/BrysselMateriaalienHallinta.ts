import { expect, type Page } from '@playwright/test'

export const BrysselMateriaalienHallinta = (page: Page) => {
  const changeOwnerForm = page.locator('app-admin-change-material-owner')
  const removeForm = page.locator('app-admin-remove-material')

  const locators = {
    omistajaInfo: changeOwnerForm.locator('.border'),
    omistajaInput: changeOwnerForm.locator('#materialId')
  }

  async function arkistoiMateriaali(materiaaliNumero: number) {
    await expect(page.getByRole('heading', { name: 'Vaihda materiaalin omistaja' })).toBeVisible()
    await removeForm.locator('#materialId').pressSequentially(`${materiaaliNumero}`)

    await expect(removeForm.getByText('AOE_first AOE_last')).toBeVisible()

    await expect(page.getByText('Materiaali arkistoitu onnistuneesti')).not.toBeVisible()
    await page.getByRole('button', { name: 'Arkistoi materiaali' }).click()
  }

  async function syotaMateriaaliId(materiaaliNumero: number) {
    await expect(page.getByRole('heading', { name: 'Vaihda materiaalin omistaja' })).toBeVisible()
    await locators.omistajaInput.clear()
    await locators.omistajaInput.pressSequentially(`${materiaaliNumero}`)
    await expect(locators.omistajaInfo).toBeVisible()
  }

  async function vaihdaOmistaja(materiaaliNumero: number, uusiOmistajaHaku: string) {
    await syotaMateriaaliId(materiaaliNumero)

    // Type into ng-select search input to find the new owner
    await changeOwnerForm.locator('ng-select input[type="text"]').pressSequentially(uusiOmistajaHaku)
    // Select the first matching option from the dropdown (appended to body)
    await page.locator('ng-dropdown-panel .ng-option').first().click()

    await page.getByRole('button', { name: 'Vaihda omistaja' }).click()
    await expect(page.getByText('Omistaja vaihdettu onnistuneesti')).toBeVisible()
  }

  async function getOmistajanNimi(materiaaliNumero: number): Promise<string> {
    await syotaMateriaaliId(materiaaliNumero)
    return (await locators.omistajaInfo.textContent()) ?? ''
  }

  return {
    ...locators,
    arkistoiMateriaali,
    vaihdaOmistaja,
    getOmistajanNimi
  }
}
