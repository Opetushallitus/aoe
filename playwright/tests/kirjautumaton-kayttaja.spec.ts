import { expect, test } from '@playwright/test';
import { Etusivu } from './pages/Etusivu';

test('kirjautumaton käyttäjä voi ladata oppimateriaalia', async ({ page, browser }) => {
  const etusivu = Etusivu(page);
  await etusivu.goto();
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit();
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali();
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi();
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi);

  const newContext = await browser.newContext({ storageState: undefined });
  const kirjautumatonEtusivu = Etusivu(await newContext.newPage());
  await kirjautumatonEtusivu.goto();
  await kirjautumatonEtusivu.header.fi.click();
  await expect(kirjautumatonEtusivu.header.kirjaudu).toBeVisible();
  const kirjautumatonMateriaali = await kirjautumatonEtusivu.clickMateriaali(materiaaliNimi);
  await kirjautumatonMateriaali.lataaDropdown.click();
  const tiedostoBlob = await kirjautumatonMateriaali.lataaTiedosto('blank');
  expect(await tiedostoBlob.text()).toContain('Blank PDF Document');
});

test('kirjautumaton käyttäjä voi katsella materiaalin tiedostoja esikatselunäkymässä, ja nähdä materiaalin sisällön.', async ({
  page,
  browser,
}) => {
  const etusivu = Etusivu(page);
  await etusivu.goto();
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit();
  const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali();
  const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi();
  await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi);

  const newContext = await browser.newContext({ storageState: undefined });
  const kirjautumatonEtusivu = Etusivu(await newContext.newPage());
  await kirjautumatonEtusivu.goto();
  await kirjautumatonEtusivu.header.fi.click();
  await expect(kirjautumatonEtusivu.header.kirjaudu).toBeVisible();
  const kirjautumatonMateriaali = await kirjautumatonEtusivu.clickMateriaali(materiaaliNimi);
  const preview = await kirjautumatonMateriaali.preview('blank.pdf');
  await expect(preview).toBeVisible();
});

test('kirjautumaton käyttämä voi ilman kirjautumista siirtyä materiaalin sisältöön, kun se on linkki ulkoiseen verkko-osoitteeseen.', async ({
  page,
  browser,
}) => {
  const etusivu = Etusivu(page);
  await etusivu.goto();
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit();
  const uusiVerkkosivuMateriaali = await omatMateriaalit.luoUusiMateriaali();
  const materiaaliNimi = uusiVerkkosivuMateriaali.randomMateriaaliNimi();
  await uusiVerkkosivuMateriaali.taytaJaTallennaUusiVerkkosivuMateriaali(materiaaliNimi, 'https://www.example.com');

  const newContext = await browser.newContext({ storageState: undefined });
  const kirjautumatonEtusivu = Etusivu(await newContext.newPage());
  await kirjautumatonEtusivu.goto();
  await kirjautumatonEtusivu.header.fi.click();
  await expect(kirjautumatonEtusivu.header.kirjaudu).toBeVisible();
  const kirjautumatonMateriaali = await kirjautumatonEtusivu.clickMateriaali(materiaaliNimi);
  const pagePromise = newContext.waitForEvent('page');
  await kirjautumatonMateriaali.clickVerkkosivu();
  const newPage = await pagePromise;

  expect(newPage.url()).toBe('https://www.example.com/');
});
