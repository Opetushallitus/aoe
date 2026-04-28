import { expect, test } from '@playwright/test'
import { Etusivu } from './pages/Etusivu'

const EXPECTED_RECORD = `
  <record>
    <header>
      <identifier>oai:demo.aoe.fi:{ID}-{TS}</identifier>
      <datestamp>{TS}</datestamp>
    </header>
    <metadata>
      <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:lrmi_fi="http://dublincore.org/dcx/lrmi-terms/1.1/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
        <dc:identifier>urn:nbn:fi:oerfi-{URN}</dc:identifier>
        <dc:identifier>https://demo.aoe.fi/#/materiaali/{ID}/{TS_MS}</dc:identifier>
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
          <lrmi_fi:name xml:lang="en">blank</lrmi_fi:name>
          <lrmi_fi:name xml:lang="fi">blank</lrmi_fi:name>
          <lrmi_fi:name xml:lang="sv">blank</lrmi_fi:name>
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

const isoSecondsZ = (date: Date): string => date.toISOString().replace(/\.\d+Z$/, 'Z')

const extractOurRecord = (body: string, materiaaliNimi: string): string => {
  const matches = body.match(/<record>(?:(?!<\/record>)[\s\S])*<\/record>/g) ?? []
  const ours = matches.filter((r) => r.includes(materiaaliNimi))
  if (ours.length !== 1) {
    throw new Error(
      `Expected exactly one record containing "${materiaaliNimi}", found ${ours.length}. ` +
        `Total records in response: ${matches.length}.`
    )
  }
  return ours[0]
}

const redact = (record: string): string => {
  return record
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
      /<dc:identifier>https:\/\/demo\.aoe\.fi\/#\/materiaali\/\d+\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z<\/dc:identifier>/g,
      '<dc:identifier>https://demo.aoe.fi/#/materiaali/{ID}/{TS_MS}</dc:identifier>'
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
}

test('OAI-PMH ListRecords returns the expected contract shape for a newly created materiaali', async ({
  page,
  request
}) => {
  const fromDate = isoSecondsZ(new Date(Date.now() - 60_000))

  const etusivu = Etusivu(page)
  await etusivu.goto()
  const omatMateriaalit = await etusivu.header.clickOmatMateriaalit()
  const uusi = await omatMateriaalit.luoUusiMateriaali()
  const materiaaliNimi = uusi.randomMateriaaliNimi()
  await uusi.taytaJaTallennaUusiMateriaali(materiaaliNimi, ['korkeakoulutus'], false)

  const untilDate = isoSecondsZ(new Date(Date.now() + 120_000))

  let body = ''
  await expect
    .poll(
      async () => {
        const res = await request.get(
          `/meta/v2/oaipmh?verb=ListRecords&from=${fromDate}&until=${untilDate}`
        )
        expect(res.status()).toBe(200)
        body = await res.text()
        return body.includes(materiaaliNimi)
      },
      { timeout: 30_000, intervals: [1_000, 2_000, 3_000] }
    )
    .toBe(true)

  const ourRecord = extractOurRecord(body, materiaaliNimi)
  const normalized = redact(ourRecord)
  const expected = EXPECTED_RECORD.replaceAll('{MATERIAALI_NIMI}', materiaaliNimi)

  expect(normalized).toBe(expected)
})
