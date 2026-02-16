import { expect, type Page } from '@playwright/test'
import { Materiaali } from './Materiaali'

export const HakuTulokset = (page: Page) => {
  const expectToFindMateriaali = async (materiaaliNimi: string, timeout = 30000) => {
    await expect(
      page.locator('article.search-result h1 a', { hasText: materiaaliNimi })
    ).toBeVisible({ timeout })
  }

  const clickMateriaali = async (materiaaliNimi: string) => {
    await page.locator('article.search-result h1 a', { hasText: materiaaliNimi }).click()
    return Materiaali(page)
  }

  const expectNoResults = async () => {
    await expect(page.getByText('Hakusi ei tällä kertaa tuottanut tulosta')).toBeVisible()
  }

  return {
    expectToFindMateriaali,
    expectNoResults,
    clickMateriaali
  }
}
