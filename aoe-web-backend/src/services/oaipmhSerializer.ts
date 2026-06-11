import { XMLBuilder } from 'fast-xml-parser'

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  suppressEmptyNode: false,
  format: false
})

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'

export function buildXml(obj: unknown): string {
  return XML_DECLARATION + builder.build(obj)
}
