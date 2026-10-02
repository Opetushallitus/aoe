import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { createContainer, uploadFile } from './helpers/seedOaipmhMaterials'

// Padded past the backend's STREAM_FILESIZE_MIN (100000) so the download is redirected to streaming.
const VIDEO = Buffer.concat([
  readFileSync(path.join(__dirname, '../test-files/test-video.mp4')),
  Buffer.alloc(100_000)
])

test('videon Range-pyyntö palauttaa pyydetyn tavualueen', async ({ request }) => {
  const educationalMaterialId = await createContainer(request, `suoratoisto-${Date.now()}`)
  await uploadFile(request, educationalMaterialId, {
    name: 'test-video.mp4',
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

  const res = await request.get(`/api/v1/download/${filekey}`, {
    headers: { Range: 'bytes=100-199' }
  })

  expect(res.status()).toBe(206)
  expect(res.headers()['content-range']).toBe(`bytes 100-199/${VIDEO.length}`)
  expect(Buffer.compare(await res.body(), VIDEO.subarray(100, 200))).toBe(0)
})
