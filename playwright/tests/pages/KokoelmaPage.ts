import { Header } from './Header'
import type { Page } from '@playwright/test'

export const KokoelmaPage = (page: Page) => {
  return {
    header: Header(page)
  }
}
