import { type APIRequestContext, expect, test } from '@playwright/test'
import { firstKeys } from './helpers/referenceData'

const REFERENCE_DATA_TIMEOUT_MS = 8 * 60_000
const REFERENCE_DATA_POLL_MS = 5_000
const REFERENCE_DATA_REQUEST_TIMEOUT_MS = 30_000

const fetchFinnish = async (request: APIRequestContext, path: string): Promise<unknown> => {
  try {
    const response = await request.get(`/ref/api/v1/${path}/fi`, {
      timeout: REFERENCE_DATA_REQUEST_TIMEOUT_MS
    })

    if (!response.ok()) {
      return []
    }

    return await response.json()
  } catch {
    return []
  }
}

const unfinishedUpdateChains = async (request: APIRequestContext): Promise<string[]> => {
  const upperSecondarySubjects = await fetchFinnish(request, 'lukio-oppiaineet')
  const upperSecondaryModules = await fetchFinnish(
    request,
    `lukio-moduulit/${firstKeys(upperSecondarySubjects)}`
  )
  const upperSecondaryObjectives = await fetchFinnish(
    request,
    `lukio-tavoitteet/${firstKeys(upperSecondaryModules)}`
  )
  const vocationalCommonUnits = await fetchFinnish(request, 'ammattikoulu-yto-aineet')
  const basicEducationSubjects = await fetchFinnish(request, 'oppiaineet')
  const preparatoryEducationSubjects = await fetchFinnish(request, 'tuva-oppiaineet')

  return Object.entries({
    setLukionTavoitteetSisallot: upperSecondaryObjectives,
    setAmmattikoulunYTOaineet: vocationalCommonUnits,
    setPerusopetuksenOppiaineet: basicEducationSubjects,
    setTuvaOppiaineetTavoitteet: preparatoryEducationSubjects
  })
    .filter(([, stored]) => firstKeys(stored) === '')
    .map(([setter]) => setter)
}

test('backend has finished the reference data update', async ({ request }) => {
  test.setTimeout(REFERENCE_DATA_TIMEOUT_MS + 60_000)

  await expect
    .poll(() => unfinishedUpdateChains(request), {
      message: 'Last setter of these reference data update chains has stored nothing yet',
      intervals: [REFERENCE_DATA_POLL_MS],
      timeout: REFERENCE_DATA_TIMEOUT_MS
    })
    .toEqual([])
})
