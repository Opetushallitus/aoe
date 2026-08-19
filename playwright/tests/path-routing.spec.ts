import { expect, test } from '@playwright/test'

// Verifies path routing end-to-end: direct deep link, refresh (nginx SPA
// fallback), and the legacy hash-URL redirect shim in main.ts.
test.describe('path routing', () => {
  test('deep link to a material loads directly (no #, no 404)', async ({ page }) => {
    const resp = await page.goto('/materiaali/606')
    expect(resp?.status()).toBeLessThan(400)
    expect(page.url()).not.toContain('#')
    await expect(page).toHaveURL(/\/materiaali\/606/)
  })

  test('refresh on a deep link still works (nginx fallback)', async ({ page }) => {
    await page.goto('/materiaali/606')
    await page.reload()
    await expect(page).toHaveURL(/\/materiaali\/606/)
  })

  test('legacy hash URL redirects to path form', async ({ page }) => {
    await page.goto('/#/materiaali/606')
    await expect(page).toHaveURL(/\/materiaali\/606$/)
    expect(page.url()).not.toContain('#')
  })

  // The translation loader falls back to fi, so a missing en or sv bundle serves Finnish
  // instead of failing — and no other test switches away from Finnish to notice.
  test('translation bundles are served', async ({ request }) => {
    for (const lang of ['fi', 'en', 'sv']) {
      await test.step(`/i18n/${lang}.json`, async () => {
        const resp = await request.get(`/i18n/${lang}.json`)
        expect(resp.status()).toBe(200)
        expect(Object.keys(await resp.json()).length).toBeGreaterThan(0)
      })
    }
  })
})
