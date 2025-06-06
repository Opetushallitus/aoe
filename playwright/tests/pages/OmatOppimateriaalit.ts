import { Header } from './Header';
import { expect, Page } from '@playwright/test';
import { UusiOppimateriaali } from './UusiOppimateriaali';
import { MuokkaaMateriaalia } from './MuokkaaMateriaalia';

export const OmatOppimateriaalit = (page: Page) => {
  const locators = {
    luoUusiMateriaali: page.getByRole('link', { name: 'Luo uusi materiaali' }),
    julkaistutMateriaalitHeading: page.getByRole('heading', { name: 'Julkaistut oppimateriaalit', exact: true }),
  };

  const luoUusiMateriaali = async () => {
    await locators.luoUusiMateriaali.click();
    return UusiOppimateriaali(page);
  };

  const expectToFindMateriaali = async (materiaaliNimi: string) => {
    await expect(page.getByText(materiaaliNimi)).toBeVisible();
  };

  const startToEditMateriaaliNumero = async (materiaaliNumero: number) => {
    await page.locator(`[href*="#/muokkaa-oppimateriaalia/${materiaaliNumero}"]`).click();
    //await page.waitForURL('#/muokkaa-oppimateriaalia/${materiaaliNumero}/1', {waitUntil: 'domcontentloaded'})
    await expect(page.getByRole('heading', { name: 'Oppimateriaalin muokkaus' })).toBeVisible();
    return MuokkaaMateriaalia(page);
  };

  return {
    header: Header(page),
    locators,
    luoUusiMateriaali,
    expectToFindMateriaali,
    startToEditMateriaaliNumero,
  };
};
