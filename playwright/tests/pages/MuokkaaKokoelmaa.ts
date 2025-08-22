import { expect, Page } from '@playwright/test';
import { Header } from './Header';
import { KokoelmaPage } from './KokoelmaPage';

export const MuokkaaKokoelmaa = (page: Page) => {
  async function julkaiseKokoelma() {
    await page.getByRole('textbox', { name: 'Asiasanat *' }).click();
    await page.getByRole('option', { name: '3D-elokuvat' }).click();
    await page.getByRole('textbox', { name: 'Kokoelman kuvausteksti' }).fill('Kokoelma on luotu Playwright testissä.');
    await page.getByRole('link', { name: 'Esikatselu ja tallennus' }).click();
    await page.getByRole('button', { name: 'Julkaise', exact: true }).click();
    await expect(page.getByText('Julkaistu:')).toBeVisible();
    return KokoelmaPage(page);
  }

  return {
    header: Header(page),
    julkaiseKokoelma,
  };
};
