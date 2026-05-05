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

const sns = new SNSClient({})

const topicArn = process.env.ERROR_TOPIC_ARN
const environment = process.env.ENVIRONMENT || 'unknown'
const serviceName = process.env.SERVICE_NAME || 'web-backend'
const maxFieldLength = 4000
const maxInlineLength = 500
const maxStackLength = 3500

export const handler = async (event: CloudWatchLogsEvent): Promise<void> => {
  const payload = decodeCloudWatchLogsPayload(event)
  console.log('Error forwarder got called', payload)

  if (payload.messageType === 'CONTROL_MESSAGE') {
    return
  }

  const alerts = payload.logEvents
    .map((logEvent) => toErrorAlert(payload, logEvent))
    .filter((alert): alert is ErrorAlert => alert !== undefined)

  let sentErrors = 0
  for (const alert of alerts) {
    await publishAlert(alert)
    sentErrors++
  }
  console.log(`Published ${sentErrors} errors to SNS.`)
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
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        shouldRedactKey(key) ? '[REDACTED]' : sanitizeValue(nestedValue)
      ])
    )
  }

  if (typeof value === 'string') {
    return truncate(redactSensitiveText(value))
  }

  return value
}

function shouldRedactKey(key: string): boolean {
  return /authorization|cookie|password|pass|secret|token|client_secret|jwt/i.test(key)
}

function truncate(value: string, maxLength: number = maxFieldLength): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength)}...[truncated]`
}

async function publishAlert(alert: ErrorAlert): Promise<void> {
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
      summary: truncate(safeInline(alert.message), maxInlineLength)
    }
  }
}

function buildSlackDescription(alert: ErrorAlert): string {
  const lines = [`*Error:* \`${safeInline(alert.message)}\``]
  const route = formatRoute(alert)
  const requestId = stringifyField(alert.requestId)
  const statusCode = stringifyField(alert.statusCode)
  const stack = stringifyField(alert.stack)
  const cause = stringifyField(alert.cause)
  const causeStack = stringifyField(alert.causeStack)

  if (route) {
    lines.push(`*Route:* \`${safeInline(route)}\``)
  }

  if (statusCode) {
    lines.push(`*Status:* \`${safeInline(statusCode)}\``)
  }

  if (requestId) {
    lines.push(`*Request ID:* \`${safeInline(requestId)}\``)
  }

  if (stack) {
    lines.push('', '*Stack:*', formatCodeBlock(stack))
  }

  if (cause) {
    lines.push('', '*Cause:*', formatCodeBlock(cause))
  }

  if (causeStack) {
    lines.push('', '*Cause stack:*', formatCodeBlock(causeStack))
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
  const redactedValue = truncate(redactSensitiveText(value), maxStackLength).replace(/```/g, "'''")
  return `\`\`\`\n${redactedValue}\n\`\`\``
}

function safeInline(value: string): string {
  return truncate(redactSensitiveText(value), maxInlineLength)
    .replace(/`/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function stringifyField(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return redactSensitiveText(value)
  }

  if (value === undefined || value === null) {
    return undefined
  }

  return redactSensitiveText(JSON.stringify(value))
}

function truncateSubject(subject: string): string {
  return subject.length <= 100 ? subject : subject.slice(0, 100)
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(/\b\d{6}[+-A]\d{3}[0-9A-Z]\b/gi, '[REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED]')
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, '$1 [REDACTED]')
    .replace(
      /\b(authorization|cookie|password|pass|secret|token|client_secret|jwt|hetu)\s*[=:]\s*[^\s&"'`]+/gi,
      '$1=[REDACTED]'
    )
}
