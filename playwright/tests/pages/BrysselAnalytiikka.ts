import { Page } from '@playwright/test';
import { MateriaaliFormi } from './MateriaaliFormi';

export const BrysselAnalyytiikka = (page: Page) => {
  const locators = {
    tapaInput: page.getByTestId('käyttötapa'),
    aikajana: page.getByTestId('aikajana'),
    kayttomaaraButton: page.getByTestId('käyttömäärä-button'),
    kayttomaaraChart: page.getByTestId('käyttömäärä-chart'),
  };

  const goto = async () => {
    await page.bringToFront();
    await page.goto('/#/bryssel/analytiikka', { waitUntil: 'domcontentloaded' });
  };

  const taytaJaHaeOppimateriaalienKayttomaarat = async (
    tapaList: ('Haku' | 'Katselu' | 'Lataus' | ('Muokkaus' & {}))[],
    aikajana: 'Päivä' | 'Viikko' | ('Kuukausi' & {}),
  ) => {
    await locators.tapaInput.click();
    for (const tapa of tapaList) {
      await page.getByRole('option', { name: tapa }).click();
    }
    await page.getByTestId('analytiikka').click();
    await locators.aikajana.click();
    await page.getByRole('option', { name: aikajana }).click();
    await locators.kayttomaaraButton.click();
  };
  return {
    taytaJaHaeOppimateriaalienKayttomaarat,
    goto,
    ...locators,
  };
};
