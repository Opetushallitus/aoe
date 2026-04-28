import { expect, type Page } from '@playwright/test'
import { Materiaali } from './Materiaali'

export const HakuTulokset = (page: Page) => {
  const filter = (name: string) => {
    const section = page.locator('.filter').filter({
      has: page.getByRole('heading', { name, exact: true })
    })

    return {
      header: section.getByRole('heading', { name, exact: true }),
      open: async () => {
        await section.getByRole('button', { name, exact: true }).click()
      },
      values: section.locator('.form-check-label')
    }
  }

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
    filter,
    expectToFindMateriaali,
    expectNoResults,
    clickMateriaali
  }
}
