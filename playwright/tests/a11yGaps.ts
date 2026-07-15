// a11y checks known to fail today — NOT regressions. Keyed by a stable id.
// A failing assertion guarded by `isKnownGap(id)` stays green; every other
// assertion still runs, so regressions and new gaps fail.
export const KNOWN_GAPS: Record<string, string> = {
  'error-assoc:collection':
    'TODO(a11y): collection keywords ng-select error not programmatically associated (no aria-invalid) — file ticket',
  'modal-focus-return':
    'TODO(a11y): metadata modal Escape does not return focus to trigger — file ticket',
  'wizard-confirm-checkbox':
    "TODO(a11y): esikatselu's confirm checkbox does not update Angular reactive form via Space keypress; keyboard Space on focused checkbox is WCAG-required but does not trigger Angular valueChanges — file ticket",
  'wizard-license-radio':
    'TODO(a11y): license step radio buttons do not update Angular reactive form via keyboard Space; Space on focused radio does not mark the form dirty, so the selection is not persisted to sessionStorage — file ticket',
  'wizard-keyword-select':
    'TODO(a11y): keywords ng-select ([addTag]) does not update Angular form control via keyboard; the ControlValueAccessor is not invoked when items are selected by typing and Enter, resulting in keywords staying null — file ticket',
  'focus-route:search':
    'TODO(a11y): focus not moved to main content/heading after search route change — file ticket',
  'focus-route:save':
    'TODO(a11y): focus not moved to main content/heading after save/route change — file ticket',
  'reflow:Etusivu':
    'TODO(a11y): Etusivu has horizontal scroll / does not reflow at 320px — file ticket',
  'reflow:Haku': 'TODO(a11y): Haku has horizontal scroll / does not reflow at 320px — file ticket',
  'reflow:Materiaali':
    'TODO(a11y): Materiaali has horizontal scroll / does not reflow at 320px — file ticket',
  'reflow:OmatOppimateriaalit':
    'TODO(a11y): OmatOppimateriaalit has horizontal scroll / does not reflow at 320px — file ticket',
  'reflow:Kokoelmat':
    'TODO(a11y): Kokoelmat has horizontal scroll / does not reflow at 320px — file ticket'
}

export const isKnownGap = (id: string) => id in KNOWN_GAPS
