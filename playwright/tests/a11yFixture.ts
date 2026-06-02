import { test as base } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

type A11yMaterial = { materiaaliNimi: string; materiaaliNumero: number }

// Worker-scoped: one published material is created once and reused by every
// material-dependent a11y scan in the worker.
export const test = base.extend<
  // biome-ignore lint/complexity/noBannedTypes: Playwright requires {} for the test-scoped fixture slot when only worker fixtures are defined
  {},
  { a11yMaterial: A11yMaterial }
>({
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
  ]
})
