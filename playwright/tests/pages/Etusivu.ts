import type { Page } from '@playwright/test'
import { Header } from './Header'
import { Materiaali } from './Materiaali'
import { HakuTulokset } from './HakuTulokset'

export const Etusivu = (page: Page) => {
  const locators = {
    haku: {
      hakuehto: page.getByPlaceholder('Hakuehto'),
      hae: page.getByRole('button', { name: 'Hae' }),
    },
  }

  const goto = async () => {
    await page.bringToFront()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  }

  const clickMateriaali = async (materiaaliNimi: string) => {
    await page.getByText(materiaaliNimi).click()
    return Materiaali(page)
  }

  const hae = async (hakuehto: string) => {
    await locators.haku.hakuehto.fill(hakuehto)
    await locators.haku.hae.click()
    return HakuTulokset(page)
  }

  const valitseKoulutusaste = async (...asteet: string[]) => {
    await page.locator('ng-select#educationalLevels').click()
    for (const aste of asteet) {
      await page.getByRole('option', { name: aste }).click()
    }
  }

  const valitseOppimateriaalinTyyppi = async (...tyypit: string[]) => {
    await page.locator('ng-select#learningResourceTypes').click()
    for (const tyyppi of tyypit) {
      await page.getByRole('option', { name: tyyppi }).click()
    }
  }

  const valitseOppiaine = async (...oppiaineet: string[]) => {
    await page.locator('ng-select#educationalSubjects').click()
    for (const oppiaine of oppiaineet) {
      await page.getByRole('option', { name: oppiaine, exact: true }).click()
    }
  }

  return {
    header: Header(page),
    ...locators,
    goto,
    page,
    clickMateriaali,
    hae,
    valitseKoulutusaste,
    valitseOppimateriaalinTyyppi,
    valitseOppiaine,
  }
}
