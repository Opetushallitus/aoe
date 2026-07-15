// Known, documented a11y debt — NOT regressions. Keyed by `${target}|${viewport}`.
// Removing an entry makes the scan enforce that rule again.
export const KNOWN_ISSUES: Record<string, string[]> = {
  'Etusivu|desktop': ['aria-command-name'], // TODO(a11y): user-details-dropdown missing accessible name — file ticket
  // On mobile the user menu lives in the collapsed nav, so it is only intermittently
  // rendered into the scan — suppress the same debt for a deterministic gate.
  'Etusivu|mobile': ['aria-command-name'], // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  'Haku|desktop': ['aria-command-name'], // TODO(a11y): #user-details-dropdown (user icon link) has no accessible name — file ticket
  // On mobile the user menu lives in the collapsed nav and is not rendered into the scan.
  'Haku|mobile': [], // no suppressions needed on populated mobile search results
  'OmatOppimateriaalit|desktop': ['aria-command-name'], // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  'OmatOppimateriaalit|mobile': ['aria-command-name'], // TODO(a11y): #user-details-dropdown missing accessible name (intermittently rendered in collapsed nav) — file ticket
  'UusiOppimateriaali|desktop': ['aria-command-name', 'button-name'], // TODO(a11y): #user-details-dropdown missing accessible name; 10 help-icon buttons (div[formgroupname="name"] > .btn-link) have no accessible name — file ticket
  'UusiOppimateriaali|mobile': ['aria-command-name', 'button-name'], // TODO(a11y): #user-details-dropdown missing accessible name (intermittently rendered in collapsed nav); 10 help-icon buttons (div[formgroupname="name"] > .btn-link) have no accessible name — file ticket
  'Materiaali|desktop': ['aria-command-name', 'button-name', 'nested-interactive'], // TODO(a11y): #user-details-dropdown missing name; .btn-tooltip has no accessible name; .panel-heading contains nested interactive elements — file ticket
  'Materiaali|mobile': ['aria-command-name', 'button-name', 'nested-interactive'], // TODO(a11y): #user-details-dropdown missing name (intermittently rendered in collapsed nav); .btn-tooltip has no accessible name; .panel-heading contains nested interactive elements — file ticket
  'HakuFilter|desktop': [
    'aria-command-name' // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  ],
  'NgSelect|desktop': [
    'aria-allowed-attr', // TODO(a11y): ng-select optgroup (role="group") uses disallowed aria-setsize/aria-posinset — file ticket
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'scrollable-region-focusable' // TODO(a11y): .ng-dropdown-panel-items scroll container not keyboard focusable — file ticket
  ],
  'MobileNav|mobile': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-valid-attr-value' // TODO(a11y): .navbar-toggler has an invalid aria attribute value — file ticket
  ],
  'UusiMateriaali:tiedostot|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'button-name' // TODO(a11y): 10 help-icon buttons (div[formgroupname="name"] > .btn-link) have no accessible name — file ticket
  ],
  'UusiMateriaali:perustiedot|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar (role="progressbar") has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-link) have no accessible name — file ticket
    'color-contrast', // TODO(a11y): step-indicator links (a[href$="/lisaa-oppimateriaali/1"]) have insufficient color contrast — file ticket
    'image-alt' // TODO(a11y): thumbnail placeholder img[src$="ic_camera.svg"] has no alt attribute — rendered before a thumbnail resolves (cold stack in CI), same gap as MuokkaaMateriaalia:perustiedot — file ticket
  ],
  'UusiMateriaali:koulutustiedot|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'UusiMateriaali:tarkemmat|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'UusiMateriaali:lisenssitiedot|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'UusiMateriaali:hyodynnetyt|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'UusiMateriaali:errors|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (div[formgroupname="name"] > .btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): .invalid-feedback > div error message text has insufficient color contrast against white background — file ticket
  ],
  'MuokkaaMateriaalia:tiedostot|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (div[formgroupname="name"] > .btn-tooltip.btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): .btn-danger "Poista" button has insufficient color contrast (2.85 vs 4.5:1) — file ticket
  ],
  'MuokkaaMateriaalia:perustiedot|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar (role="progressbar") has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-tooltip.btn-link) have no accessible name — file ticket
    'color-contrast', // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
    'image-alt' // TODO(a11y): pre-filled thumbnail <img class="img-fluid mb-2 border"> has no alt attribute — file ticket
  ],
  'MuokkaaMateriaalia:koulutustiedot|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-tooltip.btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaMateriaalia:tarkemmat|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-tooltip.btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaMateriaalia:lisenssitiedot|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-tooltip.btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaMateriaalia:hyodynnetyt|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-tooltip.btn-link) have no accessible name — file ticket
    'color-contrast' // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
  ],
  'MuokkaaMateriaalia:esikatselu|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-tooltip.btn-link) have no accessible name — file ticket
    'color-contrast', // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
    'definition-list', // TODO(a11y): <dl> in preview contains Angular custom elements as direct children, not allowed — file ticket
    'dlitem' // TODO(a11y): <dt>/<dd> inside <app-preview-row> are not direct children of <dl> — file ticket
  ],
  'MuokkaaKokoelmaa:muokkaus|desktop': [
    'aria-command-name' // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  ],
  'MuokkaaKokoelmaa:esikatselu|desktop': [
    'aria-command-name' // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  ],
  'MuokkaaKokoelmaa:errors|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'color-contrast' // TODO(a11y): span.bg-danger "Pakollinen" badge has insufficient color contrast (2.85 vs 4.5:1, #ffffff on #f86c6b) — file ticket
  ],
  'UusiMateriaali:esikatselu|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'aria-progressbar-name', // TODO(a11y): progress bar has no accessible name — file ticket
    'button-name', // TODO(a11y): help-icon buttons (.btn-link) have no accessible name — file ticket
    'color-contrast', // TODO(a11y): step-indicator links have insufficient color contrast — file ticket
    'definition-list', // TODO(a11y): <dl> in preview contains Angular custom elements (<app-preview-row>) as direct children, not allowed — file ticket
    'dlitem' // TODO(a11y): <dt>/<dd> inside <app-preview-row> are not direct children of <dl> — file ticket
  ],
  'Kokoelmat|desktop': [
    'aria-command-name' // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  ],
  // On mobile the user menu lives in the collapsed nav, so it is only intermittently
  // rendered into the scan — suppress for a deterministic gate.
  'Kokoelmat|mobile': [
    'aria-command-name' // TODO(a11y): #user-details-dropdown missing accessible name (intermittently rendered in collapsed nav) — file ticket
  ],
  'Kokoelma|desktop': [
    'aria-command-name' // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
  ],
  // On mobile the user menu lives in the collapsed nav, so it is only intermittently
  // rendered into the scan — suppress for a deterministic gate.
  'Kokoelma|mobile': [
    'aria-command-name' // TODO(a11y): #user-details-dropdown missing accessible name (intermittently rendered in collapsed nav) — file ticket
  ],
  'Arvostelut|desktop': [
    'aria-command-name', // TODO(a11y): #user-details-dropdown missing accessible name — file ticket
    'color-contrast' // TODO(a11y): .text-muted "/ 5" rating denominator text (#768192 on #ffffff) has insufficient contrast ratio 3.94 vs required 4.5:1 — file ticket
  ],
  // Logged-out Haku page: no user menu, but search-filter accordion and content elements have issues
  'HakuPublic|desktop': [
    'aria-command-name', // TODO(a11y): search-filter toggle div[role="button"] (.header) has no accessible name — file ticket
    'aria-valid-attr-value', // TODO(a11y): search-filter toggle .header has invalid aria-controls value — file ticket
    'button-name', // TODO(a11y): #button-narrow-search and related filter buttons (3 nodes) have no accessible name — file ticket
    'image-alt', // TODO(a11y): .img-fluid image in search results has no alt attribute — file ticket
    'link-name' // TODO(a11y): eduuni wiki link a[href$="i_iLI"] has no text content — file ticket
  ],
  'HakuPublic|mobile': [
    'aria-command-name', // TODO(a11y): search-filter toggle div[role="button"] (.header) has no accessible name — file ticket
    'aria-valid-attr-value', // TODO(a11y): search-filter toggle .header has invalid aria-controls value — file ticket
    'button-name', // TODO(a11y): #button-narrow-search and related filter buttons (3 nodes) have no accessible name — file ticket
    'image-alt', // TODO(a11y): .img-fluid image in search results has no alt attribute — file ticket
    'link-name' // TODO(a11y): eduuni wiki link a[href$="i_iLI"] has no text content — file ticket
  ],
  // Logged-out Etusivu page: no user menu present, so cleaner than authenticated scan
  'EtusivuPublic|desktop': [],
  'EtusivuPublic|mobile': []
}

export const disableRulesFor = (target: string, viewport: string) =>
  KNOWN_ISSUES[`${target}|${viewport}`] ?? []
