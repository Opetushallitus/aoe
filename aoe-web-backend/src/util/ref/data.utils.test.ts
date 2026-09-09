// @ts-nocheck
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fetchAllPages, getUnique } from './data.utils.ts'
import type { KeyValue } from '@/models/ref/data.ts'
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

describe('fetchAllPages', () => {
  function toItem(id: number) {
    return { id }
  }

  function makePage(sivu: number, sivuja: number, ...ids: number[]) {
    return { sivu, sivuja, data: ids.map(toItem), kokonaismaara: ids.length }
  }

  function servePages(pages: unknown[], maxCalls = 10) {
    const requested: number[] = []

    async function fetchPage(pageNumber: number) {
      assert.ok(requested.length < maxCalls, `fetchAllPages did not stop within ${maxCalls} pages`)
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

    assert.deepEqual(await fetchAllPages(fetchPage), [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 }
    ])
    assert.deepEqual(requested, [0, 1, 2])
  })

  it('accepts a single page numbered 0', async () => {
    const { requested, fetchPage } = servePages([makePage(0, 1, 1)])

    assert.deepEqual(await fetchAllPages(fetchPage), [{ id: 1 }])
    assert.deepEqual(requested, [0])
  })

  it('takes the page count from the first page', async () => {
    const { requested, fetchPage } = servePages([makePage(0, 2, 1), makePage(1, 5, 2)])

    assert.deepEqual(await fetchAllPages(fetchPage), [{ id: 1 }, { id: 2 }])
    assert.deepEqual(requested, [0, 1])
  })

  it('stops when a page has no sivuja', async () => {
    const { requested, fetchPage } = servePages([{ sivu: 0, data: [{ id: 1 }] }])

    assert.equal(await fetchAllPages(fetchPage), undefined)
    assert.deepEqual(requested, [0])
  })

  it('advances even when the server pins sivu at 0', async () => {
    let calls = 0

    async function fetchAlwaysPageZero() {
      assert.ok(++calls <= 10, 'fetchAllPages did not stop within 10 pages')
      return makePage(0, 3, calls)
    }

    const items = await fetchAllPages(fetchAlwaysPageZero)

    assert.equal(calls, 3)
    assert.deepEqual(items, [{ id: 1 }, { id: 2 }, { id: 3 }])
  })

  it('discards earlier pages when a later page fails', async () => {
    const { fetchPage } = servePages([makePage(0, 3, 1), undefined, makePage(2, 3, 3)])

    assert.equal(await fetchAllPages(fetchPage), undefined)
  })

  it('stops on an empty page', async () => {
    const { requested, fetchPage } = servePages([makePage(0, 2), makePage(1, 2, 1)])

    assert.equal(await fetchAllPages(fetchPage), undefined)
    assert.deepEqual(requested, [0])
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
