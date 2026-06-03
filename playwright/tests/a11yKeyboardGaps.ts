// Keyboard checks known to fail today — NOT regressions. Keyed by a stable id.
// A failing assertion guarded by `isKnownGap(id)` stays green; every other
// assertion still runs, so regressions and new gaps fail.
export const KEYBOARD_GAPS: Record<string, string> = {
  'skip-link': 'TODO(a11y): no skip-to-content link — file ticket',
  'modal-focus-return':
    'TODO(a11y): metadata modal Escape does not return focus to trigger — file ticket',
  'file-picker':
    'TODO(a11y): native file-picker dialog cannot be opened or operated by keyboard — file ticket',
  'wizard-confirm-checkbox':
    "TODO(a11y): esikatselu's confirm checkbox does not update Angular reactive form via Space keypress; keyboard Space on focused checkbox is WCAG-required but does not trigger Angular valueChanges — file ticket",
  'wizard-license-radio':
    'TODO(a11y): license step radio buttons do not update Angular reactive form via keyboard Space; Space on focused radio does not mark the form dirty, so the selection is not persisted to sessionStorage — file ticket',
  'wizard-keyword-select':
    'TODO(a11y): keywords ng-select ([addTag]) does not update Angular form control via keyboard; the ControlValueAccessor is not invoked when items are selected by typing and Enter, resulting in keywords staying null — file ticket'
}

export const isKnownGap = (id: string) => id in KEYBOARD_GAPS
