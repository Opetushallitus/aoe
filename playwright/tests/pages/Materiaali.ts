import { expect, Page } from '@playwright/test';
import { Header } from './Header';
import { blob as blobConsumer } from 'stream/consumers';

export const Materiaali = (page: Page) => {
  const locators = {
    lataaDropdown: page.getByRole('button', { name: 'Lataa' }),
  };

  const expectHeading = async (materiaali: string) => {
    await expect(page.getByRole('heading', { name: materiaali })).toBeVisible();
  };

  const getMateriaaliNumero = async () => {
    await page.waitForURL(/https:\/\/demo.aoe.fi\/#\/materiaali\/\d+/, { waitUntil: 'domcontentloaded' });
    const oppimateriaaliNumero = Number(page.url().split('/').reverse().at(0));
    expect(oppimateriaaliNumero).toBeGreaterThan(0);
    return oppimateriaaliNumero;
  };

  const lataaTiedosto = async (materiaaliNimi: string) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: materiaaliNimi }).click();
    const download = await downloadPromise;
    return await blobConsumer(await download.createReadStream());
  };

  const lataaKaikkiTiedostot = async () => {
    return lataaTiedosto('Lataa kaikki tiedostot');
  };

  return {
    header: Header(page),
    ...locators,
    expectHeading,
    getMateriaaliNumero,
    lataaTiedosto,
    lataaKaikkiTiedostot,
  };
};
