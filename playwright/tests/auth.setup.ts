import { test as setup, expect, type Page } from '@playwright/test'
import { User, authFileByUser } from './auth'

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

setup.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await waitForAppToBeReady(page)
  await page.close()
})

Object.values(User).forEach((user) => {
  setup(`authenticate as ${user}`, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForSomeTimeAsOtherwiseLoginLinkDoesNotWork(page)
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.getByRole('textbox', { name: 'Username or email' }).fill(user)
    await page.getByRole('textbox', { name: 'Password' }).fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/etusivu', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Suomi: Vaihda kieli suomeksi' }).click()
    await page.context().storageState({ path: authFileByUser[user] })
  })
})
