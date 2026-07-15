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
})
