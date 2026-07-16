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

  const selectFromNgSelect = async (selector: string, ...names: string[]) => {
    await page.keyboard.press('Escape')
    for (const name of names) {
      const option = page.getByRole('option', { name }).first()
      // On a cold stack the ng-select items load from the ref API after the page
      // renders, so the dropdown can open empty. Reopen it until the option shows.
      await expect(async () => {
        await page.keyboard.press('Escape')
        await page.locator(selector).click()
        await expect(option).toBeVisible({ timeout: 1000 })
      }).toPass({
        intervals: [500, 1000, 2000, 3000, 5000, 5000],
        timeout: 30000
      })
      await option.click()
    }
    await page.keyboard.press('Escape')
  }

  // addTag ng-selects (publisher, prerequisites): type a free value and Enter to add it.
  const lisaaTagiNgSelectiin = async (selector: string, arvo: string) => {
    await page.locator(selector).click()
    await page.locator(`${selector} input`).fill(arvo)
    await page.keyboard.press('Enter')
    await page.keyboard.press('Escape')
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
    lisaaTiedostonKieliversiot: async (en: string, sv: string, nth = 0) => {
      // "Kieliversiot" buttons on the files step: material name (0), then one per file
      // (file nth → button nth + 1).
      await page
        .getByRole('button', { name: 'Kieliversiot', exact: true })
        .nth(nth + 1)
        .click()
      await page.getByRole('textbox', { name: 'Tiedoston esitysnimi (englanniksi)' }).fill(en)
      await page.getByRole('textbox', { name: 'Tiedoston esitysnimi (ruotsiksi)' }).fill(sv)
      await locators.tallennaMuutokset.click()
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
    lisaaOrganisaatio: async (organisaatio: string) => {
      await page.getByRole('button', { name: 'Lisää organisaatio' }).click()
      await page.locator('ng-select#organization1').click()
      await page.locator('ng-select#organization1 input').pressSequentially(organisaatio)
      await page.getByRole('option', { name: organisaatio, exact: true }).click()
      // Close the dropdown so its open option list can't intercept the next click.
      await page.keyboard.press('Escape')
    },
    lisaaAsiasana: async (type = 'PDF') => {
      await page.locator('ng-select').locator('#keywords').fill(type)
      await page.getByRole('option', { name: type }).click()
      await page.keyboard.press('Escape')
    },
    lisaaOppimateriaalinTyyppi: async (_type = 'teksti') => {
      await page.locator('#learningResourceTypes > .ng-select-container').click()
      await page.getByRole('option', { name: 'teksti' }).click()
      await page.keyboard.press('Escape')
    },
    lisaaPaaasiallinenKohderyhma: async (kohderyhma = 'Oppija') => {
      await page.locator('#educationalRoles > .ng-select-container').click()
      await page.getByRole('option', { name: kohderyhma, exact: true }).click()
      await page.keyboard.press('Escape')
    },
    lisaaPaaasiallinenKayttotarkoitus: async (kayttotarkoitus = 'Kurssimateriaali') => {
      await page.locator('#educationalUses > .ng-select-container').click()
      await page.getByRole('option', { name: kayttotarkoitus, exact: true }).click()
      await page.keyboard.press('Escape')
    },
    valitseTekijanOrganisaatio: async (organisaatio: string) => {
      await page.getByRole('group').getByRole('combobox').click()
      await page.getByRole('option', { name: organisaatio }).click()
    },
    taytaKuvaus: async (kuvaus: string) => {
      await page.getByRole('textbox', { name: 'Kuvaus' }).fill(kuvaus)
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
      await selectFromNgSelect('ng-select#educationalLevels', ...asteet)
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
      await selectFromNgSelect('ng-select#preparatoryEducationSubjects', ...oppiaineet)
    },
    valitseAmmatillisenKoulutuksenYhteinenTutkinnonOsa: async (...tutkinnonOsat: string[]) => {
      await selectFromNgSelect('ng-select#vocationalCommonUnits', ...tutkinnonOsat)
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
      await selectFromNgSelect('ng-select#accessibilityFeatures', ...ominaisuudet)
    },
    valitseSaavutettavuudenEsteet: async (...esteet: string[]) => {
      await selectFromNgSelect('ng-select#accessibilityHazards', ...esteet)
    },
    valitseVanhenemispaiva: async (paiva: string) => {
      await page.locator('#expires').click()
      await page.locator('#expires').clear()
      await page.locator('#expires').pressSequentially(paiva)
      await page.keyboard.press('Escape')
    },
    asetaKohderyhmanIka: async (min: string, max: string) => {
      await page.getByRole('textbox', { name: 'Kohderyhmän ikä (min)' }).fill(min)
      await page.getByRole('textbox', { name: 'Kohderyhmän ikä (max)' }).fill(max)
    },
    asetaOpiskeluaika: async (aika: string) => {
      await page.getByRole('textbox', { name: 'Opiskeluaika' }).fill(aika)
    },
    lisaaJulkaisija: async (julkaisija: string) => {
      await lisaaTagiNgSelectiin('ng-select#publisher', julkaisija)
    },
    lisaaEsitietovaatimus: async (vaatimus: string) => {
      await lisaaTagiNgSelectiin('ng-select#prerequisites', vaatimus)
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
    // "Hyödynnetyt materiaalit" step → isBasedOn externals. Adds one source:
    // optional author (an addTag ng-select), required url + name.
    lisaaHyodynnettyMateriaali: async (opts: { author?: string; url: string; name: string }) => {
      await page.getByRole('button', { name: 'Lisää uusi materiaali' }).click()
      if (opts.author) {
        await page.locator('#authorExt-0 input').fill(opts.author)
        await page.keyboard.press('Enter')
        await page.keyboard.press('Escape')
      }
      await page.locator('#url-0').fill(opts.url)
      await page.locator('#name-0').fill(opts.name)
    },
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

  const controls = {
    keywordsSelect: page.locator('ng-select').locator('#keywords'),
    learningResourceTypesSelect: page.locator('ng-select#learningResourceTypes'),
    educationalLevelsSelect: page.locator('ng-select#educationalLevels'),
    expiresDate: page.locator('#expires'),
    confirmCheckbox: page.locator('#confirm'),
    licenseRadio: (name: string) => page.getByRole('radio', { name, exact: true }),
    firstInvalidFeedback: page.locator('.invalid-feedback').first()
  }

  return {
    form: tiedostot,
    randomMateriaaliNimi,
    controls
  }
}
