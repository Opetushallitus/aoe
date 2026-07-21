import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

import { disableRulesFor } from '../a11ySuppressions'
import { type RuleHit, type RuleNode, recordScan } from '../a11yReportWriter'

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

export type A11yResults = Awaited<ReturnType<AxeBuilder['analyze']>>

const SHOT_PADDING = 56
const HIDE_OVERLAY_CSS = 'app-cookie-notice,.cookie-notice{display:none!important}'

// A lazy-loaded route's CSS <link> is injected on navigation and applies only once
// loaded; under load it can still be pending while we scan and screenshot, leaving the
// view unstyled (browser-default serif) and skewing contrast results. Wait until the
// document is complete, every stylesheet link has applied (non-null `.sheet`), and the
// body actually renders in the app font rather than the UA serif default.
const waitForStyled = async (page: Page) => {
  await page
    .waitForFunction(
      () => {
        if (document.readyState !== 'complete') {
          return false
        }
        const links = [...document.querySelectorAll('link[rel="stylesheet"]')]
        if (!links.every((l) => l instanceof HTMLLinkElement && l.sheet !== null)) {
          return false
        }
        const font = getComputedStyle(document.body).fontFamily.trim().toLowerCase()
        return font.length > 0 && !font.startsWith('times') && !font.startsWith('serif')
      },
      null,
      { timeout: 10000 }
    )
    .catch(() => {})
  await page.evaluate(() => document.fonts?.ready).catch(() => {})
}

// axe targets are frame paths: every segment but the last is an iframe to descend into.
const locateTarget = (page: Page, target: (string | string[])[]) => {
  const segs = target.map((s) => (Array.isArray(s) ? s.join(' ') : s))
  const last = segs[segs.length - 1]
  if (segs.length === 1) {
    return page.locator(last).first()
  }
  let frame = page.frameLocator(segs[0])
  for (let i = 1; i < segs.length - 1; i++) {
    frame = frame.frameLocator(segs[i])
  }
  return frame.locator(last).first()
}

const captureNodeShot = async (
  page: Page,
  target: (string | string[])[]
): Promise<string | undefined> => {
  const el = locateTarget(page, target)
  await el.scrollIntoViewIfNeeded({ timeout: 5000 })
  const box = await el.boundingBox({ timeout: 5000 })
  const vp = page.viewportSize()
  if (!box || !vp) {
    return undefined
  }
  const inCookieNotice = await el.evaluate((node) => !!node.closest('app-cookie-notice'))
  const overlay = inCookieNotice ? undefined : await page.addStyleTag({ content: HIDE_OVERLAY_CSS })
  const prev = await el.evaluate((node) => {
    const before = { outline: node.style.outline, offset: node.style.outlineOffset }
    node.style.outline = '3px solid #ff2d95'
    node.style.outlineOffset = '2px'
    return before
  })
  await waitForStyled(page)
  const x0 = Math.max(0, box.x - SHOT_PADDING)
  const y0 = Math.max(0, box.y - SHOT_PADDING)
  const x1 = Math.min(vp.width, box.x + box.width + SHOT_PADDING)
  const y1 = Math.min(vp.height, box.y + box.height + SHOT_PADDING)
  const buf = await page.screenshot({
    clip: { x: x0, y: y0, width: Math.max(1, x1 - x0), height: Math.max(1, y1 - y0) }
  })
  await el.evaluate((node, before) => {
    node.style.outline = before.outline
    node.style.outlineOffset = before.offset
  }, prev)
  if (overlay) {
    await overlay.evaluate((node) => node.parentNode?.removeChild(node))
  }
  return `data:image/png;base64,${buf.toString('base64')}`
}

const captureHits = async (page: Page, hits: A11yResults['violations']): Promise<RuleHit[]> => {
  const result: RuleHit[] = []
  for (const h of hits) {
    const nodes: RuleNode[] = []
    for (const n of h.nodes) {
      const selector = n.target.join(' ')
      let screenshot: string | undefined
      try {
        screenshot = await captureNodeShot(page, n.target)
      } catch {
        // element not resolvable or not visible — record the node without a shot
      }
      nodes.push({ selector, screenshot })
    }
    result.push({
      id: h.id,
      impact: h.impact ?? null,
      help: h.help,
      wcag: h.tags.filter((t) => t.startsWith('wcag')),
      nodes
    })
  }
  return result
}

// Runs FULL axe (no disableRules), records the scan for the report (all violations, incl.
// in-frame ones), and asserts no violations EXCEPT those inside an <iframe> (third-party
// pdf.js chrome) or documented in a11ySuppressions for this target+viewport.
export const scanA11y = async (
  page: Page,
  target: string,
  viewport: string,
  opts: { include?: string } = {}
) => {
  await waitForStyled(page)

  const builder = new AxeBuilder({ page }).withTags(WCAG_AA_TAGS)
  if (opts.include) {
    builder.include(opts.include)
  }
  const r = await builder.analyze()

  const violations = await captureHits(page, r.violations)
  const incomplete = await captureHits(page, r.incomplete)

  recordScan({
    label: `${target} @ ${viewport}`,
    target,
    viewport,
    url: r.url,
    violations,
    incomplete,
    passes: r.passes.length,
    inapplicable: r.inapplicable.length
  })

  // The pdf.js viewer (ng2-pdfjs-viewer) renders its own toolbar inside an <iframe>; that
  // chrome is third-party and unfixable. Keep those hits in the report (above), but don't
  // let content inside an iframe block CI. axe prepends the frame selector(s) to a node's
  // target, so a node inside an iframe has an `iframe` selector in every hop but the last
  // (the element itself). A top-level <iframe> element's own violation still enforces.
  const isInsideIframe = (node: A11yResults['violations'][number]['nodes'][number]) =>
    node.target.slice(0, -1).some((hop) => {
      const selector = Array.isArray(hop) ? hop.join(' ') : hop
      return selector.includes('iframe')
    })
  const suppressed = new Set(disableRulesFor(target, viewport))
  const enforced = r.violations
    .map((v) => ({ ...v, nodes: v.nodes.filter((n) => !isInsideIframe(n)) }))
    .filter((v) => v.nodes.length > 0 && !suppressed.has(v.id))
  const summary = enforced
    .map((v) => {
      const t = v.nodes[0]?.target?.join(' ') ?? '(unknown target)'
      return `  [${v.impact ?? 'none'}] ${v.id} (${v.nodes.length}) — ${t}`
    })
    .join('\n')
  expect(enforced, `${target} @ ${viewport} has a11y violations:\n${summary}`).toEqual([])
}
