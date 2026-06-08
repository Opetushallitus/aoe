import { test as setup, expect, type Page } from '@playwright/test'
import * as path from 'node:path'

const authFile = path.join(__dirname, '../.auth/user.json')

const APP_READY_TIMEOUT_MS = 60_000
const APP_READY_POLL_MS = 1_000

const waitForSomeTimeAsOtherwiseLoginLinkDoesNotWork = (page: Page) => page.waitForTimeout(1000)

const waitForAppToBeReady = async (page: Page): Promise<void> => {
  const deadline = Date.now() + APP_READY_TIMEOUT_MS
  const badGatewayHeading = page.getByRole('heading', { name: '502 Bad Gateway' })
  const loginButton = page.getByRole('button', { name: 'Log in' })

  while (Date.now() < deadline) {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    if (await badGatewayHeading.count()) {
      await page.waitForTimeout(APP_READY_POLL_MS)
      continue
    }

    try {
      await expect(loginButton).toBeVisible({ timeout: APP_READY_POLL_MS })
      return
    } catch {
      await page.waitForTimeout(APP_READY_POLL_MS)
    }
  }

  throw new Error(`Application did not become ready within ${APP_READY_TIMEOUT_MS}ms`)
}

setup('authenticate', async ({ page }) => {
  await waitForAppToBeReady(page)
  await waitForSomeTimeAsOtherwiseLoginLinkDoesNotWork(page)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible()
  await page.getByRole('textbox', { name: 'Username' }).fill('aoeuser')
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Password' }).fill('password123')
  await page.getByRole('button', { name: 'Login' }).click()
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' })
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await page.locator('#user-details-dropdown').click()
  await expect(page.getByText('AOE_first AOE_last')).toBeVisible()
  await page.getByRole('button', { name: 'Suomi: Vaihda kieli suomeksi' }).click()

  // End of authentication steps.
  await page.context().storageState({ path: authFile })
})
