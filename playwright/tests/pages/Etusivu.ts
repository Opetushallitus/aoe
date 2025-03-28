import { Page } from '@playwright/test';
import { Header } from './Header';
import { Materiaali } from './Materiaali';

export const Etusivu = (page: Page) => {
  const locators = {
    haku: {
      hakuehto: page.getByPlaceholder('Hakuehto'),
      hae: page.getByRole('button', { name: 'Hae' }),
    },
  };

  const goto = async () => {
    await page.bringToFront();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  };

  const clickMateriaali = async (materiaaliNimi: string) => {
    await page.getByText(materiaaliNimi).click();
    return Materiaali(page);
  };

  return {
    header: Header(page),
    ...locators,
    goto,
    page,
    clickMateriaali,
  };
};
