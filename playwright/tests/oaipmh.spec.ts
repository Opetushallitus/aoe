import { readFileSync } from 'node:fs'
import { type APIRequestContext, expect, test } from '@playwright/test'
import {
  collectBodies,
  SEED_FROM,
  SEED_UNTIL,
  SEED_WINDOW_PATH,
  type SeededOaiPmhWindow
} from './helpers/seedOaipmhMaterials'
import {
  attrs,
  childNodes,
  envelope,
  firstChild,
  getRecordNodes,
  getResumptionToken,
  getVerbNode,
  parseXml,
  text,
  textValues,
  type XmlNode
} from './helpers/oaipmh.utils'

const V1 = '/meta/oaipmh'
const V2 = '/meta/v2/oaipmh'
const V1_BASE_URL = 'https://demo.aoe.fi/meta/oaipmh'
const V2_BASE_URL = 'https://demo.aoe.fi/meta/v2/oaipmh'
const REPO_ID = 'demo.aoe.fi'
const PAGE_SIZE = 20

const EMPTY_FROM = '2000-01-01T00:00:00Z'
const EMPTY_UNTIL = '2000-01-02T00:00:00Z'

const listUrl = (
  endpoint: string,
  verb: 'ListRecords' | 'ListIdentifiers',
  opts: {
    from?: string
    until?: string
    resumptionToken?: string | number
  } = {}
): string => {
  if (opts.resumptionToken !== undefined) {
    const params = new URLSearchParams({
      verb,
      resumptionToken: String(opts.resumptionToken)
    })
    return `${endpoint}?${params.toString()}`
  }
  const params = new URLSearchParams({ verb, metadataPrefix: 'oai_dc' })
  if (opts.from) {
    params.set('from', opts.from)
  }
  if (opts.until) {
    params.set('until', opts.until)
  }
  return `${endpoint}?${params.toString()}`
}

const getXml = async (request: APIRequestContext, url: string): Promise<string> => {
  const res = await request.get(url)
  expect(res.status()).toBe(200)
  return res.text()
}

const expectEnvelope = (
  parsed: XmlNode,
  opts: { verb: string; baseUrl: string; metadataPrefix?: boolean }
): void => {
  const root = envelope(parsed)
  expect(root).toBeDefined()
  expect(attrs(root).xmlns).toBe('http://www.openarchives.org/OAI/2.0/')
  expect(attrs(root)['xmlns:xsi']).toBe('http://www.w3.org/2001/XMLSchema-instance')
  expect(attrs(root)['xsi:schemaLocation']).toBe(
    'http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd'
  )
  expect(text(root.responseDate)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
  expect(root.request).toBeUndefined()
  const requestNode = firstChild(root, 'aoe_request')
  expect(requestNode).toBeDefined()
  expect(attrs(requestNode).verb).toBe(opts.verb)
  expect(attrs(requestNode).metadataPrefix).toBe(opts.metadataPrefix ? 'oai_dc' : undefined)
  expect(text(requestNode)).toBe(opts.baseUrl)
  expect(getVerbNode(parsed, opts.verb)).toBeDefined()
}

const OAI_DC_ATTRS = {
  'xmlns:oai_dc': 'http://www.openarchives.org/OAI/2.0/oai_dc/',
  'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
  'xmlns:lrmi_fi': 'http://dublincore.org/dcx/lrmi-terms/1.1/',
  'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  'xsi:schemaLocation':
    'http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd'
}

const EXPECTED_BASIC_RECORD = `
  <record>
    <header>
      <identifier>oai:demo.aoe.fi:{ID}-{TS}</identifier>
      <datestamp>{TS}</datestamp>
    </header>
    <metadata>
      <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:lrmi_fi="http://dublincore.org/dcx/lrmi-terms/1.1/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
        <dc:identifier>urn:nbn:fi:oerfi-{URN}</dc:identifier>
        <dc:identifier>https://demo.aoe.fi/materiaali/{ID}/{TS_MS}</dc:identifier>
        <dc:title xml:lang="fi">{MATERIAALI_NIMI}</dc:title>
        <dc:title xml:lang="sv">{MATERIAALI_NIMI}</dc:title>
        <dc:title xml:lang="en">{MATERIAALI_NIMI}</dc:title>
        <dc:date>{TS}</dc:date>
        <dc:rights>CCBY4.0</dc:rights>
        <dc:type>teksti</dc:type>
        <lrmi_fi:dateCreated>{TS}</lrmi_fi:dateCreated>
        <lrmi_fi:dateModified>{TS}</lrmi_fi:dateModified>
        <lrmi_fi:author>
          <lrmi_fi:person>
            <lrmi_fi:name>Tester, Testi</lrmi_fi:name>
          </lrmi_fi:person>
        </lrmi_fi:author>
        <lrmi_fi:about>
          <lrmi_fi:thing>
            <lrmi_fi:name>PDF</lrmi_fi:name>
            <lrmi_fi:identifier>https://www.yso.fi/onto/yso/p12371</lrmi_fi:identifier>
          </lrmi_fi:thing>
        </lrmi_fi:about>
        <lrmi_fi:material>
          <lrmi_fi:name xml:lang="sv">blank</lrmi_fi:name>
          <lrmi_fi:name xml:lang="en">blank</lrmi_fi:name>
          <lrmi_fi:name xml:lang="fi">blank</lrmi_fi:name>
          <lrmi_fi:url>https://demo.aoe.fi/api/v1/download/file/blank-{FILEKEY}.pdf</lrmi_fi:url>
          <lrmi_fi:position>0</lrmi_fi:position>
          <lrmi_fi:format>application/pdf</lrmi_fi:format>
          <lrmi_fi:filesize>4911</lrmi_fi:filesize>
          <lrmi_fi:inLanguage>fi</lrmi_fi:inLanguage>
        </lrmi_fi:material>
        <lrmi_fi:inLanguage>fi</lrmi_fi:inLanguage>
        <lrmi_fi:learningResource>
          <lrmi_fi:educationalLevel>korkeakoulutus</lrmi_fi:educationalLevel>
        </lrmi_fi:learningResource>
      </oai_dc:dc>
    </metadata>
  </record>
`
  .replace(/>\s+</g, '><')
  .trim()

const sortSiblingRun = (xml: string, runRe: RegExp, itemRe: RegExp): string =>
  xml.replace(runRe, (run) => (run.match(itemRe) ?? []).sort().join(''))

const normalizeNonDeterministicOrder = (xml: string): string => {
  const names = sortSiblingRun(
    xml,
    /(?:<lrmi_fi:name xml:lang="[a-z]{2}">[^<]*<\/lrmi_fi:name>)+/g,
    /<lrmi_fi:name xml:lang="[a-z]{2}">[^<]*<\/lrmi_fi:name>/g
  )
  return sortSiblingRun(
    names,
    /(?:<lrmi_fi:inLanguage>[^<]*<\/lrmi_fi:inLanguage>)+/g,
    /<lrmi_fi:inLanguage>[^<]*<\/lrmi_fi:inLanguage>/g
  )
}

const extractOurRecord = (
  body: string,
  materiaaliNimi: string,
  { pickLatest = false }: { pickLatest?: boolean } = {}
): string => {
  const matches = body.match(/<record(?:\s[^>]*)?>(?:(?!<\/record>)[\s\S])*<\/record>/g) ?? []
  const ours = matches.filter((r) => r.includes(materiaaliNimi))
  if (pickLatest && ours.length > 1) {
    return ours.sort((a, b) => {
      const tsA = a.match(/<datestamp>([^<]+)<\/datestamp>/)?.[1] ?? ''
      const tsB = b.match(/<datestamp>([^<]+)<\/datestamp>/)?.[1] ?? ''
      return tsB.localeCompare(tsA)
    })[0]
  }
  if (ours.length !== 1) {
    throw new Error(
      `Expected exactly one record containing "${materiaaliNimi}", found ${ours.length}. Total records: ${matches.length}.`
    )
  }
  return ours[0]
}

const redact = (record: string): string =>
  record
    .replace(
      /<identifier>oai:demo\.aoe\.fi:\d+-\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z<\/identifier>/g,
      '<identifier>oai:demo.aoe.fi:{ID}-{TS}</identifier>'
    )
    .replace(
      /<datestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z<\/datestamp>/g,
      '<datestamp>{TS}</datestamp>'
    )
    .replace(
      /<dc:identifier>urn:nbn:fi:oerfi-[\d_]+<\/dc:identifier>/g,
      '<dc:identifier>urn:nbn:fi:oerfi-{URN}</dc:identifier>'
    )
    .replace(
      /<dc:identifier>https:\/\/demo\.aoe\.fi\/materiaali\/\d+\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z<\/dc:identifier>/g,
      '<dc:identifier>https://demo.aoe.fi/materiaali/{ID}/{TS_MS}</dc:identifier>'
    )
    .replace(/<dc:date>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z<\/dc:date>/g, '<dc:date>{TS}</dc:date>')
    .replace(
      /<lrmi_fi:dateCreated>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z<\/lrmi_fi:dateCreated>/g,
      '<lrmi_fi:dateCreated>{TS}</lrmi_fi:dateCreated>'
    )
    .replace(
      /<lrmi_fi:dateModified>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z<\/lrmi_fi:dateModified>/g,
      '<lrmi_fi:dateModified>{TS}</lrmi_fi:dateModified>'
    )
    .replace(/blank-\d+\.pdf/g, 'blank-{FILEKEY}.pdf')

const expectRecordMatches = (
  body: string,
  nimi: string,
  template: string,
  opts: { pickLatest?: boolean } = {}
): void => {
  const actual = normalizeNonDeterministicOrder(redact(extractOurRecord(body, nimi, opts)))
  const expected = normalizeNonDeterministicOrder(template.replaceAll('{MATERIAALI_NIMI}', nimi))
  expect(actual).toBe(expected)
}

const collectAllRecords = async (
  request: APIRequestContext,
  fromDate: string,
  untilDate: string,
  endpoint: string
): Promise<XmlNode[]> => {
  const bodies = await collectBodies(request, endpoint, fromDate, untilDate)
  return bodies.flatMap((body) => getRecordNodes(getVerbNode(parseXml(body), 'ListRecords')))
}

const harvestRecordsUntil = async (
  request: APIRequestContext,
  fromDate: string,
  untilDate: string,
  predicate: (records: XmlNode[]) => boolean,
  endpoint: string
): Promise<XmlNode[]> => {
  let records: XmlNode[] = []
  await expect
    .poll(
      async () => {
        records = await collectAllRecords(request, fromDate, untilDate, endpoint)
        return predicate(records)
      },
      { timeout: 60_000, intervals: [1_000, 2_000, 3_000] }
    )
    .toBe(true)
  return records
}

const findRecordsForMaterialId = (records: XmlNode[], materialId: number): XmlNode[] => {
  const prefix = `oai:${REPO_ID}:${materialId}`
  return records.filter((rec) => {
    const ident = text(firstChild(rec, 'header')?.identifier)
    return ident === prefix || ident.startsWith(`${prefix}-`)
  })
}

let seededWindow: SeededOaiPmhWindow

test.beforeAll(() => {
  seededWindow = JSON.parse(readFileSync(SEED_WINDOW_PATH, 'utf8'))
})

test('OAI-PMH v1', async ({ request }) => {
  test.setTimeout(120_000)

  const richMaterial = seededWindow.rich[0]
  if (richMaterial.type !== 'rich') {
    throw new Error('Seed material at rich[0] is not of type rich')
  }

  await test.step('Identify', async () => {
    const parsed = parseXml(await getXml(request, `${V1}?verb=Identify`))
    expectEnvelope(parsed, { verb: 'Identify', baseUrl: V1_BASE_URL })

    const identify = getVerbNode(parsed, 'Identify')
    expect(text(identify?.repositoryName)).toBe('OPH - AOE Open Metadata Interface')
    expect(text(identify?.baseURL)).toBe(V1_BASE_URL)
    expect(text(identify?.protocolVersion)).toBe('2.0')
    expect(text(identify?.adminEmail)).toBe('oppimateriaalivaranto@aoe.fi')
    expect(text(identify?.earliestDatestamp)).toBe('2019-12-11T11:43:18Z')
    expect(text(identify?.deletedRecord)).toBe('persistent')
    expect(text(identify?.granularity)).toBe('YYYY-MM-DDThh:mm:ssZ')
    expect(text(identify?.compression)).toBe('')

    const oaiIdentifier = firstChild(firstChild(identify, 'description'), 'oai-identifier')
    expect(oaiIdentifier).toBeDefined()
    expect(attrs(oaiIdentifier).xmlns).toBe('http://www.openarchives.org/OAI/2.0/oai-identifier')
    expect(attrs(oaiIdentifier)['xmlns:xsi']).toBe('http://www.w3.org/2001/XMLSchema-instance')
    expect(attrs(oaiIdentifier)['xsi:schemaLocation']).toBe(
      'http://www.openarchives.org/OAI/2.0/oai-identifier http://www.openarchives.org/OAI/2.0/oai-identifier.xsd'
    )
    expect(text(oaiIdentifier?.scheme)).toBe('oai')
    expect(text(oaiIdentifier?.repositoryIdentifier)).toBe(REPO_ID)
    expect(text(oaiIdentifier?.delimeter)).toBe(':')
    expect(text(oaiIdentifier?.sampleIdentifier)).toBe('oai:aoe.fi:1')
  })

  await test.step('ListRecords seeded window: envelope, pagination and record shape', async () => {
    const parsed = parseXml(
      await getXml(request, listUrl(V1, 'ListRecords', { from: SEED_FROM, until: SEED_UNTIL }))
    )
    expectEnvelope(parsed, {
      verb: 'ListRecords',
      baseUrl: V1_BASE_URL,
      metadataPrefix: true
    })

    const listRecords = getVerbNode(parsed, 'ListRecords')
    const token = getResumptionToken(listRecords)
    const recs = getRecordNodes(listRecords)

    expect(recs.length).toBe(PAGE_SIZE)
    expect(token).not.toBeNull()
    expect(token?.completeListSize).toBeGreaterThanOrEqual(25)
    expect(token?.cursor).toBe(0)
    expect(token?.value).toBe('1')

    for (const rec of recs) {
      const header = firstChild(rec, 'header')
      expect(header).toBeDefined()
      expect(text(header?.identifier)).toMatch(new RegExp(`^oai:${REPO_ID}:\\d+$`))
      expect(text(header?.datestamp)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      if (attrs(header).status === 'deleted') {
        expect(rec.metadata).toBeUndefined()
      } else {
        const dc = firstChild(firstChild(rec, 'metadata'), 'oai_dc:dc')
        expect(dc).toBeDefined()
        expect(attrs(dc)).toMatchObject(OAI_DC_ATTRS)
      }
    }

    const lastPageIndex = Math.ceil((token?.completeListSize ?? 0) / PAGE_SIZE) - 1
    const lastPage = parseXml(
      await getXml(
        request,
        listUrl(V1, 'ListRecords', {
          from: SEED_FROM,
          until: SEED_UNTIL,
          resumptionToken: lastPageIndex
        })
      )
    )
    const lastToken = getResumptionToken(getVerbNode(lastPage, 'ListRecords'))
    const lastRecords = getRecordNodes(getVerbNode(lastPage, 'ListRecords'))
    expect(lastRecords.length).toBeGreaterThan(0)
    expect(lastRecords.length).toBeLessThanOrEqual(PAGE_SIZE)
    expect(lastToken).not.toBeNull()
    expect(lastToken?.cursor).toBe(lastPageIndex * PAGE_SIZE)
    expect(lastToken?.value).toBe('')
  })

  await test.step('ListRecords empty window', async () => {
    const parsed = parseXml(
      await getXml(request, listUrl(V1, 'ListRecords', { from: EMPTY_FROM, until: EMPTY_UNTIL }))
    )
    expectEnvelope(parsed, {
      verb: 'ListRecords',
      baseUrl: V1_BASE_URL,
      metadataPrefix: true
    })
    const listRecords = getVerbNode(parsed, 'ListRecords')
    expect(listRecords).toBeDefined()
    expect(getRecordNodes(listRecords).length).toBe(0)
    expect(getResumptionToken(listRecords)).toBeNull()
  })

  await test.step('ListRecords archived material returns deleted header without metadata', async () => {
    const { id } = seededWindow.archived[0]
    const records = await collectAllRecords(request, SEED_FROM, SEED_UNTIL, V1)
    const archivedRecord = records.find(
      (rec) => text(firstChild(rec, 'header')?.identifier) === `oai:${REPO_ID}:${id}`
    )
    if (!archivedRecord) {
      throw new Error(`Archived record not found for material id ${id}`)
    }
    expect(attrs(firstChild(archivedRecord, 'header')).status).toBe('deleted')
    expect(archivedRecord.metadata).toBeUndefined()
  })

  await test.step('ListRecords version semantics: returns latest version only', async () => {
    const { id, updatedName } = richMaterial
    const allRecords = await harvestRecordsUntil(
      request,
      SEED_FROM,
      SEED_UNTIL,
      (recs) => findRecordsForMaterialId(recs, id).length === 1,
      V1
    )
    const materialRecords = findRecordsForMaterialId(allRecords, id)
    expect(materialRecords).toHaveLength(1)
    const titles = childNodes(
      firstChild(firstChild(materialRecords[0], 'metadata'), 'oai_dc:dc'),
      'dc:title'
    ).map((t) => text(t))
    expect(titles).toContain(updatedName)
  })

  await test.step('ListIdentifiers seeded window: headers and pagination semantics', async () => {
    const parsed = parseXml(
      await getXml(request, listUrl(V1, 'ListIdentifiers', { from: SEED_FROM, until: SEED_UNTIL }))
    )
    expectEnvelope(parsed, {
      verb: 'ListIdentifiers',
      baseUrl: V1_BASE_URL,
      metadataPrefix: true
    })

    const listIdentifiers = getVerbNode(parsed, 'ListIdentifiers')
    const records = getRecordNodes(listIdentifiers)
    const token = getResumptionToken(listIdentifiers)

    expect(records.length).toBe(PAGE_SIZE)
    expect(token).not.toBeNull()
    expect(token?.cursor).toBe(0)
    expect(token?.completeListSize).toBeGreaterThanOrEqual(25)

    for (const record of records) {
      const header = firstChild(record, 'header')
      expect(header).toBeDefined()
      expect(text(header.identifier)).toMatch(/^oai:demo\.aoe\.fi:\d+$/)
      expect(text(header.datestamp)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      expect(record.metadata).toBeUndefined()
    }

    const lastPageIndex = Math.ceil((token?.completeListSize ?? 0) / PAGE_SIZE) - 1
    const lastPage = parseXml(
      await getXml(
        request,
        listUrl(V1, 'ListIdentifiers', {
          from: SEED_FROM,
          until: SEED_UNTIL,
          resumptionToken: lastPageIndex
        })
      )
    )
    const lastList = getVerbNode(lastPage, 'ListIdentifiers')
    const lastToken = getResumptionToken(lastList)
    const lastRecords = getRecordNodes(lastList)
    expect(lastRecords.length).toBeGreaterThan(0)
    expect(lastRecords.length).toBeLessThanOrEqual(PAGE_SIZE)
    expect(lastToken).not.toBeNull()
    expect(lastToken?.cursor).toBe(lastPageIndex * PAGE_SIZE)
    expect(lastToken?.value).toBe('')
  })

  await test.step('ListIdentifiers empty window', async () => {
    const parsed = parseXml(
      await getXml(
        request,
        listUrl(V1, 'ListIdentifiers', {
          from: EMPTY_FROM,
          until: EMPTY_UNTIL
        })
      )
    )
    expectEnvelope(parsed, {
      verb: 'ListIdentifiers',
      baseUrl: V1_BASE_URL,
      metadataPrefix: true
    })
    const listIdentifiers = getVerbNode(parsed, 'ListIdentifiers')
    expect(listIdentifiers).toBeDefined()
    expect(getRecordNodes(listIdentifiers).length).toBe(0)
    expect(getResumptionToken(listIdentifiers)).toBeNull()
  })
})

test('OAI-PMH v2', async ({ request }) => {
  test.setTimeout(120_000)

  const richMaterial = seededWindow.rich[0]
  if (richMaterial.type !== 'rich') {
    throw new Error('Seed material at rich[0] is not of type rich')
  }

  await test.step('Identify', async () => {
    const parsed = parseXml(await getXml(request, `${V2}?verb=Identify`))
    expectEnvelope(parsed, { verb: 'Identify', baseUrl: V2_BASE_URL })

    const identify = getVerbNode(parsed, 'Identify')
    expect(text(identify?.repositoryName)).toBe('OPH - AOE Open Metadata Interface')
    expect(text(identify?.baseURL)).toBe(V2_BASE_URL)
    expect(text(identify?.protocolVersion)).toBe('2.0')
    expect(text(identify?.adminEmail)).toBe('oppimateriaalivaranto@aoe.fi')
    expect(text(identify?.earliestDatestamp)).toBe('2019-12-11T11:43:18Z')
    expect(text(identify?.deletedRecord)).toBe('persistent')
    expect(text(identify?.granularity)).toBe('YYYY-MM-DDThh:mm:ssZ')
    expect(text(identify?.compression)).toBe('')

    const oaiIdentifier = firstChild(firstChild(identify, 'description'), 'oai-identifier')
    expect(oaiIdentifier).toBeDefined()
    expect(attrs(oaiIdentifier).xmlns).toBe('http://www.openarchives.org/OAI/2.0/oai-identifier')
    expect(attrs(oaiIdentifier)['xmlns:xsi']).toBe('http://www.w3.org/2001/XMLSchema-instance')
    expect(attrs(oaiIdentifier)['xsi:schemaLocation']).toBe(
      'http://www.openarchives.org/OAI/2.0/oai-identifier http://www.openarchives.org/OAI/2.0/oai-identifier.xsd'
    )
    expect(text(oaiIdentifier?.scheme)).toBe('oai')
    expect(text(oaiIdentifier?.repositoryIdentifier)).toBe(REPO_ID)
    expect(text(oaiIdentifier?.delimeter)).toBe(':')
    expect(text(oaiIdentifier?.sampleIdentifier)).toBe('oai:aoe.fi:1')
  })

  await test.step('ListRecords seeded window: envelope and record shape', async () => {
    const parsed = parseXml(
      await getXml(request, listUrl(V2, 'ListRecords', { from: SEED_FROM, until: SEED_UNTIL }))
    )
    expectEnvelope(parsed, {
      verb: 'ListRecords',
      baseUrl: V2_BASE_URL,
      metadataPrefix: true
    })

    const listRecords = getVerbNode(parsed, 'ListRecords')
    const token = getResumptionToken(listRecords)
    const recs = getRecordNodes(listRecords)

    expect(recs.length).toBe(PAGE_SIZE)
    expect(token).not.toBeNull()

    for (const rec of recs) {
      const header = firstChild(rec, 'header')
      expect(header).toBeDefined()
      expect(text(header?.identifier)).toMatch(
        new RegExp(`^oai:${REPO_ID}:\\d+-\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`)
      )
      expect(text(header?.datestamp)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      if (attrs(header).status === 'deleted') {
        expect(rec.metadata).toBeUndefined()
      } else {
        const dc = firstChild(firstChild(rec, 'metadata'), 'oai_dc:dc')
        expect(dc).toBeDefined()
        expect(attrs(dc)).toMatchObject(OAI_DC_ATTRS)
      }
    }
  })

  await test.step('ListRecords seeded material record structures', async () => {
    const bodies = await collectBodies(request, V2, SEED_FROM, SEED_UNTIL)
    expectRecordMatches(bodies.join('\n'), seededWindow.basic[0].name, EXPECTED_BASIC_RECORD, {
      pickLatest: true
    })

    const allRecords = bodies.flatMap((body) =>
      getRecordNodes(getVerbNode(parseXml(body), 'ListRecords'))
    )
    const richRecord = findRecordsForMaterialId(allRecords, richMaterial.id).find((rec) =>
      childNodes(firstChild(firstChild(rec, 'metadata'), 'oai_dc:dc'), 'dc:title').some(
        (t) => text(t) === richMaterial.updatedName
      )
    )
    if (!richRecord) {
      throw new Error(`Rich record with title "${richMaterial.updatedName}" not found`)
    }

    const dc = firstChild(firstChild(richRecord, 'metadata'), 'oai_dc:dc')
    expect(
      text(firstChild(firstChild(dc, 'lrmi_fi:author'), 'lrmi_fi:person')?.['lrmi_fi:affiliation'])
    ).toBe('Opetushallitus')
    expect(text(firstChild(dc, 'lrmi_fi:educationalAudience')?.['lrmi_fi:educationalRole'])).toBe(
      'Oppija'
    )
    expect(textValues(dc, 'lrmi_fi:accessibilityFeature')).toContain('tekstitys')
    expect(textValues(dc, 'lrmi_fi:accessibilityFeature')).toContain('selkokieli')
    expect(textValues(dc, 'lrmi_fi:accessibilityHazard')).toContain('ei äänihaittaa')
    expect(
      text(
        firstChild(firstChild(dc, 'lrmi_fi:learningResource'), 'lrmi_fi:educationalAlignment')?.[
          'lrmi_fi:educationalSubject'
        ]
      )
    ).toBe('Metsätiede')
    const isBasedOn = firstChild(dc, 'lrmi_fi:isBasedOn')
    expect(text(isBasedOn?.['lrmi_fi:url'])).toBe('https://source.example.com')
    expect(text(isBasedOn?.['lrmi_fi:name'])).toBe('Lähdemateriaali')
    expect(textValues(isBasedOn, 'lrmi_fi:author')).toContain('Lähde Tekijä')
  })

  await test.step('ListRecords version semantics: returns both published versions', async () => {
    const { id, updatedName } = richMaterial
    const allRecords = await harvestRecordsUntil(
      request,
      SEED_FROM,
      SEED_UNTIL,
      (recs) => findRecordsForMaterialId(recs, id).length === 2,
      V2
    )
    const materialRecords = findRecordsForMaterialId(allRecords, id)
    expect(materialRecords).toHaveLength(2)
    const identifiers = materialRecords.map((rec) => text(firstChild(rec, 'header')?.identifier))
    expect(new Set(identifiers).size).toBe(2)
    for (const rec of materialRecords) {
      const titles = childNodes(
        firstChild(firstChild(rec, 'metadata'), 'oai_dc:dc'),
        'dc:title'
      ).map((t) => text(t))
      expect(titles).toContain(updatedName)
    }
  })

  await test.step('ListIdentifiers seeded window: headers and pagination semantics', async () => {
    const parsed = parseXml(
      await getXml(request, listUrl(V2, 'ListIdentifiers', { from: SEED_FROM, until: SEED_UNTIL }))
    )
    expectEnvelope(parsed, {
      verb: 'ListIdentifiers',
      baseUrl: V2_BASE_URL,
      metadataPrefix: true
    })

    const listIdentifiers = getVerbNode(parsed, 'ListIdentifiers')
    const records = getRecordNodes(listIdentifiers)
    const token = getResumptionToken(listIdentifiers)

    expect(records.length).toBe(PAGE_SIZE)
    expect(token).not.toBeNull()
    expect(token?.cursor).toBe(0)
    expect(token?.completeListSize).toBeGreaterThanOrEqual(25)

    for (const record of records) {
      const header = firstChild(record, 'header')
      expect(header).toBeDefined()
      expect(text(header.identifier)).toMatch(
        /^oai:demo\.aoe\.fi:\d+-\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
      )
      expect(text(header.datestamp)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      expect(record.metadata).toBeUndefined()
    }

    const lastPageIndex = Math.ceil((token?.completeListSize ?? 0) / PAGE_SIZE) - 1
    const lastPage = parseXml(
      await getXml(
        request,
        listUrl(V2, 'ListIdentifiers', {
          from: SEED_FROM,
          until: SEED_UNTIL,
          resumptionToken: lastPageIndex
        })
      )
    )
    const lastList = getVerbNode(lastPage, 'ListIdentifiers')
    const lastToken = getResumptionToken(lastList)
    const lastRecords = getRecordNodes(lastList)
    expect(lastRecords.length).toBeGreaterThan(0)
    expect(lastRecords.length).toBeLessThanOrEqual(PAGE_SIZE)
    expect(lastToken).not.toBeNull()
    expect(lastToken?.cursor).toBe(lastPageIndex * PAGE_SIZE)
    expect(lastToken?.value).toBe('')
  })

  await test.step('ListIdentifiers empty window', async () => {
    const parsed = parseXml(
      await getXml(
        request,
        listUrl(V2, 'ListIdentifiers', {
          from: EMPTY_FROM,
          until: EMPTY_UNTIL
        })
      )
    )
    expectEnvelope(parsed, {
      verb: 'ListIdentifiers',
      baseUrl: V2_BASE_URL,
      metadataPrefix: true
    })
    const listIdentifiers = getVerbNode(parsed, 'ListIdentifiers')
    expect(listIdentifiers).toBeDefined()
    expect(getRecordNodes(listIdentifiers).length).toBe(0)
    expect(getResumptionToken(listIdentifiers)).toBeNull()
  })
})

test('OAI-PMH unknown verb returns HTTP 200 with empty body', async ({ request }) => {
  const res = await request.get(`${V1}?verb=Frobnicate`)
  expect(res.status()).toBe(200)
  expect(await res.text()).toBe('')
})
