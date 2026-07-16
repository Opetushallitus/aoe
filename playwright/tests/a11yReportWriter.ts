import * as fs from 'node:fs'
import * as path from 'node:path'

export const AXE_DATA_DIR = path.join(__dirname, '../../playwright-results/axe-data')
export const REPORT_HTML_PATH = path.join(
  __dirname,
  '../../playwright-results/a11y-axe-report.html'
)

export type RuleNode = {
  selector: string
  screenshot?: string
}
export type RuleHit = {
  id: string
  impact: string | null
  help: string
  wcag: string[]
  nodes: RuleNode[]
}
export type ScanRecord = {
  label: string
  target: string
  viewport: string
  url: string
  violations: RuleHit[]
  incomplete: RuleHit[]
  passes: number
  inapplicable: number
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Removes and recreates the per-scan data directory (called from globalSetup).
export const clearAxeData = () => {
  fs.rmSync(AXE_DATA_DIR, { recursive: true, force: true })
  fs.mkdirSync(AXE_DATA_DIR, { recursive: true })
}

// Writes one scan's record as JSON (called from scanA11y during tests).
export const recordScan = (record: ScanRecord) => {
  fs.mkdirSync(AXE_DATA_DIR, { recursive: true })
  fs.writeFileSync(path.join(AXE_DATA_DIR, `${slug(record.label)}.json`), JSON.stringify(record))
}

const ruleList = (hits: RuleHit[], showImpact: boolean) =>
  `<ul>${hits
    .map((h) => {
      const impact = showImpact
        ? `<span class="badge ${h.impact ?? 'none'}">${h.impact ?? 'n/a'}</span> `
        : ''
      const nodes = h.nodes.length
        ? `<ul class="nodes">${h.nodes
            .map((n) => {
              const img = n.screenshot
                ? `<div class="shot"><img loading="lazy" src="${n.screenshot}" alt="Screenshot of ${escapeHtml(n.selector)}"></div>`
                : ''
              return `<li><code>${escapeHtml(n.selector)}</code>${img}</li>`
            })
            .join('')}</ul>`
        : ''
      return `<li><code>${h.id}</code> ${impact}<span class="wcag">${h.wcag.join('/')}</span> — ${escapeHtml(h.help)}${nodes}</li>`
    })
    .join('')}</ul>`

const toCombinedHtml = (records: ScanRecord[]): string => {
  const nav = records
    .map((r) => {
      const open = r.url
        ? ` <a class="open" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">↗</a>`
        : ''
      return (
        `<tr><td><a href="#${slug(r.label)}">${escapeHtml(r.label)}</a>${open}</td>` +
        `<td class="num v">${r.violations.length}</td><td class="num r">${r.incomplete.length}</td>` +
        `<td class="num p">${r.passes}</td><td class="num">${r.inapplicable}</td></tr>`
      )
    })
    .join('')
  const sections = records
    .map((r) => {
      const open = r.url
        ? ` <a class="open" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">↗ open page</a>`
        : ''
      const vio = r.violations.length
        ? `<h3>Violations</h3>${ruleList(r.violations, true)}`
        : '<p class="none">No violations.</p>'
      const inc = r.incomplete.length
        ? `<h3>Needs manual review (axe could not decide)</h3>${ruleList(r.incomplete, false)}`
        : ''
      return `<section id="${slug(r.label)}"><h2>${escapeHtml(r.label)}${open}</h2><p class="counts">Violations: ${r.violations.length} · Needs review: ${r.incomplete.length} · Passes: ${r.passes} · N/A: ${r.inapplicable}</p>${vio}${inc}</section>`
    })
    .join('')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>AOE axe accessibility report — all scanned states</title><style>
body{font:14px/1.5 system-ui,sans-serif;margin:2rem;max-width:60rem;color:#1a1a1a}
h1{margin-top:0}table{border-collapse:collapse;margin:1rem 0}
th,td{border:1px solid #ddd;padding:.4rem .7rem;text-align:left}
.num{text-align:right}td.v{color:#b00020;font-weight:600}td.r{color:#a15c00}td.p{color:#1a7f37}
code{background:#f3f3f3;padding:.1rem .3rem;border-radius:3px;font-size:.85em}
.badge{font-size:.72rem;padding:.05rem .4rem;border-radius:3px;color:#fff;background:#888}
.badge.critical{background:#b00020}.badge.serious{background:#d35400}
.badge.moderate{background:#a15c00}.badge.minor{background:#666}
.wcag{color:#555;font-size:.8rem}.none{color:#1a7f37}.counts{color:#555}
.open{font-size:.8rem;font-weight:normal;text-decoration:none}
section{margin:1.6rem 0;border-top:1px solid #eee;padding-top:.5rem}
ul.nodes{margin:.2rem 0 .6rem;color:#444}ul.nodes code{background:#eef}
.shot img{max-width:100%;max-height:30rem;border:1px solid #ccc;border-radius:4px;margin:.3rem 0;display:block}
</style></head><body>
<h1>AOE axe accessibility report — all scanned states</h1>
<p>WCAG 2.1 A/AA. Full axe scan (no suppressions); these are the actual states the gate scans. ${records.length} state(s).</p>
<table><thead><tr><th>State</th><th>Violations</th><th>Needs review</th><th>Passes</th><th>N/A</th></tr></thead><tbody>${nav}</tbody></table>
${sections}
</body></html>
`
}

// Reads all per-scan JSONs and writes the combined report (called from globalTeardown).
// Does nothing if no scans were recorded (a run with no a11y scans).
export const writeCombinedReport = () => {
  if (!fs.existsSync(AXE_DATA_DIR)) {
    return
  }
  const files = fs.readdirSync(AXE_DATA_DIR).filter((f) => f.endsWith('.json'))
  if (files.length === 0) {
    return
  }
  const records: ScanRecord[] = files
    .map((f) => JSON.parse(fs.readFileSync(path.join(AXE_DATA_DIR, f), 'utf8')) as ScanRecord)
    .sort((a, b) => a.label.localeCompare(b.label))
  fs.writeFileSync(REPORT_HTML_PATH, toCombinedHtml(records))
  console.log(`a11y report: wrote ${REPORT_HTML_PATH} (${records.length} states)`)
}
