import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { educationalMaterialMetadataSchema } from './educationalMaterialMetadataSchema.ts'

// A material row id ends up interpolated into a bigint column. Anything that is not a
// real id has to be rejected here, while the request is still cheap to reject: once the
// value reaches updateMaterial() it aborts the whole transaction and the user only sees
// "Tallennus epäonnistui".
describe('educationalMaterialMetadataSchema material ids', () => {
  it('rejects a fileDetails entry whose id is null', () => {
    const result = educationalMaterialMetadataSchema.safeParse({
      fileDetails: [{ id: null, displayName: { fi: 'Eläimet' }, language: 'fi', link: null }]
    })

    assert.equal(result.success, false)
  })

  it('rejects a materials entry whose materialId is null', () => {
    const result = educationalMaterialMetadataSchema.safeParse({
      materials: [{ materialId: null, priority: 20, attachments: [] }]
    })

    assert.equal(result.success, false)
  })

  it('rejects an attachment id that is null', () => {
    const result = educationalMaterialMetadataSchema.safeParse({
      materials: [{ materialId: 19703, priority: 0, attachments: [null] }]
    })

    assert.equal(result.success, false)
  })

  it('accepts ids sent as numbers, as GET serialises them', () => {
    const result = educationalMaterialMetadataSchema.safeParse({
      fileDetails: [{ id: 19703, displayName: { fi: 'Eläinretki' }, language: 'fi' }],
      materials: [{ materialId: 19703, priority: 0, attachments: [21434] }]
    })

    assert.equal(result.success, true)
    assert.equal(result.data?.fileDetails?.[0].id, '19703')
    assert.equal(result.data?.materials?.[0].materialId, '19703')
    assert.deepEqual(result.data?.materials?.[0].attachments, ['21434'])
  })

  it('accepts ids sent as strings', () => {
    const result = educationalMaterialMetadataSchema.safeParse({
      materials: [{ materialId: '19703', priority: 0 }]
    })

    assert.equal(result.success, true)
    assert.equal(result.data?.materials?.[0].materialId, '19703')
  })
})
