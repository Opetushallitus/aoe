// @ts-nocheck
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fetchAllEPerusteetPages, getUnique } from './data.utils.ts'
import { ePerusteetPeruste, type KeyValue } from '@/models/ref/data.ts'
import type { AlignmentObjectExtended } from '@/models/ref/alignment-object-extended.ts'

// Realistic organisation data matching how setOrganisaatiot() builds KeyValue arrays
// and then deduplicates by 'value' (org name) — same org can appear with multiple OIDs
const organisaatiot: KeyValue<string, string>[] = [
  { key: '1.2.246.562.10.00000000001', value: 'Helsingin yliopisto' },
  { key: '1.2.246.562.10.00000000002', value: 'Aalto-yliopisto' },
  { key: '1.2.246.562.10.00000000003', value: 'Helsingin yliopisto' }, // duplicate name, different OID
  { key: '1.2.246.562.10.00000000004', value: 'Tampereen yliopisto' },
  { key: '1.2.246.562.10.00000000005', value: 'Aalto-yliopisto' } // duplicate name, different OID
]

// Realistic lukionkurssit / ammattikoulu data — same course can come from multiple ePerusteet sources
const lukionkurssit: AlignmentObjectExtended[] = [
  {
    key: '1',
    source: 'LukioOPS2016',
    alignmentType: 'teaches',
    targetName: 'Matematiikka, pitkä oppimäärä',
    targetUrl: 'https://eperusteet.opintopolku.fi/api/perusteet/1'
  },
  {
    key: '2',
    source: 'LukioOPS2021',
    alignmentType: 'teaches',
    targetName: 'Äidinkieli ja kirjallisuus',
    targetUrl: 'https://eperusteet.opintopolku.fi/api/perusteet/2'
  },
  {
    key: '3',
    source: 'LukioOPS2016',
    alignmentType: 'teaches',
    targetName: 'Matematiikka, pitkä oppimäärä', // duplicate targetName, different key/source
    targetUrl: 'https://eperusteet.opintopolku.fi/api/perusteet/3'
  },
  {
    key: '4',
    source: 'LukioOPS2021',
    alignmentType: 'teaches',
    targetName: 'Fysiikka',
    targetUrl: 'https://eperusteet.opintopolku.fi/api/perusteet/4'
  }
]

describe('fetchAllEPerusteetPages', () => {
  function toItem(id: number) {
    return {
      id,
      nimi: { fi: `Tutkinto ${id}` },
      voimassaoloAlkaa: 1659301200000,
      siirtymaPaattyy: null
    }
  }

  function makePage(sivu: number, sivuja: number, ...ids: number[]) {
    return { sivu, sivuja, data: ids.map(toItem), kokonaismäärä: ids.length }
  }

  function idsOf(items: { id: number }[] | undefined) {
    return items?.map((item) => item.id)
  }

  function servePages(pages: unknown[], maxCalls = 10) {
    const requested: number[] = []

    async function fetchPage(pageNumber: number) {
      assert.ok(
        requested.length < maxCalls,
        `fetchAllEPerusteetPages did not stop within ${maxCalls} pages`
      )
      requested.push(pageNumber)
      return pages[pageNumber]
    }

    return { requested, fetchPage }
  }

  it('collects every page in order', async () => {
    const { requested, fetchPage } = servePages([
      makePage(0, 3, 1, 2),
      makePage(1, 3, 3),
      makePage(2, 3, 4, 5)
    ])

    assert.deepEqual(
      idsOf(await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot')),
      [1, 2, 3, 4, 5]
    )
    assert.deepEqual(requested, [0, 1, 2])
  })

  it('accepts a single page numbered 0', async () => {
    const { requested, fetchPage } = servePages([makePage(0, 1, 1)])

    assert.deepEqual(idsOf(await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot')), [1])
    assert.deepEqual(requested, [0])
  })

  it('takes the page count from the first page', async () => {
    const { requested, fetchPage } = servePages([makePage(0, 2, 1), makePage(1, 5, 2)])

    assert.deepEqual(idsOf(await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot')), [1, 2])
    assert.deepEqual(requested, [0, 1])
  })

  it('stops when a page has no sivuja', async () => {
    const { requested, fetchPage } = servePages([{ sivu: 0, data: [toItem(1)] }])

    assert.equal(await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot'), undefined)
    assert.deepEqual(requested, [0])
  })

  it('advances even when the server pins sivu at 0', async () => {
    let calls = 0

    async function fetchAlwaysPageZero() {
      assert.ok(++calls <= 10, 'fetchAllEPerusteetPages did not stop within 10 pages')
      return makePage(0, 3, calls)
    }

    const items = await fetchAllEPerusteetPages(fetchAlwaysPageZero, 'perustutkinnot')

    assert.equal(calls, 3)
    assert.deepEqual(idsOf(items), [1, 2, 3])
  })

  it('discards earlier pages when a later page fails', async () => {
    const { fetchPage } = servePages([makePage(0, 3, 1), undefined, makePage(2, 3, 3)])

    assert.equal(await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot'), undefined)
  })

  it('stops on an empty page', async () => {
    const { requested, fetchPage } = servePages([makePage(0, 2), makePage(1, 2, 1)])

    assert.equal(await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot'), undefined)
    assert.deepEqual(requested, [0])
  })

  it('rejects a page that holds a degree with no name', async () => {
    const { fetchPage } = servePages([
      { sivu: 0, sivuja: 1, data: [{ ...toItem(1), nimi: { _id: '2' } }] }
    ])

    assert.equal(await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot'), undefined)
  })

  it('accepts a degree named in swedish only', async () => {
    const { fetchPage } = servePages([
      { sivu: 0, sivuja: 1, data: [{ ...toItem(1), nimi: { sv: 'Grundexamen' } }] }
    ])

    assert.deepEqual(idsOf(await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot')), [1])
  })

  it('rejects a degree with no validity start date', async () => {
    const { fetchPage } = servePages([
      { sivu: 0, sivuja: 1, data: [{ id: 1, nimi: { fi: 'Tutkinto' }, siirtymaPaattyy: null }] }
    ])

    assert.equal(await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot'), undefined)
  })

  it('keeps the validity dates the caller reads', async () => {
    const degree = { ...toItem(1), siirtymaPaattyy: 1790812800000 }
    const { fetchPage } = servePages([{ sivu: 0, sivuja: 1, data: [degree] }])
    const items = await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot')

    assert.equal(items[0].voimassaoloAlkaa, 1659301200000)
    assert.equal(items[0].siirtymaPaattyy, 1790812800000)
  })

  it('accepts a null transition end date', async () => {
    const { fetchPage } = servePages([{ sivu: 0, sivuja: 1, data: [toItem(1)] }])
    const items = await fetchAllEPerusteetPages(fetchPage, 'perustutkinnot')

    assert.equal(items[0].siirtymaPaattyy, null)
  })
})

describe('ePerusteetPeruste', () => {
  const unit = { id: 2, nimi: { fi: 'Ajoneuvon huoltotyöt' }, osaAlueet: [] }
  const requirement = { koodi: { arvo: '9582' }, vaatimus: { fi: 'huoltaa ajoneuvon' } }

  it('accepts a degree with units', () => {
    const parsed = ePerusteetPeruste.safeParse({
      id: 1,
      nimi: { fi: 'Ajoneuvoalan perustutkinto' },
      tutkinnonOsat: [unit]
    })

    assert.equal(parsed.success, true)
  })

  it('rejects a degree with no units', () => {
    const parsed = ePerusteetPeruste.safeParse({ id: 1, nimi: { fi: 'Tutkinto' } })

    assert.equal(parsed.success, false)
  })

  it('rejects a degree with an unnamed unit', () => {
    const parsed = ePerusteetPeruste.safeParse({
      id: 1,
      nimi: { fi: 'Tutkinto' },
      tutkinnonOsat: [{ id: 2, nimi: {} }]
    })

    assert.equal(parsed.success, false)
  })

  it('accepts a target area with a null description', () => {
    const parsed = ePerusteetPeruste.safeParse({
      id: 1,
      nimi: { fi: 'Tutkinto' },
      tutkinnonOsat: [
        {
          ...unit,
          ammattitaitovaatimukset2019: {
            kohdealueet: [{ kuvaus: null, vaatimukset: [requirement] }]
          }
        }
      ]
    })

    assert.equal(parsed.success, true)
  })

  it('rejects a requirement with no koodi, because the controller uses it as the key', () => {
    const parsed = ePerusteetPeruste.safeParse({
      id: 1,
      nimi: { fi: 'Tutkinto' },
      tutkinnonOsat: [
        {
          ...unit,
          ammattitaitovaatimukset2019: {
            kohdealueet: [{ kuvaus: null, vaatimukset: [{ vaatimus: { fi: 'huoltaa' } }] }]
          }
        }
      ]
    })

    assert.equal(parsed.success, false)
  })

  it('accepts a unit with no competence requirements', () => {
    const parsed = ePerusteetPeruste.safeParse({
      id: 1,
      nimi: { fi: 'Tutkinto' },
      tutkinnonOsat: [unit]
    })

    assert.equal(parsed.success, true)
  })
})

describe('getUnique', () => {
  describe('with KeyValue (organisaatiot, dedup by value)', () => {
    it('removes organisations with duplicate names, keeps first occurrence', () => {
      const result = getUnique(organisaatiot, 'value')
      assert.equal(result.length, 3)
      assert.equal(result[0].value, 'Helsingin yliopisto')
      assert.equal(result[1].value, 'Aalto-yliopisto')
      assert.equal(result[2].value, 'Tampereen yliopisto')
    })

    it('keeps the first OID when names collide', () => {
      const result = getUnique(organisaatiot, 'value')
      const helsKi = result.find((r) => r.value === 'Helsingin yliopisto')
      assert.equal(helsKi?.key, '1.2.246.562.10.00000000001')
    })

    it('returns empty array for empty input', () => {
      const result: KeyValue<string, string>[] = getUnique([], 'value')
      assert.deepEqual(result, [])
    })

    it('returns unchanged array when all names are unique', () => {
      const unique: KeyValue<string, string>[] = [
        { key: '1.2.246.562.10.00000000001', value: 'Helsingin yliopisto' },
        { key: '1.2.246.562.10.00000000002', value: 'Aalto-yliopisto' }
      ]
      assert.deepEqual(getUnique(unique, 'value'), unique)
    })
  })

  describe('with AlignmentObjectExtended (lukionkurssit, dedup by targetName)', () => {
    it('removes courses with duplicate targetNames, keeps first occurrence', () => {
      const result = getUnique(lukionkurssit, 'targetName')
      assert.equal(result.length, 3)
      const names = result.map((r) => r.targetName)
      assert.deepEqual(names, [
        'Matematiikka, pitkä oppimäärä',
        'Äidinkieli ja kirjallisuus',
        'Fysiikka'
      ])
    })

    it('keeps the first key/source when targetNames collide', () => {
      const result = getUnique(lukionkurssit, 'targetName')
      const math = result.find((r) => r.targetName === 'Matematiikka, pitkä oppimäärä')
      assert.equal(math?.key, '1')
      assert.equal(math?.source, 'LukioOPS2016')
    })

    it('preserves all other fields on kept items', () => {
      const result = getUnique(lukionkurssit, 'targetName')
      const fysiikka = result.find((r) => r.targetName === 'Fysiikka')
      assert.deepEqual(fysiikka, {
        key: '4',
        source: 'LukioOPS2021',
        alignmentType: 'teaches',
        targetName: 'Fysiikka',
        targetUrl: 'https://eperusteet.opintopolku.fi/api/perusteet/4'
      })
    })
  })
})
