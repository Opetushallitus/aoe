import { test } from '@playwright/test'
import { BrysselEtusivu } from '../pages/BrysselEtusivu'
import type { BrysselTiedotteet } from '../pages/BrysselTiedotteet'

type TiedotteetFixture = {
  tiedotteet: ReturnType<typeof BrysselTiedotteet>
}

export const tiedoteTest = test.extend<TiedotteetFixture>({
  tiedotteet: async ({ page }, use) => {
    const brysselPage = BrysselEtusivu(page)
    await brysselPage.goto()
    const tiedotteet = await brysselPage.clickBrysselPalvelunHallinta()
    await use(tiedotteet)
  }
})
