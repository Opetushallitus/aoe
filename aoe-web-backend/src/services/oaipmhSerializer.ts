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

export function toOaiDate(value: Date): string
export function toOaiDate(value: string | null | undefined): string | undefined
export function toOaiDate(value: string | Date | null | undefined): string | undefined {
  if (!value) {
    return undefined
  }
  const iso = value instanceof Date ? value.toISOString() : value
  return `${iso.slice(0, 19)}Z`
}
