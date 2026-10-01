# Playwright Tests

```bash
./run-tests.sh                # Run from repo root
```

## Creating materials in tests

Use `taytaJaTallennaUusiMateriaali(nimi, opts)` to create a material — don't hand-walk the wizard. Pass what the test needs through `opts`, and add a new `opts` field if a case isn't covered. Only walk the steps manually when the test *is* about the walk itself (per-step a11y scans, keyboard-only completion, or stopping mid-flow).

## `pressSequentially()` vs `fill()`

Some Angular inputs use `(keyup)` handlers for logic (e.g. debounced lookups). Playwright's `fill()` doesn't fire keyboard events, so these handlers won't trigger. **Use `pressSequentially()` instead of `fill()`** for inputs with `(keyup)`, `(keydown)`, or `(keypress)` bindings.

Known affected inputs:
- `#materialId` in `admin/remove-material/` — `(keyup)="getMaterialInfo($event)"`
- `#materialId` in `admin/change-material-owner/` — `(keyup)="getMaterialInfo($event)"`

