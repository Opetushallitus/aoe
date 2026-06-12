import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, request as playwrightRequest } from '@playwright/test'
import { type OaiRecord, parseOaiRecords, recordIdentifier, recordTitles } from './oaipmh.utils'

const FILE_NAME = 'blank.pdf'
const FILE_LANGUAGE = 'fi'
const FILE_DISPLAY_NAME = { fi: 'blank', sv: 'blank', en: 'blank' }
const SEED_NAME_PREFIX = 'oaipmh-seed'

export type SeededOaiPmhWindow = {
  basic: SearchSeedMaterial[]
  rich: SearchSeedMaterial[]
  archived: SearchSeedMaterial[]
}

type SearchSeedMaterialType = 'basic' | 'rich' | 'archived'
type SearchSeedMaterial = { id: number; name: string } & (
  | {
      type: 'basic' | 'archived'
    }
  | {
      type: 'rich'
      updatedName: string
    }
)

// Where the seed setup persists the seeded window so every (parallel) worker can
// read the same window without re-seeding. Sibling to the auth storageState file.
export const SEED_WINDOW_PATH = path.join(__dirname, '../../.auth/oaipmh-seed.json')

export const SEED_FROM = '2024-01-01T00:00:00Z'
export const SEED_UNTIL = '2099-12-31T23:59:59Z'
export const SEEDED_COUNT = 12

const getSeedName = (
  index: number,
  type: string,
  ...additionalIdentifier: (string | undefined)[]
): string => {
  return `${SEED_NAME_PREFIX}-${[type, ...additionalIdentifier].filter((i) => !!i).join('-')}-${String(index).padStart(2, '0')}`
}

const buildPayload = (
  type: SearchSeedMaterialType,
  materialId: number,
  index: number,
  additionalIdentifier?: string
) => {
  const seedName = getSeedName(index, type, additionalIdentifier)
  const payload = {
    name: { fi: seedName, sv: seedName, en: seedName },
    description: { fi: '', sv: '', en: '' },
    keywords: [{ key: 'http://www.yso.fi/onto/yso/p12371', value: 'PDF' }],
    authors: [{ author: 'Tester, Testi', organization: { key: '', value: '' } }],
    learningResourceTypes: [{ key: 'teksti', value: 'teksti' }],
    educationalRoles: [],
    educationalUses: [],
    educationalLevels: [{ key: 'korkeakoulutus', value: 'korkeakoulutus' }],
    suitsAllEarlyChildhoodSubjects: false,
    suitsAllPrePrimarySubjects: false,
    suitsAllBasicStudySubjects: false,
    suitsAllUpperSecondarySubjects: false,
    suitsAllUpperSecondarySubjectsNew: false,
    suitsAllVocationalDegrees: false,
    suitsAllSelfMotivatedSubjects: false,
    suitsAllBranches: false,
    accessibilityFeatures: [],
    accessibilityHazards: [],
    timeRequired: '',
    publisher: [],
    license: 'CCBY4.0',
    isBasedOn: { externals: [] },
    isVersioned: true,
    materials: [{ materialId, priority: 0, attachments: [] }],
    fileDetails: [{ id: materialId, displayName: FILE_DISPLAY_NAME, language: FILE_LANGUAGE }],
    attachmentDetails: [],
    alignmentObjects: []
  }

  if (type === 'rich') {
    return {
      ...payload,
      authors: [
        {
          author: 'Tester, Testi',
          organization: { key: 'Opetushallitus', value: 'Opetushallitus' }
        }
      ],
      educationalRoles: [{ key: 'Oppija', value: 'Oppija' }],
      educationalUses: [{ key: 'Kurssimateriaali', value: 'Kurssimateriaali' }],
      accessibilityFeatures: [
        { key: 'tekstitys', value: 'tekstitys' },
        { key: 'selkokieli', value: 'selkokieli' }
      ],
      accessibilityHazards: [{ key: 'ei äänihaittaa', value: 'ei äänihaittaa' }],
      alignmentObjects: [
        {
          key: 'Metsätiede',
          source: 'branchesOfScience',
          alignmentType: 'educationalSubject',
          targetName: 'Metsätiede'
        }
      ],
      isBasedOn: {
        externals: [
          { author: ['Lähde Tekijä'], url: 'https://source.example.com', name: 'Lähdemateriaali' }
        ]
      }
    }
  }

  return payload
}

export const collectBodies = async (
  api: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  endpoint: string,
  from: string,
  until: string
): Promise<string[]> => {
  const bodies: string[] = []
  let nextToken: string | undefined

  do {
    const params = new URLSearchParams({
      verb: 'ListRecords',
      metadataPrefix: 'oai_dc',
      from,
      until
    })
    if (nextToken) {
      params.set('resumptionToken', nextToken)
    }

    const res = await api.get(`${endpoint}?${params.toString()}`)
    expect(res.status()).toBe(200)
    const body = await res.text()
    bodies.push(body)

    nextToken =
      body.match(/<resumptionToken[^>]*>(.*?)<\/resumptionToken>/s)?.[1]?.trim() || undefined
  } while (nextToken)

  return bodies
}

const searchSeedMaterialByName = async (
  api: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  type: SearchSeedMaterialType,
  index: number
): Promise<SearchSeedMaterial | null> => {
  const name = getSeedName(index, type)
  const searchName = type === 'rich' ? getSeedName(index, type, 'updated') : name
  const res = await api.post('/api/v2/search', {
    data: {
      keywords: searchName,
      size: 100
    }
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  const results = Array.isArray(body?.results) ? body.results : []

  for (const result of results) {
    const names = Array.isArray(result?.materialName) ? result.materialName : []
    const exactName = names.find(
      (entry: { materialname?: string }) =>
        typeof entry?.materialname === 'string' && entry.materialname === searchName
    )
    if (exactName && typeof result?.id === 'number') {
      if (type === 'rich') {
        return { type: 'rich', id: result.id, name, updatedName: searchName }
      }
      return { type, id: result.id, name }
    }
  }

  return null
}

type ContentUploader = (
  api: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  educationalMaterialId: number
) => Promise<number>

const createContainer = async (
  api: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  name: string
): Promise<number> => {
  const res = await api.post('/api/v1/material/file', {
    multipart: {
      name: JSON.stringify({
        fi: name,
        sv: name,
        en: name
      })
    }
  })
  expect(res.status()).toBe(200)
  return Number((await res.json()).id)
}

const uploadFile =
  (fileBuffer: Buffer): ContentUploader =>
  async (api, educationalMaterialId) => {
    const res = await api.post(`/api/v2/material/file/${educationalMaterialId}/upload`, {
      multipart: {
        file: { name: FILE_NAME, mimeType: 'application/pdf', buffer: fileBuffer },
        fileDetails: JSON.stringify({
          displayName: FILE_DISPLAY_NAME,
          language: FILE_LANGUAGE,
          priority: 0
        })
      }
    })
    expect(res.status()).toBe(200)
    return Number((await res.json()).material?.[0]?.id)
  }

const publishMaterial = async (
  api: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  educationalMaterialId: number,
  payload: ReturnType<typeof buildPayload>
): Promise<void> => {
  const res = await api.put(`/api/v1/material/${educationalMaterialId}`, { data: payload })
  if (res.status() !== 200) {
    throw new Error(`Publish failed with ${res.status()}: ${await res.text()}`)
  }
}

const createMaterial = async (
  api: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  uploadContent: ContentUploader,
  type: SearchSeedMaterialType,
  index: number
): Promise<{
  educationalMaterialId: number
  materialId: number
  name: string
  updatedName?: string
}> => {
  const name = getSeedName(index, type)
  const educationalMaterialId = await createContainer(api, name)
  const materialId = await uploadContent(api, educationalMaterialId)
  await publishMaterial(api, educationalMaterialId, buildPayload(type, materialId, index))

  if (type === 'rich') {
    const updatedName = getSeedName(index, type, 'updated')
    await new Promise((resolve) => setTimeout(resolve, 1_000))
    await publishMaterial(
      api,
      educationalMaterialId,
      buildPayload(type, materialId, index, 'updated')
    )
    return { educationalMaterialId, materialId, name, updatedName }
  }

  return { educationalMaterialId, materialId, name }
}

const ensureMaterial = async (
  api: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  uploadContent: ContentUploader,
  type: SearchSeedMaterialType,
  index: number
): Promise<SearchSeedMaterial> => {
  const existing = await searchSeedMaterialByName(api, type, index)
  if (existing) {
    if (type === 'archived') {
      const del = await api.delete(`/api/v1/material/${existing.id}`)
      expect([204, 404]).toContain(del.status())
    }
    return existing
  }

  const { educationalMaterialId, name, updatedName } = await createMaterial(
    api,
    uploadContent,
    type,
    index
  )

  if (type === 'archived') {
    const del = await api.delete(`/api/v1/material/${educationalMaterialId}`)
    expect(del.status()).toBe(204)
  }

  if (type === 'rich') {
    if (!updatedName) {
      throw new Error(
        `createMaterial did not return updatedName for rich material at index ${index}`
      )
    }
    return { type: 'rich', id: educationalMaterialId, name, updatedName }
  }
  return { type, id: educationalMaterialId, name }
}

const waitForHarvest = async (
  api: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
  endpoint: string,
  check: (records: OaiRecord[]) => boolean,
  onTimeout: (records: OaiRecord[]) => string
): Promise<void> => {
  const deadline = Date.now() + 60_000
  let lastRecords: OaiRecord[] = []

  while (Date.now() < deadline) {
    lastRecords = parseOaiRecords(await collectBodies(api, endpoint, SEED_FROM, SEED_UNTIL))
    if (check(lastRecords)) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000))
  }

  throw new Error(onTimeout(lastRecords))
}

export const seedOaipmhMaterials = async (
  opts: { baseUrl?: string; storageStatePath?: string } = {}
): Promise<SeededOaiPmhWindow> => {
  const baseUrl = opts.baseUrl ?? 'https://demo.aoe.fi'
  const storageState = opts.storageStatePath ?? './.auth/user.json'
  const filePath = path.join(__dirname, '../../test-files', FILE_NAME)
  const fileBuffer = readFileSync(filePath)
  const api = await playwrightRequest.newContext({
    baseURL: baseUrl,
    ignoreHTTPSErrors: true,
    storageState
  })

  const materials: SearchSeedMaterial[] = []
  const richMaterials: SearchSeedMaterial[] = []
  const archivedMaterials: SearchSeedMaterial[] = []

  try {
    for (let i = 0; i < SEEDED_COUNT; i++) {
      materials.push(await ensureMaterial(api, uploadFile(fileBuffer), 'basic', i))
      richMaterials.push(await ensureMaterial(api, uploadFile(fileBuffer), 'rich', i))
      archivedMaterials.push(await ensureMaterial(api, uploadFile(fileBuffer), 'archived', i))
    }

    const window: SeededOaiPmhWindow = {
      basic: materials,
      rich: richMaterials,
      archived: archivedMaterials
    }

    const harvestNames = [
      ...materials.map((m) => m.name),
      ...richMaterials.map((r) => (r.type === 'rich' ? r.updatedName : r.name))
    ]
    await waitForHarvest(
      api,
      '/meta/v2/oaipmh',
      (records) =>
        harvestNames.every((name) => records.some((r) => recordTitles(r).includes(name))),
      (records) => {
        const found = new Set(records.flatMap(recordTitles))
        return `Seeded materials did not appear in OAI-PMH within 60s. Missing names: ${harvestNames.filter((name) => !found.has(name)).join(', ')}`
      }
    )

    const repoId = new URL(baseUrl).hostname
    const archivedId = archivedMaterials[0].id
    const archivedIdentifierPrefix = `oai:${repoId}:${archivedId}`
    await waitForHarvest(
      api,
      '/meta/oaipmh',
      (records) =>
        records.some(
          (r) =>
            recordIdentifier(r).startsWith(archivedIdentifierPrefix) &&
            r.header?.$?.status === 'deleted'
        ),
      () => `Archived seed material did not appear as deleted in OAI-PMH within 60s: ${archivedId}`
    )
    return window
  } finally {
    await api.dispose()
  }
}
