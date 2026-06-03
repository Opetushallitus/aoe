import { test } from './a11yFixture'
import { expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { createHtmlReport } from 'axe-html-reporter'
import { Etusivu } from './pages/Etusivu'
import { Materiaali } from './pages/Materiaali'
import * as fs from 'node:fs'
import * as path from 'node:path'

// Generates an axe-core accessibility report (NOT a gate). Run with: `npm run a11y:report`.
// Scans key pages with the full WCAG 2.1 A/AA rule set WITHOUT the suite's suppressions.
// Writes to playwright-results/:
//   - a11y-axe-report.html : ONE combined page — all pages' violations + needs-review (with node selectors)
//   - axe-<page>.html      : per-page axe-html-reporter (rich per-node detail)

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

type RuleHit = {
  id: string
  impact: string | null
  help: string
  wcag: string[]
  targets: string[]
}
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

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Scans the page, writes a per-page HTML report (axe-html-reporter), returns a detailed summary.
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
      wcag: h.tags.filter((t) => t.startsWith('wcag')),
      targets: h.nodes.map((n) => n.target.join(' '))
    }))
  return {
    page: name,
    violations: map(r.violations),
    incomplete: map(r.incomplete),
    passes: r.passes.length,
    inapplicable: r.inapplicable.length
  }
}

// ONE combined HTML showing every page's full axe error state (with node selectors).
const toCombinedHtml = (results: PageResult[]): string => {
  const ruleList = (hits: RuleHit[], showImpact: boolean) =>
    `<ul>${hits
      .map((h) => {
        const impact = showImpact
          ? `<span class="badge ${h.impact ?? 'none'}">${h.impact ?? 'n/a'}</span> `
          : ''
        const nodes = h.targets.length
          ? `<ul class="nodes">${h.targets
              .map((t) => `<li><code>${escapeHtml(t)}</code></li>`)
              .join('')}</ul>`
          : ''
        return `<li><code>${h.id}</code> ${impact}<span class="wcag">${h.wcag.join('/')}</span> — ${escapeHtml(h.help)}${nodes}</li>`
      })
      .join('')}</ul>`

  const nav = results
    .map(
      (r) =>
        `<tr><td><a href="#${slug(r.page)}">${escapeHtml(r.page)}</a></td>` +
        `<td class="num v">${r.violations.length}</td><td class="num r">${r.incomplete.length}</td>` +
        `<td class="num p">${r.passes}</td><td class="num">${r.inapplicable}</td></tr>`
    )
    .join('')

  const sections = results
    .map((r) => {
      const vio = r.violations.length
        ? `<h3>Violations</h3>${ruleList(r.violations, true)}`
        : '<p class="none">No violations.</p>'
      const inc = r.incomplete.length
        ? `<h3>Needs manual review (axe could not decide)</h3>${ruleList(r.incomplete, false)}`
        : ''
      return `<section id="${slug(r.page)}"><h2>${escapeHtml(r.page)}</h2><p class="counts">Violations: ${r.violations.length} · Needs review: ${r.incomplete.length} · Passes: ${r.passes} · N/A: ${r.inapplicable}</p>${vio}${inc}</section>`
    })
    .join('')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>AOE axe accessibility report — all pages</title><style>
body{font:14px/1.5 system-ui,sans-serif;margin:2rem;max-width:60rem;color:#1a1a1a}
h1{margin-top:0}table{border-collapse:collapse;margin:1rem 0}
th,td{border:1px solid #ddd;padding:.4rem .7rem;text-align:left}
.num{text-align:right}td.v{color:#b00020;font-weight:600}td.r{color:#a15c00}td.p{color:#1a7f37}
code{background:#f3f3f3;padding:.1rem .3rem;border-radius:3px;font-size:.85em}
.badge{font-size:.72rem;padding:.05rem .4rem;border-radius:3px;color:#fff;background:#888}
.badge.critical{background:#b00020}.badge.serious{background:#d35400}
.badge.moderate{background:#a15c00}.badge.minor{background:#666}
.wcag{color:#555;font-size:.8rem}.none{color:#1a7f37}.counts{color:#555}
section{margin:1.6rem 0;border-top:1px solid #eee;padding-top:.5rem}
ul.nodes{margin:.2rem 0 .6rem;color:#444}ul.nodes code{background:#eef}
</style></head><body>
<h1>AOE axe accessibility report — all pages</h1>
<p>WCAG 2.1 A/AA (wcag2a, wcag2aa, wcag21a, wcag21aa). Full axe scan, no suppressions. Per-page detail: <code>axe-&lt;page&gt;.html</code>.</p>
<table><thead><tr><th>Page</th><th>Violations</th><th>Needs review</th><th>Passes</th><th>N/A</th></tr></thead><tbody>${nav}</tbody></table>
${sections}
</body></html>
`
}

test('generate axe accessibility report', async ({
  page,
  a11yMaterial,
  a11yCollection,
  browser
}) => {
  test.setTimeout(300_000)
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

  // Omat oppimateriaalit
  const omatPage = await etusivu.header.clickOmatMateriaalit()
  await omatPage.locators.julkaistutMateriaalitHeading.waitFor()
  results.push(await scan(page, 'Omat oppimateriaalit', dir))

  // Kokoelmat
  await omatPage.header.clickKokoelmat()
  await page.waitForLoadState('domcontentloaded')
  results.push(await scan(page, 'Kokoelmat', dir))

  // Muokkaa materiaalia (edit-material form)
  const omatForEdit = await etusivu.header.clickOmatMateriaalit()
  await omatForEdit.startToEditMateriaaliNumero(a11yMaterial.materiaaliNumero)
  await page.waitForLoadState('domcontentloaded')
  results.push(await scan(page, 'Muokkaa materiaalia', dir))

  // Muokkaa kokoelmaa (edit-collection form)
  const omatForKokoelma = await etusivu.header.clickOmatMateriaalit()
  await omatForKokoelma.startToEditKokoelma(a11yCollection.kokoelmaNimi)
  await page.waitForLoadState('domcontentloaded')
  results.push(await scan(page, 'Muokkaa kokoelmaa', dir))

  // Arvostelut (reviews view — two-user flow)
  const reviewCtx = await browser.newContext({ storageState: undefined, ignoreHTTPSErrors: true })
  const reviewerPage = await reviewCtx.newPage()
  try {
    await reviewerPage.goto('/', { waitUntil: 'domcontentloaded' })
    const logIn = reviewerPage.getByRole('button', { name: 'Log in' })
    await logIn.waitFor()
    await logIn.click()
    await reviewerPage.getByRole('textbox', { name: 'Username' }).fill('tuomas.jukola')
    await reviewerPage.getByRole('textbox', { name: 'Password' }).fill('password123')
    await reviewerPage.getByRole('button', { name: 'Login' }).click()
    await reviewerPage.waitForURL('/#/etusivu', { waitUntil: 'domcontentloaded' })
    const languageSelector = reviewerPage.getByRole('button', {
      name: 'Suomi: Vaihda kieli suomeksi'
    })
    await languageSelector.waitFor()
    await languageSelector.click()

    await reviewerPage.goto(`/#/materiaali/${a11yMaterial.materiaaliNumero}`, {
      waitUntil: 'domcontentloaded'
    })
    // Accept ToS if prompted on first login for this user.
    try {
      await reviewerPage.getByText('Olen lukenut').click({ timeout: 1000 })
      await reviewerPage.getByRole('button', { name: 'Tallenna' }).click()
      await reviewerPage.goto(`/#/materiaali/${a11yMaterial.materiaaliNumero}`, {
        waitUntil: 'domcontentloaded'
      })
    } catch (_e) {
      console.log('Terms of Service already accepted, skipping')
    }

    // Submit a review as tuomas.jukola so the "Katso kaikki arviot" link appears.
    const reviewerMateriaali = Materiaali(reviewerPage)
    try {
      await reviewerMateriaali.lisaaArvio({
        ratingContent: '4',
        ratingVisual: '5',
        feedbackPositive: 'Erittäin hyvä ja selkeä materiaali',
        feedbackSuggest: 'Voisi olla enemmän esimerkkejä',
        feedbackPurpose: 'Käytin opetuksessa'
      })
    } catch (_e) {
      // Review may already exist (e.g. test rerun); proceed to the reviews view.
      console.log('Review submission skipped (may already exist)')
    }

    // Open the reviews view.
    await reviewerMateriaali.katsoKaikkiArviotLink.waitFor()
    await reviewerMateriaali.clickKatsoKaikkiArviot()
    await reviewerPage.waitForLoadState('domcontentloaded')

    results.push(await scan(reviewerPage, 'Arvostelut', dir))
  } finally {
    await reviewCtx.close()
  }

  const loggedOut = await browser.newContext({ storageState: undefined, ignoreHTTPSErrors: true })
  const outPage = await loggedOut.newPage()
  await outPage.goto('/#/etusivu', { waitUntil: 'domcontentloaded' })
  await outPage.waitForFunction(() => document.documentElement.lang !== '', null, { timeout: 5000 })
  results.push(await scan(outPage, 'Etusivu (logged out)', dir))
  await loggedOut.close()

  fs.writeFileSync(path.join(dir, 'a11y-axe-report.html'), toCombinedHtml(results))
  console.log(
    'Axe report written to playwright-results/: a11y-axe-report.html (combined, all pages) + per-page axe-<page>.html'
  )

  expect(results.length).toBeGreaterThan(0)
})
