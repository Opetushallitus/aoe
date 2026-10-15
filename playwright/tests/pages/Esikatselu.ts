import type { FrameLocator, Page } from '@playwright/test'

// The material page and the embed view render the same preview components, so the embed
// passes its FrameLocator as the root.
export const Esikatselu = (root: Page | FrameLocator) => ({
  h5p: root.locator('app-h5p-preview iframe').contentFrame(),
  html: root.locator('app-html-preview iframe').contentFrame(),
  office: root.locator('app-office-preview iframe').contentFrame(),
  pdf: root.locator('app-pdf-preview iframe').contentFrame()
})
