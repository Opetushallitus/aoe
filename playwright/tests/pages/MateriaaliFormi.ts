import { expect, Page } from '@playwright/test';
import * as path from 'node:path';
import { Materiaali } from './Materiaali';

export const MateriaaliFormi = (page: Page, isEditingAsForSomeReasonTheLabelIsDifferentIfEditing = false) => {
  const locators = {
    tallenna: page.getByRole('button', { name: 'Tallenna' }),
    seuraava: page.getByRole('button', { name: 'Seuraava' }),
    edellinen: page.getByRole('button', { name: 'Edellinen' }),
  };
  const tiedostot = {
    oppimateriaalinNimi: async (materiaaliNimi: string) => {
      if (isEditingAsForSomeReasonTheLabelIsDifferentIfEditing) {
        await page.getByRole('textbox', { name: 'Oppimateriaalin nimi*', exact: true }).fill(materiaaliNimi);
      } else {
        await page.getByRole('textbox', { name: 'Oppimateriaalin nimi *', exact: true }).fill(materiaaliNimi);
      }
    },
    lisaaTiedosto: async (nth = 0) => {
      const fileLocator = `#file${nth}`;
      await page.locator(fileLocator).click();
      await page.locator(fileLocator).setInputFiles(path.join(__dirname, '../../test-files/blank.pdf'));
      await expect(page.locator(fileLocator)).toHaveValue('C:\\fakepath\\blank.pdf');
    },
    lisaaVerkkosivu: async () => {
      const linkLocator = '#link0';
      await page.locator(linkLocator).fill('https://www.example.com');
      await expect(page.locator(linkLocator)).toHaveValue('https://www.example.com');
      await page.locator('#displayName0').fill('esimerkkisivu');
    },
    seuraava: async () => {
      await locators.seuraava.click();
      return perustiedot;
    },
  };

  const perustiedot = {
    lisaaHenkilo: async (name = 'Tester, Testi') => {
      await page.getByRole('button', { name: 'Lisää henkilö' }).click();
      await page.getByRole('textbox', { name: 'Tekijän nimi *' }).fill(name);
    },
    lisaaAsiasana: async (type = 'PDF') => {
      await page.locator('ng-select').locator('#keywords').fill(type);
      await page.getByRole('option', { name: type }).click();
    },
    lisaaOppimateriaalinTyyppi: async (type = 'teksti') => {
      await page.locator('#learningResourceTypes > .ng-select-container').click();
      await page.getByRole('option', { name: 'teksti' }).click();
    },
    seuraava: async () => {
      await locators.seuraava.click();
      return koulutustiedot;
    },
    edellinen: async () => {
      await locators.edellinen.click();
      return tiedostot;
    },
  };

  const koulutustiedot = {
    valitseKoulutusasteet: async (...asteet) => {
      await page.getByRole('textbox').click();
      for (const aste of asteet) {
        await page.getByRole('option', { name: aste }).click();
      }
      //await page.locator('.ng-arrow-wrapper').first().click();
    },
    seuraava: async () => {
      await locators.seuraava.click();
      return tarkemmatTiedot;
    },
    edellinen: async () => {
      await locators.edellinen.click();
      return perustiedot;
    },
  };

  const tarkemmatTiedot = {
    seuraava: async () => {
      await locators.seuraava.click();
      return lisenssitiedot;
    },
    edellinen: async () => {
      await locators.edellinen.click();
      return koulutustiedot;
    },
  };

  const lisenssitiedot = {
    valitseLisenssi: async (lisenssi = 'CC BY 4.0') => {
      await page.getByText(lisenssi).click();
    },
    seuraava: async () => {
      await locators.seuraava.click();
      return hyodynnetytMateriaalit;
    },
    edellinen: async () => {
      await locators.edellinen.click();
      return tarkemmatTiedot;
    },
  };

  const hyodynnetytMateriaalit = {
    seuraava: async () => {
      await locators.seuraava.click();
      return esikatseluJaTallennus;
    },

    edellinen: async () => {
      await locators.edellinen.click();
      return lisenssitiedot;
    },
  };

  const esikatseluJaTallennus = {
    tallenna: async (materiaaliNimi: string) => {
      await expect(page.getByRole('button', { name: 'Tallenna' })).toBeDisabled();
      await page.getByText('Vakuutan että').click();
      await page.getByRole('button', { name: 'Tallenna' }).click();
      const materiaali = Materiaali(page);
      await materiaali.expectHeading(materiaaliNimi);
      return materiaali;
    },
    edellinen: async () => {
      await locators.edellinen.click();
      return hyodynnetytMateriaalit;
    },
  };

  const randomMateriaaliNimi = (prefix = 'Blank resource') => {
    const randomString = Math.random().toString(36).slice(2);
    return `${prefix} ${randomString}`;
  };

  return {
    form: tiedostot,
    randomMateriaaliNimi,
  };
};
