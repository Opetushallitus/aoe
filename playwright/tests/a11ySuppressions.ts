// Known, documented a11y debt — NOT regressions. Keyed by `${target}|${viewport}`.
// Removing an entry makes the scan enforce that rule again.
export const KNOWN_ISSUES: Record<string, string[]> = {
  'Etusivu|desktop': [],
  'Etusivu|mobile': [],
  'Haku|desktop': [],
  'Haku|mobile': [],
  'OmatOppimateriaalit|desktop': [],
  'OmatOppimateriaalit|mobile': [],
  'UusiOppimateriaali|desktop': [],
  'UusiOppimateriaali|mobile': [],
  'Materiaali|desktop': [],
  'Materiaali|mobile': [],
  'HakuFilter|desktop': [],
  'NgSelect|desktop': [
    'aria-allowed-attr', // TODO(a11y): ng-select optgroup (role="group") uses disallowed aria-setsize/aria-posinset — file ticket
    'scrollable-region-focusable' // TODO(a11y): .ng-dropdown-panel-items scroll container not keyboard focusable — file ticket
  ],
  'MobileNav|mobile': [],
  'UusiMateriaali:tiedostot|desktop': [],
  'UusiMateriaali:perustiedot|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name; the role="progressbar" is on the auto-generated <bar> and the component exposes no aria API — file ticket
    'color-contrast' // TODO(a11y): step-indicator links (a[href$="#/lisaa-oppimateriaali/1"]) have insufficient color contrast — file ticket
  ],
  'UusiMateriaali:koulutustiedot|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'UusiMateriaali:tarkemmat|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'UusiMateriaali:lisenssitiedot|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'UusiMateriaali:hyodynnetyt|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'UusiMateriaali:errors|desktop': [
    'color-contrast' // TODO(a11y): .invalid-feedback > div error message text has insufficient color contrast against white background — file ticket
  ],
  'MuokkaaMateriaalia:tiedostot|desktop': [
    'color-contrast' // TODO(a11y): .btn-danger "Poista" button has insufficient color contrast (2.85 vs 4.5:1) — file ticket
  ],
  'MuokkaaMateriaalia:perustiedot|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaMateriaalia:koulutustiedot|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaMateriaalia:tarkemmat|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaMateriaalia:lisenssitiedot|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaMateriaalia:hyodynnetyt|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaMateriaalia:esikatselu|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaKokoelmaa:muokkaus|desktop': [],
  'MuokkaaKokoelmaa:esikatselu|desktop': [],
  'MuokkaaKokoelmaa:errors|desktop': [
    'color-contrast' // TODO(a11y): span.bg-danger "Pakollinen" badge has insufficient color contrast (2.85 vs 4.5:1, #ffffff on #f86c6b) — file ticket
  ],
  'UusiMateriaali:esikatselu|desktop': [
    'aria-progressbar-name', // TODO(a11y): ngx-bootstrap progress bar has no accessible name (no aria API) — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'Kokoelmat|desktop': [],
  'Kokoelmat|mobile': [],
  'Kokoelma|desktop': [],
  'Kokoelma|mobile': [],
  'Arvostelut|desktop': [
    'color-contrast' // TODO(a11y): .text-muted "/ 5" rating denominator text (#768192 on #ffffff) has insufficient contrast ratio 3.94 vs required 4.5:1 — file ticket
  ],
  'HakuPublic|desktop': [],
  'HakuPublic|mobile': [],
  'EtusivuPublic|desktop': [],
  'EtusivuPublic|mobile': []
}

export const disableRulesFor = (target: string, viewport: string) =>
  KNOWN_ISSUES[`${target}|${viewport}`] ?? []
