import { Page } from '@playwright/test';
import { OmatOppimateriaalit } from './OmatOppimateriaalit';

export const Header = (page: Page) => {
  const locators = {
    kirjaudu: page.getByRole('button', { name: ' Kirjaudu sisään ' }),
    fi: page.getByRole('button', { name: 'Suomi: Vaihda kieli suomeksi' }),
  };
  const clickOmatMateriaalit = async () => {
    await page.getByRole('link', { name: 'Omat oppimateriaalit' }).click();
    const hyvaksyKayttoehdot = page.getByText('Olen lukenut');
    try {
      await hyvaksyKayttoehdot.click({ timeout: 500 });
      await page.getByRole('button', { name: 'Tallenna' }).click();
      await page.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' });
      await page.getByRole('link', { name: 'Omat oppimateriaalit' }).click();
    } catch (e) {
      console.log('Terms of Service already accepted, skipping');
    }
    return OmatOppimateriaalit(page);
  };

  return {
    clickOmatMateriaalit,
    ...locators,
  };
};
