import { test } from './a11yFixture'
import { expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { createHtmlReport } from 'axe-html-reporter'
import { Etusivu } from './pages/Etusivu'
import * as fs from 'node:fs'
import * as path from 'node:path'

// Generates an axe-core accessibility report (NOT a gate). Run with: `npm run a11y:report`.
// Scans key pages with the full WCAG 2.1 A/AA rule set WITHOUT the suite's suppressions.
// Writes a cross-page summary (a11y-axe-report.{json,md}) plus a styled per-page HTML
// report (axe-<page>.html) via axe-html-reporter, showing violations, passes and
// needs-review (incomplete).

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

type RuleHit = { id: string; impact: string | null; help: string; nodes: number; wcag: string[] }
type PageResult = {
  page: string
  violations: RuleHit[]
  incomplete: RuleHit[]
  passes: number
  inapplicable: number
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// Scans the page, writes a per-page HTML report (axe-html-reporter), returns a slim summary.
const scan = async (page: Page, name: string, outputDir: string): Promise<PageResult> => {
  const r = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  createHtmlReport({
    results: r,
    options: {
      projectKey: `AOE accessibility — ${name}`,
      // axe-html-reporter resolves outputDir against process.cwd(), so make it relative.
      outputDir: path.relative(process.cwd(), outputDir),
      reportFileName: `axe-${slug(name)}.html`
    }
  })
  const map = (hits: typeof r.violations): RuleHit[] =>
    hits.map((h) => ({
      id: h.id,
      impact: h.impact ?? null,
      help: h.help,
      nodes: h.nodes.length,
      wcag: h.tags.filter((t) => t.startsWith('wcag'))
    }))
  return {
    page: name,
    violations: map(r.violations),
    incomplete: map(r.incomplete),
    passes: r.passes.length,
    inapplicable: r.inapplicable.length
  }
}

const toMarkdown = (results: PageResult[]): string => {
  const lines: string[] = ['# Axe accessibility report', '', '## Summary', '']
  lines.push('| Page | Violations | Needs review | Passes | N/A | HTML |')
  lines.push('|------|-----------:|-------------:|-------:|----:|------|')
  for (const r of results) {
    lines.push(
      `| ${r.page} | ${r.violations.length} | ${r.incomplete.length} | ${r.passes} | ${r.inapplicable} | axe-${slug(r.page)}.html |`
    )
  }
  for (const r of results) {
    lines.push('', `## ${r.page}`, '')
    if (r.violations.length) {
      lines.push('**Violations**', '')
      for (const v of r.violations) {
        lines.push(
          `- \`${v.id}\` (${v.impact ?? 'n/a'}, ${v.nodes} node(s), ${v.wcag.join('/')}) — ${v.help}`
        )
      }
    } else {
      lines.push('**Violations:** none')
    }
    if (r.incomplete.length) {
      lines.push('', '**Needs manual review (axe could not decide)**', '')
      for (const i of r.incomplete) {
        lines.push(`- \`${i.id}\` (${i.nodes} node(s), ${i.wcag.join('/')}) — ${i.help}`)
      }
    }
  }
  return `${lines.join('\n')}\n`
}

test('generate axe accessibility report', async ({ page, a11yMaterial, browser }) => {
  test.setTimeout(180_000)
  const dir = path.join(__dirname, '../../playwright-results')
  fs.mkdirSync(dir, { recursive: true })
  const results: PageResult[] = []
  const etusivu = Etusivu(page)

  await etusivu.goto()
  await page.waitForFunction(() => document.documentElement.lang !== '', null, { timeout: 5000 })
  results.push(await scan(page, 'Etusivu', dir))

  await etusivu.hae(a11yMaterial.materiaaliNimi)
  await page.locator('.results-count').first().waitFor()
  results.push(await scan(page, 'Haku (search results)', dir))

  await page.goto(`/#/materiaali/${a11yMaterial.materiaaliNumero}`, {
    waitUntil: 'domcontentloaded'
  })
  await page.getByRole('heading', { name: a11yMaterial.materiaaliNimi }).waitFor()
  results.push(await scan(page, 'Materiaali (material view)', dir))

  const omat = await etusivu.header.clickOmatMateriaalit()
  await omat.luoUusiMateriaali()
  await page.waitForLoadState('domcontentloaded')
  results.push(await scan(page, 'Uusi oppimateriaali (form)', dir))

  const loggedOut = await browser.newContext({ storageState: undefined, ignoreHTTPSErrors: true })
  const outPage = await loggedOut.newPage()
  await outPage.goto('/#/etusivu', { waitUntil: 'domcontentloaded' })
  await outPage.waitForFunction(() => document.documentElement.lang !== '', null, { timeout: 5000 })
  results.push(await scan(outPage, 'Etusivu (logged out)', dir))
  await loggedOut.close()

  fs.writeFileSync(path.join(dir, 'a11y-axe-report.json'), `${JSON.stringify(results, null, 2)}\n`)
  fs.writeFileSync(path.join(dir, 'a11y-axe-report.md'), toMarkdown(results))
  console.log(
    'Axe report written to playwright-results/: a11y-axe-report.{json,md} (summary) + axe-<page>.html (per page)'
  )

  expect(results.length).toBeGreaterThan(0)
})
