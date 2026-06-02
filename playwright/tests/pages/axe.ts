import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

export type A11yResults = Awaited<ReturnType<AxeBuilder['analyze']>>

export const checkA11y = (
  page: Page,
  { disableRules = [], include }: { disableRules?: string[]; include?: string } = {}
): Promise<A11yResults> => {
  const builder = new AxeBuilder({ page }).withTags(WCAG_AA_TAGS)
  // Scope the scan to a subtree (e.g. an open dialog) instead of the whole page.
  if (include) {
    builder.include(include)
  }
  if (disableRules.length > 0) {
    builder.disableRules(disableRules)
  }
  return builder.analyze()
}

export const expectNoViolations = (results: A11yResults, context: string) => {
  const summary = results.violations
    .map((v) => {
      const target = v.nodes[0]?.target?.join(' ') ?? '(unknown target)'
      return `  [${v.impact ?? 'none'}] ${v.id} (${v.nodes.length}) — ${target}`
    })
    .join('\n')
  expect(results.violations, `${context} has a11y violations:\n${summary}`).toEqual([])
}
