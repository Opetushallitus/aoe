import { expect, type Page } from '@playwright/test'
import * as path from 'node:path'
import { Materiaali } from './Materiaali'

export const MateriaaliFormi = (
  page: Page,
  isEditingAsForSomeReasonTheLabelIsDifferentIfEditing = false
) => {
  const locators = {
    tallenna: page.getByRole('button', { name: 'Tallenna' }),
    seuraava: page.getByRole('button', { name: 'Seuraava' }),
    edellinen: page.getByRole('button', { name: 'Edellinen' }),
    lataaKansikuva: page.getByRole('button', { name: 'Lataa kansikuva' }),
    tallennaMuutokset: page.getByRole('button', { name: 'Tallenna muutokset' })
  }
  const tiedostot = {
    oppimateriaalinNimi: async (materiaaliNimi: string) => {
      if (isEditingAsForSomeReasonTheLabelIsDifferentIfEditing) {
        await page
          .getByRole('textbox', { name: 'Oppimateriaalin nimi*', exact: true })
          .fill(materiaaliNimi)
      } else {
        await page
          .getByRole('textbox', { name: 'Oppimateriaalin nimi *', exact: true })
          .fill(materiaaliNimi)
      }
    },
    lisaaTiedosto: async (fileName = 'blank.pdf', nth = 0) => {
      const fileLocator = `#file${nth}`
      await page.locator(fileLocator).click()
      await page
        .locator(fileLocator)
        .setInputFiles(path.join(__dirname, `../../test-files/${fileName}`))
      await expect(page.locator(fileLocator)).toHaveValue(`C:\\fakepath\\${fileName}`)
    },
    valitseTiedostonKieli: async (kieli: string, nth = 0) => {
      await page.locator(`ng-select#language${nth}`).click()
      await page.getByRole('option', { name: kieli, exact: true }).click()
    },
    lisaaVerkkosivu: async (verkkosivu: string) => {
      const linkLocator = '#link0'
      await page.locator(linkLocator).fill(verkkosivu)
      await expect(page.locator(linkLocator)).toHaveValue(verkkosivu)
      await page.locator('#displayName0').fill('esimerkkisivu')
    },
    muokkaaVerkkoSivu: async (verkkosivu: string) => {
      await page.getByTestId('replaceLinkButton').click()
      await page.getByTestId('replaceLinkInput').fill(verkkosivu)
    },
    seuraava: async () => {
      await locators.seuraava.click()
      return perustiedot
    },
    siirryEsikatseluun: async () => {
      while (await locators.seuraava.isVisible()) {
        await locators.seuraava.click()
      }
      return esikatseluJaTallennus
    }
  }

  const perustiedot = {
    lataaKansikuva: async (imagePath?: string) => {
      const filePath = imagePath ?? path.join(__dirname, '../../test-files/test-thumbnail.png')
      await locators.lataaKansikuva.click()
      await page.locator('#image').setInputFiles(filePath)
      await expect(page.locator('.modal-body img.border')).toBeVisible({
        timeout: 10000
      })
      await locators.tallennaMuutokset.click()
      await expect(page.locator('form img.img-fluid.border')).toBeVisible()
    },
    lisaaHenkilo: async (name = 'Tester, Testi') => {
      await page.getByRole('button', { name: 'Lisää henkilö' }).click()
      await page.getByRole('textbox', { name: 'Tekijän nimi *' }).fill(name)
    },
    lisaaAsiasana: async (type = 'PDF') => {
      await page.locator('ng-select').locator('#keywords').fill(type)
      await page.getByRole('option', { name: type }).click()
    },
    lisaaOppimateriaalinTyyppi: async (_type = 'teksti') => {
      await page.locator('#learningResourceTypes > .ng-select-container').click()
      await page.getByRole('option', { name: 'teksti' }).click()
    },
    lisaaPaaasiallinenKohderyhma: async (kohderyhma = 'Oppija') => {
      await page.locator('#educationalRoles > .ng-select-container').click()
      await page.getByRole('option', { name: kohderyhma, exact: true }).click()
    },
    lisaaPaaasiallinenKayttotarkoitus: async (kayttotarkoitus = 'Kurssimateriaali') => {
      await page.locator('#educationalUses > .ng-select-container').click()
      await page.getByRole('option', { name: kayttotarkoitus, exact: true }).click()
    },
    seuraava: async () => {
      await locators.seuraava.click()
      return koulutustiedot
    },
    edellinen: async () => {
      await locators.edellinen.click()
      return tiedostot
    }
  }

  const koulutustiedot = {
    valitseKoulutusasteet: async (...asteet: string[]) => {
      await page.keyboard.press('Escape')
      await page.getByRole('combobox').click()
      for (const aste of asteet) {
        await page.getByRole('option', { name: aste }).click()
      }
      await page.keyboard.press('Escape')
      //await page.locator('.ng-arrow-wrapper').first().click();
    },
    valitseTieteenala: async (...tieteenalat: string[]) => {
      await page.keyboard.press('Escape')
      await page.locator('ng-select#branchesOfScience').click()
      for (const tieteenala of tieteenalat) {
        await page.getByRole('option', { name: tieteenala }).click()
      }
      await page.keyboard.press('Escape')
    },
    valitseTutkintoonValmistavanKoulutuksenOppiaine: async (...oppiaineet: string[]) => {
      await page.keyboard.press('Escape')
      await page.locator('ng-select#preparatoryEducationSubjects').click()
      for (const oppiaine of oppiaineet) {
        await page.getByRole('option', { name: oppiaine, exact: true }).click()
      }
      await page.keyboard.press('Escape')
    },
    valitseAmmatillisenKoulutuksenYhteinenTutkinnonOsa: async (...tutkinnonOsat: string[]) => {
      await page.keyboard.press('Escape')
      await page.locator('ng-select#vocationalCommonUnits').click()
      for (const tutkinnonOsa of tutkinnonOsat) {
        await page.getByRole('option', { name: tutkinnonOsa, exact: true }).click()
      }
      await page.keyboard.press('Escape')
    },
    seuraava: async () => {
      await locators.seuraava.click()
      return tarkemmatTiedot
    },
    edellinen: async () => {
      await locators.edellinen.click()
      return perustiedot
    }
  }

  const tarkemmatTiedot = {
    valitseSaavutettavuudenOminaisuudet: async (...ominaisuudet: string[]) => {
      await page.keyboard.press('Escape')
      await page.locator('ng-select#accessibilityFeatures').click()
      for (const ominaisuus of ominaisuudet) {
        await page.getByRole('option', { name: ominaisuus, exact: true }).click()
      }
      await page.keyboard.press('Escape')
    },
    valitseSaavutettavuudenEsteet: async (...esteet: string[]) => {
      await page.keyboard.press('Escape')
      await page.locator('ng-select#accessibilityHazards').click()
      for (const este of esteet) {
        await page.getByRole('option', { name: este, exact: true }).click()
      }
      await page.keyboard.press('Escape')
    },
    seuraava: async () => {
      await locators.seuraava.click()
      return lisenssitiedot
    },
    edellinen: async () => {
      await locators.edellinen.click()
      return koulutustiedot
    }
  }

  const lisenssitiedot = {
    valitseLisenssi: async (lisenssi = 'CC BY 4.0') => {
      await page.getByText(lisenssi).click()
    },
    seuraava: async () => {
      await locators.seuraava.click()
      return hyodynnetytMateriaalit
    },
    edellinen: async () => {
      await locators.edellinen.click()
      return tarkemmatTiedot
    }
  }

  const hyodynnetytMateriaalit = {
    seuraava: async () => {
      await locators.seuraava.click()
      return esikatseluJaTallennus
    },

    edellinen: async () => {
      await locators.edellinen.click()
      return lisenssitiedot
    }
  }

  const esikatseluJaTallennus = {
    tallenna: async (materiaaliNimi: string) => {
      await expect(page.getByRole('button', { name: 'Tallenna' })).toBeDisabled()
      await page.getByText('Vakuutan että').click()
      await page.getByRole('button', { name: 'Tallenna' }).click()
      const materiaali = Materiaali(page)
      await materiaali.expectHeading(materiaaliNimi)
      return materiaali
    },
    edellinen: async () => {
      await locators.edellinen.click()
      return hyodynnetytMateriaalit
    }
  }

  const randomMateriaaliNimi = (prefix = 'Blank resource') => {
    const randomString = Math.random().toString(36).slice(2)
    return `${prefix} ${randomString}`
  }

  return {
    form: tiedostot,
    randomMateriaaliNimi
  }
}
