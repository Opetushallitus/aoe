import { Page } from '@playwright/test';
import { BrysselAnalyytiikka } from './BrysselAnalytiikka';

export const BrysselEtusivu = (page: Page) => {
  const goto = async () => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.goto('/#/bryssel', { waitUntil: 'domcontentloaded' });
  };

  const clickTopic = async (routeName: 'hallinnoi-materiaaleja' | 'hallinnoi-palvelua' | ('analytiikka' & {})) => {
    await page.getByTestId(routeName).click();
    const hyvaksyKayttoehdot = page.getByText('Olen lukenut');
    try {
      await hyvaksyKayttoehdot.click({ timeout: 500 });
      await page.getByRole('button', { name: 'Tallenna' }).click();
      await page.waitForURL(`https://demo.aoe.fi/#/bryssel/${routeName}`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId(routeName).click();
    } catch (e) {
      console.log('Terms of Service already accepted, skipping');
    }
    return BrysselAnalyytiikka(page);
  };

  return {
    goto,
    page,
    clickTopic,
  };
};
