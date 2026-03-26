import { config } from '@/config'
import { TypeMaterialActivity, TypeSearchRequest } from '@aoe/services/analyticsService'
import { kafkaProducer } from '@resource/kafkaClient'
import * as log from '@util/winstonLogger'
import { Request, Response } from 'express'

let producerConnected = false

const ensureConnected = async (): Promise<void> => {
  if (!producerConnected) {
    await kafkaProducer.connect()
    producerConnected = true
  }
}

/**
 * Function to exclude some external requests from analytics data collection by User-Agent identifier.
 * @param {e.Request} req
 * @return {boolean}
 */
export const hasExcludedAgents = (req: Request): boolean => {
  const userAgent: string = req.headers['user-agent'] || ''
  const searchIDs: string[] = config.MESSAGE_QUEUE_OPTIONS.kafkaExcludedAgentIdentifiers
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

/**
 * Sends analytics data to Kafka for search requests and material activity.
 * @param req express.Request
 * @param res express.Response
 */
export async function publishAnalyticsEvent(req: Request, res?: Response) {
  if (!config.MESSAGE_QUEUE_OPTIONS.kafkaProducerEnabled || hasExcludedAgents(req)) {
    return undefined
  }

  try {
    await ensureConnected()

    if (req.url.includes('search')) {
      const message = buildSearchMessage(req)
      await kafkaProducer.send({
        topic: config.MESSAGE_QUEUE_OPTIONS.topicSearchRequests,
        messages: [{ value: JSON.stringify(message) }]
      })
      return message
    }

    if (req.url.includes('material') || req.url.includes('download')) {
      const message = buildActivityMessage(req, res)
      await kafkaProducer.send({
        topic: config.MESSAGE_QUEUE_OPTIONS.topicMaterialActivity,
        messages: [{ value: JSON.stringify(message) }]
      })
      return message
    }
  } catch (error) {
    log.error('Kafka message producer failed', error)
    producerConnected = false
  }

  return undefined
}
