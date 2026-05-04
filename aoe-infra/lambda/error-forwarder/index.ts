import { SNSClient, PublishCommand, type PublishCommandInput } from '@aws-sdk/client-sns'
import type {
  CloudWatchLogsDecodedData,
  CloudWatchLogsEvent,
  CloudWatchLogsLogEvent
} from 'aws-lambda'
import { gunzipSync } from 'node:zlib'

type LogFields = Record<string, unknown>

type ErrorAlert = {
  version: '1'
  source: 'aoe.web-backend.error'
  environment: string
  service: string
  message: string
  log: LogFields
} & Record<string, unknown>

type Audience = 'slack' | 'pagerduty'

const sns = new SNSClient({})

const topicArn = process.env.ERROR_TOPIC_ARN
const environment = process.env.ENVIRONMENT || 'unknown'
const serviceName = process.env.SERVICE_NAME || 'web-backend'
const audiences: Audience[] = []
const maxFieldLength = 4000

export const handler = async (event: CloudWatchLogsEvent): Promise<void> => {
  const payload = decodeCloudWatchLogsPayload(event)
  console.info('Error forwarder got called', payload)

  if (payload.messageType === 'CONTROL_MESSAGE') {
    return
  }

  const alerts = payload.logEvents
    .map((logEvent) => toErrorAlert(payload, logEvent))
    .filter((alert): alert is ErrorAlert => alert !== null)

  for (const alert of alerts) {
    await publishAlert(alert)
  }
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
    version: '1',
    source: 'aoe.web-backend.error',
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
    return truncate(value)
  }

  return value
}

function shouldRedactKey(key: string): boolean {
  return /authorization|cookie|password|pass|secret|token|client_secret|jwt/i.test(key)
}

function truncate(value: string): string {
  if (value.length <= maxFieldLength) {
    return value
  }

  return `${value.slice(0, maxFieldLength)}...[truncated]`
}

async function publishAlert(alert: ErrorAlert): Promise<void> {
  if (!topicArn) {
    console.warn('ERROR_TOPIC_ARN is not set; skipping error alert publish')
    return
  }

  const message: PublishCommandInput = {
    TopicArn: topicArn,
    Subject: truncateSubject(`[${environment}] ${serviceName} error`),
    Message: JSON.stringify(alert, null, 2),
    MessageAttributes: {
      environment: {
        DataType: 'String',
        StringValue: environment
      },
      service: {
        DataType: 'String',
        StringValue: serviceName
      },
      audience: {
        DataType: 'String.Array',
        StringValue: JSON.stringify(audiences)
      }
    }
  }

  await sns.send(new PublishCommand(message))
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
