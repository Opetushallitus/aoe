import { SNSClient, PublishCommand, type PublishCommandInput } from '@aws-sdk/client-sns'
import type {
  CloudWatchLogsDecodedData,
  CloudWatchLogsEvent,
  CloudWatchLogsLogEvent
} from 'aws-lambda'
import { gunzipSync } from 'node:zlib'

import { LogFields, ErrorAlert, SlackNotification } from './types'

const MAX_FIELD_LENGTH = 3500
const MAX_INLINE_LENGTH = 500

const environment = process.env.ENVIRONMENT || 'unknown'
const serviceName = process.env.SERVICE_NAME || 'web-backend'

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

  const timestamp = new Date(logEvent.timestamp).toISOString()

  return {
    environment,
    service: serviceName,
    timestamp,
    logGroup: payload.logGroup,
    logStream: payload.logStream,
    logEventId: logEvent.id,
    level: parsedMessage.level,
    message: stringifyField(parsedMessage.message) || logEvent.message
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

function truncate(value: string, maxLength: number = MAX_FIELD_LENGTH): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength)}...`
}

async function publishAlert(alert: ErrorAlert): Promise<void> {
  const topicArn = process.env.ERROR_TOPIC_ARN
  if (!topicArn) {
    console.warn('ERROR_TOPIC_ARN is not set; skipping error alert publish')
    return
  }

  const message: PublishCommandInput = {
    TopicArn: topicArn,
    Subject: truncate(`[${environment}] ${serviceName} error`, 100),
    Message: JSON.stringify(buildSlackNotification(alert), undefined, 2),
    MessageAttributes: {
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
      title: truncate(`:warning: ${alert.environment} ${alert.service} error`, 100),
      description: buildSlackDescription(alert)
    },
    metadata: {
      threadId: `${alert.environment}-${alert.service}-errors-${new Date().toISOString().slice(0, 10)}`,
      summary: truncate(alert.message, MAX_INLINE_LENGTH)
    }
  }
}

function buildSlackDescription(alert: ErrorAlert): string {
  const lines = ['*Error:*', formatCodeBlock(alert.message)]
  const cloudWatchLogsUrl = buildCloudWatchLogsUrl(alert)

  if (cloudWatchLogsUrl) {
    lines.push(`<${cloudWatchLogsUrl}|Open error in CloudWatch>`)
  }

  return lines.join('\n')
}

function formatCodeBlock(value: string): string {
  const formattedValue = truncate(value, MAX_FIELD_LENGTH)
  return `\`\`\`\n${formattedValue}\n\`\`\``
}

function buildCloudWatchLogsUrl(alert: ErrorAlert): string | undefined {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'eu-west-1'
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

function stringifyField(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (value === undefined || value === null) {
    return undefined
  }

  return JSON.stringify(value)
}
