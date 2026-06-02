import { test as base } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

type A11yMaterial = { materiaaliNimi: string; materiaaliNumero: number }
type A11yCollection = { kokoelmaNimi: string }

// biome-ignore lint/complexity/noBannedTypes: Playwright's empty test-fixtures slot
export const test = base.extend<{}, { a11yMaterial: A11yMaterial; a11yCollection: A11yCollection }>(
  {
    a11yMaterial: [
      async ({ browser }, use) => {
        const context = await browser.newContext({
          storageState: './.auth/user.json',
          ignoreHTTPSErrors: true
        })
        const page = await context.newPage()
        const etusivu = Etusivu(page)
        await etusivu.goto()
        const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
        const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
        const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('A11y materiaali')
        const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
        const materiaaliNumero = await materiaali.getMateriaaliNumero()
        await context.close()
        await use({ materiaaliNimi, materiaaliNumero })
      },
      { scope: 'worker' }
    ],
    a11yCollection: [
      async ({ browser }, use) => {
        const context = await browser.newContext({
          storageState: './.auth/user.json',
          ignoreHTTPSErrors: true
        })
        const page = await context.newPage()
        const etusivu = Etusivu(page)
        await etusivu.goto()
        const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
        const uusiMateriaali = await omatMateriaalit.luoUusiMateriaali()
        const materiaaliNimi = uusiMateriaali.randomMateriaaliNimi('A11y kokoelmamateriaali')
        const materiaali = await uusiMateriaali.taytaJaTallennaUusiMateriaali(materiaaliNimi)
        const kokoelmaNimi = `A11y kokoelma ${materiaaliNimi}`
        await materiaali.lisaaKokoelmaan(kokoelmaNimi)
        const omat2 = await etusivu.header.clickOmatMateriaalit()
        const muokkaaKokoelmaa = await omat2.startToEditKokoelma(kokoelmaNimi)
        await muokkaaKokoelmaa.julkaiseKokoelma()
        await context.close()
        await use({ kokoelmaNimi })
      },
      { scope: 'worker' }
    ]
  }
)
