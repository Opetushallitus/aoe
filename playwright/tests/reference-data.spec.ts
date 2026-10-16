import { type APIRequestContext, expect, test } from '@playwright/test'
import { firstKeys } from './helpers/referenceData'

const getJson = async (request: APIRequestContext, path: string): Promise<unknown> => {
  const response = await request.get(`/ref/api/v1/${path}`)
  expect(response.status(), path).toBe(200)
  return response.json()
}

const keyValue = { key: expect.any(String), value: expect.any(String) }
const alignment = { key: expect.anything(), targetName: expect.any(String) }
const nestedAlignment = {
  ...alignment,
  children: expect.arrayContaining([expect.objectContaining(alignment)])
}
const childAlignment = { ...alignment, parent: expect.any(String) }

const lists = {
  asiasanat: keyValue,
  organisaatiot: keyValue,
  oppimateriaalityypit: keyValue,
  kohderyhmat: keyValue,
  kayttokohteet: keyValue,
  kielet: keyValue,
  saavutettavuudentukitoiminnot: { ...keyValue, order: expect.any(Number) },
  saavutettavuudenesteet: { ...keyValue, order: expect.any(Number) },
  koulutusasteet: {
    ...keyValue,
    codeValue: expect.any(String),
    children: expect.arrayContaining([{ ...keyValue, disabled: expect.any(Boolean) }])
  },
  tieteenalat: nestedAlignment,
  oppiaineet: nestedAlignment,
  lukionkurssit: alignment,
  'lukio-vanha-oppiaineet': alignment,
  'lukio-oppiaineet': childAlignment,
  'ammattikoulu-tutkinnot': alignment,
  'ammattikoulu-yto-aineet': nestedAlignment,
  'ammattikoulu-ammattitutkinnot': alignment,
  'ammattikoulu-erikoisammattitutkinnot': alignment,
  'tuva-oppiaineet': alignment
}

const filterGroup = expect.objectContaining({
  key: expect.any(String),
  value: expect.any(String),
  children: expect.arrayContaining([
    expect.objectContaining({ key: expect.anything(), value: expect.any(String) })
  ])
})

for (const lang of ['fi', 'sv', 'en']) {
  test.describe(`reference data in ${lang}`, () => {
    const expectChildren = async (
      request: APIRequestContext,
      route: string,
      parents: unknown
    ): Promise<unknown> => {
      const path = `${route}/${firstKeys(parents)}/${lang}`
      const children = await getJson(request, path)
      expect(children, path).toContainEqual(expect.objectContaining(childAlignment))
      return children
    }

    for (const [category, item] of Object.entries(lists)) {
      test(category, async ({ request }) => {
        const items = await getJson(request, `${category}/${lang}`)
        expect(items).toContainEqual(expect.objectContaining(item))
      })
    }

    test('tavoitteet and sisaltoalueet', async ({ request }) => {
      const subjects = await getJson(request, `oppiaineet/${lang}`)
      await expectChildren(request, 'tavoitteet', subjects)

      const path = `sisaltoalueet/${firstKeys(subjects)}/${lang}`
      const contents = await getJson(request, path)
      expect(contents, path).toContainEqual(
        expect.not.objectContaining({ gradeEntity: expect.anything() })
      )
      expect(contents, path).toContainEqual(
        expect.objectContaining({ ...childAlignment, gradeEntity: expect.anything() })
      )
    })

    test('lukio-vanha-kurssit', async ({ request }) => {
      const subjects = await getJson(request, `lukio-vanha-oppiaineet/${lang}`)
      await expectChildren(request, 'lukio-vanha-kurssit', subjects)
    })

    test('lukio-moduulit, lukio-tavoitteet and lukio-sisallot', async ({ request }) => {
      const subjects = await getJson(request, `lukio-oppiaineet/${lang}`)
      const modules = await expectChildren(request, 'lukio-moduulit', subjects)
      await expectChildren(request, 'lukio-tavoitteet', modules)
      await expectChildren(request, 'lukio-sisallot', modules)
    })

    for (const degrees of [
      'ammattikoulu-tutkinnot',
      'ammattikoulu-ammattitutkinnot',
      'ammattikoulu-erikoisammattitutkinnot'
    ]) {
      test(`ammattikoulu-tutkinnon-osat and ammattikoulu-vaatimukset of ${degrees}`, async ({
        request
      }) => {
        const qualifications = await getJson(request, `${degrees}/${lang}`)
        const units = await expectChildren(request, 'ammattikoulu-tutkinnon-osat', qualifications)
        await expectChildren(request, 'ammattikoulu-vaatimukset', units)
      })
    }

    test('tuva-tavoitteet', async ({ request }) => {
      const subjects = await getJson(request, `tuva-oppiaineet/${lang}`)
      await expectChildren(request, 'tuva-tavoitteet', subjects)
    })

    test('filters-oppiaineet-tieteenalat-tutkinnot', async ({ request }) => {
      const filters = await getJson(request, `filters-oppiaineet-tieteenalat-tutkinnot/${lang}`)
      expect(filters).toEqual([filterGroup, filterGroup, null, filterGroup])
    })
  })
}
