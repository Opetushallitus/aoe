export type LogFields = Record<string, unknown>

export type ErrorAlert = {
  environment: string
  service: string
  timestamp: string
  message: string
  level: string
  logEventId: string
  logGroup: string
  logStream: string
}

export type SlackNotification = {
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
