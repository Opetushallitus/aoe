import { XMLParser } from 'fast-xml-parser'

const oaiXmlParser = new XMLParser({
  ignoreAttributes: false,
  attributesGroupName: '$',
  attributeNamePrefix: '',
  textNodeName: '_',
  trimValues: true,
  parseTagValue: false
})

export type XmlNode = {
  $?: Record<string, string>
  _?: string
  [child: string]: unknown
}

export const parseXml = (xml: string): XmlNode => oaiXmlParser.parse(xml)

export const isXmlNode = (value: unknown): value is XmlNode =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const childNodes = (node: XmlNode | null | undefined, name: string): XmlNode[] => {
  const value = node?.[name]
  if (Array.isArray(value)) {
    return value.filter(isXmlNode)
  }
  if (isXmlNode(value)) {
    return [value]
  }
  return []
}

export const textValues = (node: XmlNode | null | undefined, name: string): string[] => {
  const value = node?.[name]
  if (value == null) {
    return []
  }
  const arr = Array.isArray(value) ? value : [value]
  return arr.map((v) => (typeof v === 'string' ? v : isXmlNode(v) ? (v._ ?? '') : ''))
}

export const firstChild = (node: XmlNode | null | undefined, name: string): XmlNode | undefined =>
  childNodes(node, name)[0]

export const envelope = (parsed: XmlNode): XmlNode => {
  const root = parsed['OAI-PMH']
  if (!isXmlNode(root)) {
    throw new Error('OAI-PMH root element missing from response')
  }
  return root
}

export const attrs = (node: XmlNode | undefined): Record<string, string> => node?.$ || {}

export const text = (node: unknown): string => {
  if (typeof node === 'string') {
    return node
  }
  if (Array.isArray(node)) {
    return text(node[0])
  }
  if (isXmlNode(node) && typeof node._ === 'string') {
    return node._
  }
  return ''
}

export const getVerbNode = (parsed: XmlNode, verb: string): XmlNode | null =>
  firstChild(envelope(parsed), verb) ?? null

export const getRecordNodes = (verbNode: XmlNode | null): XmlNode[] =>
  childNodes(verbNode, 'record')

export type ResumptionToken = { completeListSize: number; cursor: number; value: string }

export const getResumptionToken = (verbNode: XmlNode | null): ResumptionToken | null => {
  const token = firstChild(verbNode, 'resumptionToken')
  if (!token) {
    return null
  }

  const tokenAttrs = attrs(token)
  if (!tokenAttrs.completeListSize || !tokenAttrs.cursor) {
    return null
  }

  return {
    completeListSize: Number(tokenAttrs.completeListSize),
    cursor: Number(tokenAttrs.cursor),
    value: text(token)
  }
}

export type OaiHeader = XmlNode & { identifier?: string; $?: { status?: string } }
export type OaiTitle = string | { _?: string }
export type OaiRecord = XmlNode & {
  header?: OaiHeader
  metadata?: { 'oai_dc:dc'?: { 'dc:title'?: OaiTitle | OaiTitle[] } }
}

export const parseOaiRecords = (bodies: string[]): OaiRecord[] =>
  bodies.flatMap((body) => {
    const verbNode = getVerbNode(parseXml(body), 'ListRecords')
    if (!verbNode) {
      return []
    }
    const record: unknown = verbNode.record
    if (!record) {
      return []
    }
    const records = Array.isArray(record)
      ? record.filter(isXmlNode)
      : isXmlNode(record)
        ? [record]
        : []
    return records as OaiRecord[]
  })

export const titleText = (t: OaiTitle): string => (typeof t === 'string' ? t : (t._ ?? ''))

export const recordTitles = (record: OaiRecord): string[] => {
  const titles = record.metadata?.['oai_dc:dc']?.['dc:title']
  if (!titles) {
    return []
  }
  return (Array.isArray(titles) ? titles : [titles]).map(titleText)
}

export const recordIdentifier = (record: OaiRecord): string => record.header?.identifier ?? ''
