import { expect, type Page } from '@playwright/test'

export const SocialMetadataModal = (page: Page) => {
  const modal = page.getByRole('dialog')
  const modalTitle = modal.getByRole('heading', { name: 'Lisää kuvailutietoja' })

  const closeDropdown = async () => {
    await modalTitle.click()
  }

  const lisaaAsiasana = async (keyword: string) => {
    await modal.getByRole('combobox', { name: 'Asiasanat' }).click()
    await modal.getByRole('combobox', { name: 'Asiasanat' }).fill(keyword)
    await page.getByRole('option', { name: keyword }).click()
    await closeDropdown()
  }

  const lisaaSaavutettavuusominaisuus = async (feature: string) => {
    await modal.getByRole('combobox', { name: 'Saavutettavuuden ominaisuudet' }).click()
    await page.getByRole('option', { name: feature }).click()
    await closeDropdown()
  }

  const lisaaSaavutettavuuseste = async (hazard: string) => {
    await modal.getByRole('combobox', { name: 'Saavutettavuuden esteet' }).click()
    await page.getByRole('option', { name: hazard }).click()
    await closeDropdown()
  }

  const lisaaKoulutusaste = async (level: string) => {
    await modal.getByRole('combobox', { name: 'Koulutusasteet' }).click()
    await page.getByRole('option', { name: level }).click()
    await closeDropdown()
  }

  const tallenna = async () => {
    await modal.getByRole('button', { name: 'Tallenna' }).click()
    await expect(modal.getByRole('heading', { name: 'Lisää kuvailutietoja' })).not.toBeVisible()
  }

  return {
    lisaaAsiasana,
    lisaaSaavutettavuusominaisuus,
    lisaaSaavutettavuuseste,
    lisaaKoulutusaste,
    tallenna
  }
}
