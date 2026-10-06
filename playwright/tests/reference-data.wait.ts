import { test, expect, type Page } from '@playwright/test'

const REFERENCE_DATA_TIMEOUT_MS = 8 * 60_000
const REFERENCE_DATA_POLL_MS = 5_000
const REFERENCE_DATA_REQUEST_TIMEOUT_MS = 30_000

const referenceDataLists = [
  'asiasanat',
  'organisaatiot',
  'oppimateriaalityypit',
  'koulutusasteet',
  'tieteenalat',
  'kohderyhmat',
  'kayttokohteet',
  'saavutettavuudentukitoiminnot',
  'saavutettavuudenesteet',
  'kielet',
  'oppiaineet',
  'lisenssit',
  'lukionkurssit',
  'lukio-vanha-oppiaineet',
  'lukio-oppiaineet',
  'ammattikoulu-tutkinnot',
  'ammattikoulu-yto-aineet',
  'ammattikoulu-ammattitutkinnot',
  'ammattikoulu-erikoisammattitutkinnot',
  'tuva-oppiaineet'
]

const hasReferenceData = async (page: Page, list: string): Promise<boolean> => {
  try {
    const response = await page.request.get(`/ref/api/v1/${list}/fi`, {
      timeout: REFERENCE_DATA_REQUEST_TIMEOUT_MS
    })
    const body: unknown = response.ok() ? await response.json() : []
    return Array.isArray(body) && body.length > 0
  } catch {
    return false
  }
}

const missingReferenceData = async (page: Page): Promise<string[]> => {
  const missing: string[] = []
  for (const list of referenceDataLists) {
    const loaded = await hasReferenceData(page, list)
    if (!loaded) {
      missing.push(list)
    }
  }
  return missing
}

test('backend has loaded the reference data', async ({ page }) => {
  test.setTimeout(REFERENCE_DATA_TIMEOUT_MS + 60_000)

  await expect
    .poll(() => missingReferenceData(page), {
      message: 'Reference data lists still missing from the backend',
      intervals: [REFERENCE_DATA_POLL_MS],
      timeout: REFERENCE_DATA_TIMEOUT_MS
    })
    .toEqual([])
})
