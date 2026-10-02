import { readFileSync } from 'node:fs'
import path from 'node:path'
import { type APIRequestContext, expect, test } from '@playwright/test'
import { createContainer, uploadFile } from './helpers/seedOaipmhMaterials'

const VIDEO = Buffer.concat([
  readFileSync(path.join(__dirname, '../test-files/test-video.mp4')),
  Buffer.alloc(100_000)
])

const uploadVideo = async (request: APIRequestContext, name: string): Promise<string> => {
  const educationalMaterialId = await createContainer(request, `suoratoisto-${Date.now()}`)
  await uploadFile(request, educationalMaterialId, {
    name,
    mimeType: 'video/mp4',
    buffer: VIDEO
  })

  let filekey: string | undefined
  await expect
    .poll(async () => {
      const res = await request.get(`/api/v1/material/${educationalMaterialId}`)
      filekey = (await res.json()).materials?.[0]?.filekey ?? undefined
      return filekey
    })
    .toBeTruthy()
  if (!filekey) {
    throw new Error(`Uploaded video has no filekey: educationalMaterialId=${educationalMaterialId}`)
  }
  return filekey
}

test('videon Range-pyyntö palauttaa pyydetyn tavualueen', async ({ request }) => {
  const filekey = await uploadVideo(request, 'suoratoisto-206.mp4')

  const res = await request.get(`/api/v1/download/${filekey}`, {
    headers: { Range: 'bytes=100-199' }
  })

  expect(res.status()).toBe(206)
  expect(res.headers()['content-range']).toBe(`bytes 100-199/${VIDEO.length}`)
  expect(Buffer.compare(await res.body(), VIDEO.subarray(100, 200))).toBe(0)
})

test('tiedoston lopun ylittävä Range-pyyntö palauttaa 416', async ({ request }) => {
  const filekey = await uploadVideo(request, 'suoratoisto-416.mp4')

  const res = await request.get(`/api/v1/download/${filekey}`, {
    headers: { Range: `bytes=${VIDEO.length}-` }
  })

  expect(res.status()).toBe(416)
  expect(res.headers()['content-range']).toBe(`bytes */${VIDEO.length}`)
})
