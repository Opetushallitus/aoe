import { expect, type Page } from '@playwright/test'
import { BrysselAnalyytiikka } from './BrysselAnalytiikka'
import { BrysselMateriaalienHallinta } from './BrysselMateriaalienHallinta'
import { BrysselTiedotteet } from './BrysselTiedotteet'

export const BrysselEtusivu = (page: Page) => {
  const goto = async () => {
    await page.goto('/')
    await expect(page.getByRole('main')).toBeVisible()
    await page.goto('/bryssel')
    await expect(
      page.getByRole('heading', {
        name: 'Tervetuloa aoe.fi hallintanäkymään!'
      })
    ).toBeVisible()
  }

  const clickBrysselAnalytiikka = async () => {
    await page.getByRole('main').getByRole('link', { name: 'Analytiikka' }).click()
    const hyvaksyKayttoehdot = page.getByText('Olen lukenut')
    try {
      await hyvaksyKayttoehdot.click({ timeout: 1000 })
      await page.getByRole('button', { name: 'Tallenna' }).click()
      await page.getByRole('main').getByRole('link', { name: 'Analytiikka' }).click()
    } catch (_e) {}
    return BrysselAnalyytiikka(page)
  }
  const clickBrysselMateriaalinHallinta = async () => {
    await page.getByRole('main').getByRole('link', { name: 'Materiaalien hallinta' }).click()
    const hyvaksyKayttoehdot = page.getByText('Olen lukenut')
    try {
      await hyvaksyKayttoehdot.click({ timeout: 500 })
      await page.getByRole('button', { name: 'Tallenna' }).click()
      await page.getByRole('main').getByRole('link', { name: 'Analytiikka' }).click()
    } catch (_e) {}
    return BrysselMateriaalienHallinta(page)
  }

  const clickBrysselPalvelunHallinta = async () => {
    await page.getByRole('main').getByRole('link', { name: 'Palvelun hallinta' }).click()
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
