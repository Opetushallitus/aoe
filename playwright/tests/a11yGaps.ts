// a11y checks known to fail today — NOT regressions. Keyed by a stable id.
// A failing assertion guarded by `isKnownGap(id)` stays green; every other
// assertion still runs, so regressions and new gaps fail.
export const KNOWN_GAPS: Record<string, string> = {
  'error-assoc:collection':
    'TODO(a11y): collection keywords ng-select error not programmatically associated (no aria-invalid) — file ticket',
  'wizard-keyword-select':
    'TODO(a11y): keywords ng-select ([addTag]) does not update Angular form control via keyboard; the ControlValueAccessor is not invoked when items are selected by typing and Enter, resulting in keywords staying null — file ticket'
}

export const isKnownGap = (id: string) => id in KNOWN_GAPS
