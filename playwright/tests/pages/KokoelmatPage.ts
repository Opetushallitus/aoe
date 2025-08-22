import { Header } from './Header';
import { Page } from '@playwright/test';

export const KokoelmatPage = (page: Page) => {
  const locators = {
    kokoelmaByName: async (kokoelmaName: string) =>
      page.getByRole('link', {
        name: `Oppimateriaalin kansikuva ${kokoelmaName}`,
      }),
  };

  return {
    header: Header(page),
    ...locators,
  };
};
