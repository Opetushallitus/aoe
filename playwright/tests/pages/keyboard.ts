import { expect, type Locator, type Page } from '@playwright/test'

// Tab (default) until `target` is the active element, up to maxTabs presses.
// Asserts (and fails clearly) if it isn't reachable by keyboard.
export const tabUntilFocused = async (page: Page, target: Locator, maxTabs = 40) => {
  for (let i = 0; i < maxTabs; i++) {
    const focused = await target.evaluate((el) => el === document.activeElement).catch(() => false)
    if (focused) {
      return
    }
    await page.keyboard.press('Tab')
  }
  await expect(target, `not reachable by keyboard within ${maxTabs} Tabs`).toBeFocused()
}

export const expectFocused = (target: Locator) => expect(target).toBeFocused()

// Activate the currently-focused element by keyboard.
export const activate = (page: Page, key: 'Enter' | 'Space' = 'Enter') =>
  page.keyboard.press(key === 'Space' ? 'Space' : 'Enter')

// Operate an ng-select by keyboard: click to open the dropdown, type to filter, move highlight
// with ArrowDown, confirm with Enter. Escape is only sent when the dropdown is still open
// because ng-select's `clearable=true` default makes Escape call clearModel() on a closed panel.
//
// Pass the outer <ng-select> element; the inner [role="combobox"] input is resolved automatically.
export const selectNgSelectByKeyboard = async (page: Page, select: Locator, optionText: string) => {
  // Resolve to the inner combobox — ng-select renders an <input role="combobox"> inside.
  // Always use the inner combobox for focus/typing to ensure ng-select's input handler runs.
  const innerCombobox = select.locator('[role="combobox"]')
  const hasInner = await innerCombobox.count()
  const combobox = hasInner > 0 ? innerCombobox : select
  await combobox.click() // click to open dropdown; reliable for both keyboard and mouse modes
  await page.keyboard.type(optionText)
  const option = page.getByRole('option', { name: optionText }).first()
  await expect(option).toBeVisible()
  await page.keyboard.press('ArrowDown') // move highlight to first matching option
  await page.keyboard.press('Enter')
  // Only press Escape if the dropdown panel is still open — pressing Escape on a closed
  // ng-select with clearable=true (the default) would clear the selection.
  const panelOpen = await page
    .locator('.ng-dropdown-panel')
    .isVisible()
    .catch(() => false)
  if (panelOpen) {
    await page.keyboard.press('Escape')
  }
}

// Assert Tab does not move focus outside `container` over `tabs` presses (focus trap).
export const expectFocusTrapped = async (page: Page, container: Locator, tabs = 12) => {
  for (let i = 0; i < tabs; i++) {
    await page.keyboard.press('Tab')
    const inside = await container.evaluate((el) => el.contains(document.activeElement))
    expect(inside, `focus escaped the container after ${i + 1} Tab(s)`).toBe(true)
  }
}

// Run `action`, then assert focus returned to the element focused before it.
export const expectFocusReturns = async (
  _page: Page,
  trigger: Locator,
  action: () => Promise<void>
) => {
  await trigger.focus()
  await action()
  await expect(trigger).toBeFocused()
}
