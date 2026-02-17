import { expect, type Page } from '@playwright/test'
import { BrysselAnalyytiikka } from './BrysselAnalytiikka'
import { BrysselMateriaalienHallinta } from './BrysselMateriaalienHallinta'
import { BrysselTiedotteet } from './BrysselTiedotteet'

export const BrysselEtusivu = (page: Page) => {
  const goto = async () => {
    await page.goto('/')
    await expect(page.getByRole('main')).toBeVisible()
    await page.goto('/#/bryssel')
    await expect(page.getByTestId('hallinnoi-palvelua')).toBeVisible()
  }

  const clickBrysselAnalytiikka = async () => {
    await page.getByRole('main').getByRole('link', { name: 'Analytiikka' }).click()
    const hyvaksyKayttoehdot = page.getByText('Olen lukenut')
    try {
      await hyvaksyKayttoehdot.click({ timeout: 500 })
      await page.getByRole('button', { name: 'Tallenna' }).click()
      await page.getByRole('main').getByRole('link', { name: 'Analytiikka' }).click()
    } catch (_e) {
      console.log('Terms of Service already accepted, skipping')
    }
    return BrysselAnalyytiikka(page)
  }
  const clickBrysselMateriaalinHallinta = async () => {
    await page.getByRole('main').getByRole('link', { name: 'Materiaalien hallinta' }).click()
    const hyvaksyKayttoehdot = page.getByText('Olen lukenut')
    try {
      await hyvaksyKayttoehdot.click({ timeout: 500 })
      await page.getByRole('button', { name: 'Tallenna' }).click()
      await page.getByRole('main').getByRole('link', { name: 'Analytiikka' }).click()
    } catch (_e) {
      console.log('Terms of Service already accepted, skipping')
    }
    return BrysselMateriaalienHallinta(page)
  }

  const clickBrysselPalvelunHallinta = async () => {
    await page.getByTestId('hallinnoi-palvelua').click()
    return BrysselTiedotteet(page)
  }

  return {
    goto,
    page,
    clickBrysselAnalytiikka,
    clickBrysselMateriaalinHallinta,
    clickBrysselPalvelunHallinta
  }
}
