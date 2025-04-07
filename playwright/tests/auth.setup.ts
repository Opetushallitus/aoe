import { test as setup, expect, Page } from '@playwright/test';
import * as path from 'node:path';

const authFile = path.join(__dirname, '../.auth/user.json');

const waitForSomeTimeAsOtherwiseLoginLinkDoesNotWork = (page: Page) => page.waitForTimeout(1000);

setup('authenticate', async ({ page }) => {
  /*
    for some reason the page never fully loads so we
    can't wait for load event
   */
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForSomeTimeAsOtherwiseLoginLinkDoesNotWork(page);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('aoeuser');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' });
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await page.locator('#user-details-dropdown').click();
  await expect(page.getByText('AOE_first AOE_last')).toBeVisible();
  await page.getByRole('button', { name: 'Suomi: Vaihda kieli suomeksi' }).click();

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
