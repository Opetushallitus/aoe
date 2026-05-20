import { config } from '@/config'
import { TypeMaterialActivity, TypeSearchRequest } from '@aoe/services/analyticsService'
import { insertMaterialActivityEvent, insertSearchRequestEvent } from '@query/analyticsQueries'
import * as log from '@util/winstonLogger'
import { Request, Response } from 'express'

export const hasExcludedAgents = (req: Request): boolean => {
  const userAgent: string = req.headers['user-agent'] || ''
  const searchIDs: string[] = config.ANALYTICS_OPTIONS.excludedAgentIdentifiers
  const regexRule = new RegExp(searchIDs.join('|'), 'i')
  return regexRule.test(userAgent)
}

const buildSearchMessage = (req: Request): TypeSearchRequest => ({
  timestamp: req.body.timestamp ? req.body.timestamp : new Date(Date.now()).toISOString(),
  keywords: req.body.keywords,
  filters: req.body.filters
})

const buildActivityMessage = (req: Request, res?: Response): TypeMaterialActivity => {
  const message: TypeMaterialActivity = {
    timestamp: new Date(Date.now()).toISOString(),
    eduMaterialId: null,
    interaction: req.query.interaction as string
  }

  if (['view', 'edit', 'load'].includes(req.query.interaction as string)) {
    message.eduMaterialId = res?.locals.id
    message.metadata = {
      created: res?.locals.createdAt,
      updated: res?.locals.updatedAt,
      organizations: res?.locals.author
        ?.filter((obj: { organizationkey?: string }) => obj.organizationkey)
        .map((obj: { organizationkey: string }) => obj.organizationkey),
      educationalLevels: res?.locals.educationalLevels?.map(
        (obj: { educationallevelkey: string }) => obj.educationallevelkey
      ),
      educationalSubjects: res?.locals.educationalAlignment?.map(
        (obj: { objectkey: string }) => obj.objectkey
      )
    }
  }

  return message
}

export async function publishAnalyticsEvent(req: Request, res?: Response) {
  if (hasExcludedAgents(req)) {
    return undefined
  }

  if (req.url.includes('search')) {
    const message = buildSearchMessage(req)
    insertSearchRequestEvent(message).catch((err) =>
      log.error('PostgreSQL search request insert failed', err)
    )
    return message
  }

  if (req.url.includes('material') || req.url.includes('download')) {
    const message = buildActivityMessage(req, res)
    insertMaterialActivityEvent(message).catch((err) =>
      log.error('PostgreSQL material activity insert failed', err)
    )
    return message
  }

  return undefined
}
