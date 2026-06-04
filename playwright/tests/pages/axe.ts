import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

import { disableRulesFor } from '../a11ySuppressions'
import { type RuleHit, recordScan } from '../a11yReportWriter'

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

export type A11yResults = Awaited<ReturnType<AxeBuilder['analyze']>>

const toRuleHits = (hits: A11yResults['violations']): RuleHit[] =>
  hits.map((h) => ({
    id: h.id,
    impact: h.impact ?? null,
    help: h.help,
    wcag: h.tags.filter((t) => t.startsWith('wcag')),
    targets: h.nodes.map((n) => n.target.join(' '))
  }))

// Runs FULL axe (no disableRules), records the scan for the report, and asserts no
// violations EXCEPT those documented in a11ySuppressions for this target+viewport.
export const scanA11y = async (
  page: Page,
  target: string,
  viewport: string,
  opts: { include?: string } = {}
) => {
  const builder = new AxeBuilder({ page }).withTags(WCAG_AA_TAGS)
  if (opts.include) {
    builder.include(opts.include)
  }
  const r = await builder.analyze()

  recordScan({
    label: `${target} @ ${viewport}`,
    target,
    viewport,
    url: r.url,
    violations: toRuleHits(r.violations),
    incomplete: toRuleHits(r.incomplete),
    passes: r.passes.length,
    inapplicable: r.inapplicable.length
  })

  const suppressed = new Set(disableRulesFor(target, viewport))
  const enforced = r.violations.filter((v) => !suppressed.has(v.id))
  const summary = enforced
    .map((v) => {
      const t = v.nodes[0]?.target?.join(' ') ?? '(unknown target)'
      return `  [${v.impact ?? 'none'}] ${v.id} (${v.nodes.length}) — ${t}`
    })
    .join('\n')
  expect(enforced, `${target} @ ${viewport} has a11y violations:\n${summary}`).toEqual([])
}
