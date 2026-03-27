// @ts-nocheck
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getUnique } from './data.utils.ts'
import type { KeyValue } from '../models/data.ts'
import type { AlignmentObjectExtended } from '../models/alignment-object-extended.ts'

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
