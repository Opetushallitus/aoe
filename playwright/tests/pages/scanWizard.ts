import type { Page } from '@playwright/test'
import { checkA11y, expectNoViolations } from './axe'
import { disableRulesFor } from '../a11ySuppressions'

export type WizardStep = {
  key: string // suppression/label key, e.g. 'perustiedot'
  fill?: () => Promise<void> // fill required fields so the form can advance
  next?: () => Promise<unknown> // advance to the next step (omit on the last step)
}

// Scans each step (desktop-only — the form DOM is viewport-independent), then
// fills required fields and advances. Suppression key is `${label}:${step.key}`.
export const scanWizard = async (page: Page, label: string, steps: WizardStep[]) => {
  for (const step of steps) {
    const target = `${label}:${step.key}`
    const results = await checkA11y(page, { disableRules: disableRulesFor(target, 'desktop') })
    expectNoViolations(results, `${target} @ desktop`)
    if (step.fill) {
      await step.fill()
    }
    if (step.next) {
      await step.next()
    }
  }
}
