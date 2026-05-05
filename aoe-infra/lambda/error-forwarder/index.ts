import { SNSClient, PublishCommand, type PublishCommandInput } from '@aws-sdk/client-sns'
import type {
  CloudWatchLogsDecodedData,
  CloudWatchLogsEvent,
  CloudWatchLogsLogEvent
} from 'aws-lambda'
import { gunzipSync } from 'node:zlib'

type LogFields = Record<string, unknown>

type ErrorAlert = {
  environment: string
  service: string
  message: string
  log: LogFields
} & Record<string, unknown>

type SlackNotification = {
  version: '1.0'
  source: 'custom'
  content: {
    textType: 'client-markdown'
    title: string
    description: string
  }
  metadata: {
    threadId: string
    summary: string
  }
}

const MAX_FIELD_LENGTH = 4000
const MAX_INLINE_LENGTH = 500
const MAX_STACK_LENGTH = 3500

const environment = process.env.ENVIRONMENT || 'unknown'
const serviceName = process.env.SERVICE_NAME || 'web-backend'
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'eu-west-1'

export const handler = async (event: CloudWatchLogsEvent): Promise<void> => {
  const payload = decodeCloudWatchLogsPayload(event)

  if (payload.messageType === 'CONTROL_MESSAGE') {
    return
  }

  const alerts = payload.logEvents
    .map((logEvent) => toErrorAlert(payload, logEvent))
    .filter((alert): alert is ErrorAlert => alert !== undefined)

  for (const alert of alerts) {
    await publishAlert(alert)
  }
  console.info(`Published ${alerts.length} errors to SNS.`)
}

function decodeCloudWatchLogsPayload(event: CloudWatchLogsEvent): CloudWatchLogsDecodedData {
  const compressedPayload = Buffer.from(event.awslogs.data, 'base64')
  return JSON.parse(gunzipSync(compressedPayload).toString('utf8')) as CloudWatchLogsDecodedData
}

function toErrorAlert(
  payload: CloudWatchLogsDecodedData,
  logEvent: CloudWatchLogsLogEvent
): ErrorAlert | undefined {
  const parsedMessage = parseLogMessage(logEvent.message)

  if (parsedMessage.level !== 'error') {
    return undefined
  }

  const sanitizedLog = sanitizeValue(parsedMessage) as LogFields
  const timestamp = new Date(logEvent.timestamp).toISOString()

  return {
    environment,
    service: serviceName,
    timestamp,
    logGroup: payload.logGroup,
    logStream: payload.logStream,
    logEventId: logEvent.id,
    level: sanitizedLog.level,
    message: stringifyField(sanitizedLog.message) || logEvent.message,
    statusCode: sanitizedLog.statusCode,
    method: sanitizedLog.method,
    url: sanitizedLog.url,
    requestId: sanitizedLog.requestId,
    userAgent: sanitizedLog.userAgent,
    stack: sanitizedLog.stack,
    cause: sanitizedLog.cause,
    causeStack: sanitizedLog.causeStack,
    log: sanitizedLog
  }
}

function parseLogMessage(message: string): LogFields {
  try {
    const parsed = JSON.parse(message)
    return typeof parsed === 'object' && parsed !== null ? parsed : { message: parsed }
  } catch (_err) {
    return { level: 'error', message }
  }
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)])
    )
  }

  if (typeof value === 'string') {
    return truncate(value)
  }

  return value
}

function truncate(value: string, maxLength: number = MAX_FIELD_LENGTH): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength)}...[truncated]`
}

async function publishAlert(alert: ErrorAlert): Promise<void> {
  const topicArn = process.env.ERROR_TOPIC_ARN
  if (!topicArn) {
    console.warn('ERROR_TOPIC_ARN is not set; skipping error alert publish')
    return
  }

  const message: PublishCommandInput = {
    TopicArn: topicArn,
    Subject: truncateSubject(`[${environment}] ${serviceName} error`),
    Message: JSON.stringify(buildSlackNotification(alert), undefined, 2),
    MessageAttributes: {
      environment: {
        DataType: 'String',
        StringValue: environment
      },
      service: {
        DataType: 'String',
        StringValue: serviceName
      }
    }
  }

  const sns = new SNSClient({})
  await sns.send(new PublishCommand(message))
}

function buildSlackNotification(alert: ErrorAlert): SlackNotification {
  return {
    version: '1.0',
    source: 'custom',
    content: {
      textType: 'client-markdown',
      title: truncateSubject(`:warning: ${alert.environment} ${alert.service} error`),
      description: buildSlackDescription(alert)
    },
    metadata: {
      threadId: `${alert.environment}-${alert.service}-errors`,
      summary: truncate(safeInline(alert.message), MAX_INLINE_LENGTH)
    }
  }
}

function buildSlackDescription(alert: ErrorAlert): string {
  const lines = ['*Error:*', formatCodeBlock(alert.message)]
  const route = formatRoute(alert)
  const requestId = stringifyField(alert.requestId)
  const cloudWatchLogsUrl = buildCloudWatchLogsUrl(alert)

  if (route) {
    lines.push(`*Route:* \`${safeInline(route)}\``)
  }

  if (requestId) {
    lines.push(`*Request ID:* \`${safeInline(requestId)}\``)
  }

  if (cloudWatchLogsUrl) {
    lines.push(`CloudWatch: <${cloudWatchLogsUrl}|Open log stream>`)
  }

  return lines.join('\n')
}

function formatRoute(alert: ErrorAlert): string | undefined {
  const method = stringifyField(alert.method)
  const url = stringifyField(alert.url)

  if (method && url) {
    return `${method} ${url}`
  }

  return method || url
}

function formatCodeBlock(value: string): string {
  const formattedValue = truncate(normalizeStack(value), MAX_STACK_LENGTH).replace(/```/g, "'''")
  return `\`\`\`\n${formattedValue}\n\`\`\``
}

function buildCloudWatchLogsUrl(alert: ErrorAlert): string | undefined {
  const logGroup = stringifyField(alert.logGroup)
  const logStream = stringifyField(alert.logStream)

  if (!logGroup || !logStream) {
    return undefined
  }

  return [
    `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}`,
    '#logsV2:log-groups/log-group/',
    encodeCloudWatchLogsPath(logGroup),
    '/log-events/',
    encodeCloudWatchLogsPath(logStream)
  ].join('')
}

function encodeCloudWatchLogsPath(value: string): string {
  return encodeURIComponent(value).replace(/%/g, '$25')
}

function normalizeStack(value: string): string {
  return value
    .trim()
    .replace(/\s+at\s+/g, '\n    at ')
    .replace(/^\s+/, '')
}

function safeInline(value: string): string {
  return truncate(value, MAX_INLINE_LENGTH).replace(/`/g, "'").replace(/\s+/g, ' ').trim()
}

function stringifyField(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (value === undefined || value === null) {
    return undefined
  }

  return JSON.stringify(value)
}

function truncateSubject(subject: string): string {
  return subject.length <= 100 ? subject : subject.slice(0, 100)
}
