import { AoeMetadata } from '@/models/oaipmh'
import { toOaiDate } from '@services/oaipmhSerializer'

const OAI_DC_ATTRS = {
  '@_xmlns:oai_dc': 'http://www.openarchives.org/OAI/2.0/oai_dc/',
  '@_xmlns:dc': 'http://purl.org/dc/elements/1.1/',
  '@_xmlns:lrmi_fi': 'http://dublincore.org/dcx/lrmi-terms/1.1/',
  '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  '@_xsi:schemaLocation':
    'http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd'
}

export type LrmiRecord = {
  deleted: boolean
  identifier: string
  datestamp: string
  dc: Record<string, unknown>
}

const isExpired = (s: string | null | undefined): boolean => {
  if (!s) {
    return false
  }
  return new Date(s) < new Date()
}

const compact = (obj: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null))

const buildAuthors = (authors: AoeMetadata['author']): Record<string, unknown> | undefined => {
  const relevant = (authors ?? []).filter((a) => a.authorname !== '' || a.organization !== '')
  if (relevant.length === 0) {
    return undefined
  }

  const persons: Record<string, unknown>[] = []
  const orgs: Record<string, unknown>[] = []

  for (const a of relevant) {
    if (a.authorname === '') {
      orgs.push({ 'lrmi_fi:legalName': a.organization })
    } else {
      persons.push(
        compact({
          'lrmi_fi:name': a.authorname,
          'lrmi_fi:affiliation': a.organization === '' ? undefined : a.organization
        })
      )
    }
  }

  return compact({
    'lrmi_fi:person': persons.length > 0 ? persons : undefined,
    'lrmi_fi:organization': orgs.length > 0 ? orgs : undefined
  })
}

const buildMaterial = (
  m: NonNullable<AoeMetadata['materials']>[number]
): Record<string, unknown> => {
  const names = (m.materialdisplayname ?? [])
    .filter((n) => n.displayname && n.language)
    .map((n) => ({ '@_xml:lang': n.language, '#text': n.displayname }))

  const isLink = m.link && m.link.trim()
  const mainUrl = isLink ? m.link : m.filepath

  const urls: unknown[] = []
  if (mainUrl) {
    urls.push(mainUrl)
  }
  if (!isLink && m.pdfpath) {
    urls.push({ '@_format': 'application/pdf', '#text': m.pdfpath })
  }

  const format = m.mimetype && m.mimetype.trim() ? m.mimetype : isLink ? 'text/html' : undefined

  const filesize = m.filesize != null ? Number(m.filesize) : undefined

  return compact({
    'lrmi_fi:name': names.length > 0 ? names : undefined,
    'lrmi_fi:url': urls.length === 1 ? urls[0] : urls.length > 1 ? urls : undefined,
    'lrmi_fi:position': m.priority ?? undefined,
    'lrmi_fi:format': format,
    'lrmi_fi:filesize': filesize,
    'lrmi_fi:inLanguage': m.language && m.language.trim() ? m.language : undefined
  })
}

const isLearningResourceType = (
  alignmenttype: string,
  learningResourceTypes: readonly string[]
): boolean => learningResourceTypes.some((t) => t.toLowerCase() === alignmenttype.toLowerCase())

const buildLearningResource = (
  educationallevel: AoeMetadata['educationallevel'],
  educationaluse: AoeMetadata['educationaluse'],
  alignmentobject: AoeMetadata['alignmentobject'],
  learningResourceTypes: readonly string[]
): Record<string, unknown> | undefined => {
  const levels = (educationallevel ?? []).filter((e) => e.value).map((e) => e.value)
  const uses = (educationaluse ?? []).filter((e) => e.value).map((e) => e.value)

  const learningAlignments = (alignmentobject ?? []).filter((a) =>
    isLearningResourceType(a.alignmenttype, learningResourceTypes)
  )

  const educationalAlignments = learningAlignments
    .filter((a) => a.alignmenttype.toLowerCase() === 'educationalsubject')
    .map((a) =>
      compact({
        'lrmi_fi:educationalSubject': a.targetname,
        'lrmi_fi:educationalFramework': a.educationalframework || undefined
      })
    )

  const othersByType: Record<string, string[]> = {}
  for (const a of learningAlignments.filter(
    (a) => a.alignmenttype.toLowerCase() !== 'educationalsubject'
  )) {
    const key = `lrmi_fi:${a.alignmenttype}`
    othersByType[key] = [...(othersByType[key] ?? []), a.targetname]
  }

  const result = compact({
    'lrmi_fi:educationalLevel': levels.length > 0 ? levels : undefined,
    'lrmi_fi:educationalUse': uses.length > 0 ? uses : undefined,
    'lrmi_fi:educationalAlignment':
      educationalAlignments.length > 0 ? educationalAlignments : undefined,
    ...othersByType
  })

  return Object.keys(result).length > 0 ? result : undefined
}

const buildAlignmentObjects = (
  alignmentobject: AoeMetadata['alignmentobject'],
  learningResourceTypes: readonly string[]
): Record<string, unknown>[] | undefined => {
  const result = (alignmentobject ?? [])
    .filter((a) => !isLearningResourceType(a.alignmenttype, learningResourceTypes))
    .map((a) =>
      compact({
        'lrmi_fi:alignmentType': a.alignmenttype,
        'lrmi_fi:targetName': a.targetname,
        'lrmi_fi:targetUrl': a.targeturl ?? undefined,
        'lrmi_fi:educationalFramework': a.educationalframework || undefined
      })
    )
  return result.length > 0 ? result : undefined
}

export function buildLrmiRecord(
  meta: AoeMetadata,
  opts: {
    repositoryIdentifier: string
    learningResourceTypes: readonly string[]
    allVersions: boolean
  }
): LrmiRecord {
  const { repositoryIdentifier, learningResourceTypes, allVersions } = opts
  const deleted = meta.obsoleted !== 0 || isExpired(meta.expires)

  const publishedAtStr = toOaiDate(meta.urnpublishedat) ?? ''
  const baseIdentifier = `oai:${repositoryIdentifier}:${meta.id}`

  const identifier = allVersions ? `${baseIdentifier}-${publishedAtStr}` : baseIdentifier

  const datestamp = allVersions ? publishedAtStr : (toOaiDate(meta.createdat) ?? '')

  if (deleted && !allVersions) {
    return {
      deleted,
      identifier,
      datestamp,
      dc: { ...OAI_DC_ATTRS }
    }
  }

  const titles = (meta.materialname ?? [])
    .filter((t) => t.materialname)
    .map((t) => ({ '@_xml:lang': t.language, '#text': t.materialname }))

  const descriptions = (meta.materialdescription ?? [])
    .filter((d) => d.description)
    .map((d) => ({ '@_xml:lang': d.language, '#text': d.description }))

  const thumbnail =
    meta.thumbnail?.filepath && meta.thumbnail?.mimetype
      ? { '@_format': meta.thumbnail.mimetype, '#text': meta.thumbnail.filepath }
      : undefined

  const descriptionItems: unknown[] = [...descriptions, ...(thumbnail ? [thumbnail] : [])]

  const identifiers: string[] = [
    ...(meta.urn ? [meta.urn] : []),
    ...(meta.aoeUrl ? [meta.aoeUrl] : [])
  ]

  const publishers = (meta.publisher ?? []).map((p) => p.name).filter(Boolean)
  const types = (meta.learningresourcetype ?? []).map((l) => l.value).filter(Boolean)
  const authors = buildAuthors(meta.author)
  const materials = (meta.materials ?? []).map(buildMaterial)

  const abouts = (meta.keyword ?? [])
    .filter((k) => k.value && k.keywordkey)
    .map((k) => ({
      'lrmi_fi:thing': {
        'lrmi_fi:name': k.value,
        'lrmi_fi:identifier': `https:${k.keywordkey}`
      }
    }))

  const audiences = (meta.educationalaudience ?? [])
    .filter((e) => e.educationalrole)
    .map((e) => ({ 'lrmi_fi:educationalRole': e.educationalrole }))

  const accessibilityFeatures = (meta.accessibilityfeature ?? [])
    .map((a) => a.value)
    .filter(Boolean)

  const accessibilityHazards = (meta.accessibilityhazard ?? []).map((a) => a.value).filter(Boolean)

  const isBasedon = (meta.isbasedon ?? [])
    .filter((i) => i.materialname && i.url)
    .map((i) => {
      const authorNames = (i.author ?? []).map((a) => a.authorname).filter(Boolean)
      return compact({
        'lrmi_fi:url': i.url,
        'lrmi_fi:name': i.materialname,
        'lrmi_fi:author': authorNames.length > 0 ? authorNames : undefined
      })
    })

  const inLanguages = [
    ...new Set(
      (meta.materials ?? [])
        .map((m) => m.language)
        .filter((l): l is string => !!l && l.trim() !== '')
    )
  ]

  const learningResource = buildLearningResource(
    meta.educationallevel,
    meta.educationaluse,
    meta.alignmentobject,
    learningResourceTypes
  )

  const alignmentObjects = buildAlignmentObjects(meta.alignmentobject, learningResourceTypes)

  const dc = compact({
    ...OAI_DC_ATTRS,
    'dc:identifier': identifiers.length > 0 ? identifiers : undefined,
    'dc:title': titles.length > 0 ? titles : undefined,
    'dc:date': toOaiDate(meta.createdat),
    'dc:description': descriptionItems.length > 0 ? descriptionItems : undefined,
    'dc:rights': meta.licensecode ?? undefined,
    'dc:publisher': publishers.length > 0 ? publishers : undefined,
    'dc:type': types.length > 0 ? types : undefined,
    'dc:valid': toOaiDate(meta.expires),
    'lrmi_fi:dateCreated': toOaiDate(meta.createdat),
    'lrmi_fi:dateModified': toOaiDate(meta.updatedat),
    'lrmi_fi:timeRequired':
      meta.timerequired && meta.timerequired.trim() ? meta.timerequired : undefined,
    'lrmi_fi:author': authors,
    'lrmi_fi:about': abouts.length > 0 ? abouts : undefined,
    'lrmi_fi:material': materials.length > 0 ? materials : undefined,
    'lrmi_fi:educationalAudience': audiences.length > 0 ? audiences : undefined,
    'lrmi_fi:accessibilityFeature':
      accessibilityFeatures.length > 0 ? accessibilityFeatures : undefined,
    'lrmi_fi:accessibilityHazard':
      accessibilityHazards.length > 0 ? accessibilityHazards : undefined,
    'lrmi_fi:isBasedOn': isBasedon.length > 0 ? isBasedon : undefined,
    'lrmi_fi:inLanguage': inLanguages.length > 0 ? inLanguages : undefined,
    'lrmi_fi:learningResource': learningResource,
    'lrmi_fi:alignmentObject': alignmentObjects
  })

  return { deleted, identifier, datestamp, dc }
}
