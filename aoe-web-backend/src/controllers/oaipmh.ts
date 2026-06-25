import { config } from '@/config'
import { OaiPmhParamsSchema } from '@/models/oaipmh'
import { fetchMaterialMetadata } from '@query/oaipmh'
import { buildLrmiRecord } from '@services/lrmiTransformer'
import { buildXml, toOaiDate } from '@services/oaipmhSerializer'
import * as log from '@util/winstonLogger'
import { Request, Response } from 'express'

const buildEnvelope = (
  verb: string,
  identifier: string,
  metadataPrefix: string,
  baseUrl: string,
  verbNode: Record<string, unknown>
): Record<string, unknown> => ({
  'OAI-PMH': {
    '@_xmlns': 'http://www.openarchives.org/OAI/2.0/',
    '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    '@_xsi:schemaLocation':
      'http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd',
    responseDate: toOaiDate(new Date()),
    aoe_request: {
      ...(verb && { '@_verb': verb }),
      ...(metadataPrefix && { '@_metadataPrefix': metadataPrefix }),
      ...(identifier && { '@_identifier': identifier }),
      '#text': baseUrl
    },
    [verb]: verbNode
  }
})

const buildIdentifyNode = (baseUrl: string): Record<string, unknown> => {
  const { identify, oaiIdentifier } = config.aoe
  return {
    repositoryName: identify.repositoryName,
    baseURL: baseUrl,
    protocolVersion: identify.protocolVersion,
    adminEmail: identify.adminEmail,
    earliestDatestamp: identify.earliestDatestamp,
    deletedRecord: identify.deletedRecord,
    granularity: identify.granularity,
    compression: identify.compression ?? '',
    description: {
      'oai-identifier': {
        '@_xmlns': 'http://www.openarchives.org/OAI/2.0/oai-identifier',
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xsi:schemaLocation':
          'http://www.openarchives.org/OAI/2.0/oai-identifier http://www.openarchives.org/OAI/2.0/oai-identifier.xsd',
        scheme: oaiIdentifier.scheme,
        repositoryIdentifier: oaiIdentifier.repositoryIdentifier,
        delimeter: oaiIdentifier.delimeter,
        sampleIdentifier: oaiIdentifier.sampleIdentifier
      }
    }
  }
}

const buildRecordNode = (
  lrmi: ReturnType<typeof buildLrmiRecord>,
  allVersions: boolean,
  identifiersOnly: boolean
): Record<string, unknown> => {
  const deleted = !allVersions && lrmi.deleted
  const includeMetadata = !identifiersOnly && !deleted
  return {
    header: {
      ...(deleted && { '@_status': 'deleted' }),
      identifier: lrmi.identifier,
      datestamp: lrmi.datestamp
    },
    ...(includeMetadata && { metadata: { 'oai_dc:dc': lrmi.dc } })
  }
}

const buildListVerbNode = async (
  params: ReturnType<typeof OaiPmhParamsSchema.parse>,
  allVersions: boolean,
  identifiersOnly: boolean
): Promise<Record<string, unknown>> => {
  const { from, until, resumptionToken } = params
  const { repositoryIdentifier } = config.aoe.oaiIdentifier
  const learningResourceTypes = config.aoe.metadata.lrmiLearningResourceTypes
  const pageSize = config.aoe.request.pageSize

  const dateMin = from || config.aoe.identify.earliestDatestamp
  const dateMax = until || toOaiDate(new Date())

  const result = await fetchMaterialMetadata({
    dateMin,
    dateMax,
    materialPerPage: pageSize,
    pageNumber: resumptionToken,
    allVersions
  })

  const records = result.content.map((meta) => {
    const lrmi = buildLrmiRecord(meta, { repositoryIdentifier, learningResourceTypes, allVersions })
    return buildRecordNode(lrmi, allVersions, identifiersOnly)
  })

  if (records.length === 0) {
    return {}
  }

  const nextPage = resumptionToken + 1
  return {
    record: records,
    resumptionToken: {
      '@_completeListSize': result.completeListSize,
      '@_cursor': resumptionToken * pageSize,
      '#text': nextPage < result.pageTotal ? String(nextPage) : ''
    }
  }
}

export const oaipmhHandler =
  (allVersions: boolean) =>
  async (req: Request, res: Response): Promise<void> => {
    const baseUrl = allVersions ? config.aoe.identify.baseUrlV2 : config.aoe.identify.baseUrl
    const parseResult = OaiPmhParamsSchema.safeParse(req.query)
    if (parseResult.success === false) {
      log.warn('Invalid query when calling OAIPMH API')
      res.status(400).send()
      return
    }
    const params = parseResult.data
    const verb = params.verb.toUpperCase()

    log.debug(
      `OAI-PMH request: verb=${params.verb} allVersions=${allVersions} from=${params.from} until=${params.until} resumptionToken=${params.resumptionToken} identifier=${params.identifier}`
    )

    try {
      let verbNode: Record<string, unknown>

      switch (verb) {
        case 'IDENTIFY':
          verbNode = buildIdentifyNode(baseUrl)
          break
        case 'LISTRECORDS':
        case 'GETRECORDS':
          verbNode = await buildListVerbNode(params, allVersions, false)
          break
        case 'LISTIDENTIFIERS':
          verbNode = await buildListVerbNode(params, allVersions, true)
          break
        default:
          res.status(200).send('')
          return
      }

      res
        .status(200)
        .type('application/xml')
        .send(
          buildXml(
            buildEnvelope(params.verb, params.identifier, params.metadataPrefix, baseUrl, verbNode)
          )
        )
    } catch (err) {
      log.error('OAI-PMH handler error', err)
      res.status(500).send('')
    }
  }
