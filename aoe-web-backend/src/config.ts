process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// Check that mandatory environment variables are available and report missing ones on exit.
const missingEnvs: string[] = []
process.env.NODE_ENV || missingEnvs.push('NODE_ENV')
process.env.PORT_LISTEN || missingEnvs.push('PORT_LISTEN')
process.env.LOG_LEVEL || missingEnvs.push('LOG_LEVEL')
process.env.CLOUD_STORAGE_ENABLED || missingEnvs.push('CLOUD_STORAGE_ENABLED')
process.env.CLOUD_STORAGE_REGION || missingEnvs.push('CLOUD_STORAGE_REGION')
process.env.CLOUD_STORAGE_BUCKET || missingEnvs.push('CLOUD_STORAGE_BUCKET')
process.env.CLOUD_STORAGE_BUCKET_PDF || missingEnvs.push('CLOUD_STORAGE_BUCKET_PDF')
process.env.CLOUD_STORAGE_BUCKET_THUMBNAIL || missingEnvs.push('CLOUD_STORAGE_BUCKET_THUMBNAIL')
process.env.H5P_USER_EMAIL || missingEnvs.push('H5P_USER_EMAIL')
process.env.HTML_FOLDER || missingEnvs.push('HTML_FOLDER')
process.env.MATERIAL_FILE_UPLOAD_FOLDER || missingEnvs.push('MATERIAL_FILE_UPLOAD_FOLDER')
process.env.KAFKA_ENABLED || missingEnvs.push('KAFKA_ENABLED')
process.env.KAFKA_EXCLUDED_AGENT_IDENTIFIERS || missingEnvs.push('KAFKA_EXCLUDED_AGENT_IDENTIFIERS')
process.env.KAFKA_BROKER_SERVERS || missingEnvs.push('KAFKA_BROKER_SERVERS')
process.env.KAFKA_BROKER_TOPIC_MATERIAL_ACTIVITY ||
  missingEnvs.push('KAFKA_BROKER_TOPIC_MATERIAL_ACTIVITY')
process.env.KAFKA_BROKER_TOPIC_SEARCH_REQUESTS ||
  missingEnvs.push('KAFKA_BROKER_TOPIC_SEARCH_REQUESTS')
process.env.KAFKA_CLIENT_ID || missingEnvs.push('KAFKA_CLIENT_ID')
process.env.KAFKA_CLIENT_REGION || missingEnvs.push('KAFKA_CLIENT_REGION')
process.env.CONVERSION_TO_PDF_API || missingEnvs.push('CONVERSION_TO_PDF_API')
process.env.CONVERSION_TO_PDF_ENABLED || missingEnvs.push('CONVERSION_TO_PDF_ENABLED')
process.env.POSTGRESQL_HOST || missingEnvs.push('POSTGRESQL_HOST')
process.env.POSTGRESQL_PORT || missingEnvs.push('POSTGRESQL_PORT')
process.env.POSTGRESQL_DATA || missingEnvs.push('POSTGRESQL_DATA')
process.env.REDIS_HOST || missingEnvs.push('REDIS_HOST')
process.env.REDIS_PORT || missingEnvs.push('REDIS_PORT')
process.env.REDIS_PASS || missingEnvs.push('REDIS_PASS')
process.env.REDIS_USE_TLS || missingEnvs.push('REDIS_USE_TLS')
process.env.SERVER_CONFIG_OAIPMH_ANALYTICS_URL ||
  missingEnvs.push('SERVER_CONFIG_OAIPMH_ANALYTICS_URL')
process.env.STREAM_ENABLED || missingEnvs.push('STREAM_ENABLED')
process.env.STREAM_FILESIZE_MIN || missingEnvs.push('STREAM_FILESIZE_MIN')
process.env.STREAM_REDIRECT_URI || missingEnvs.push('STREAM_REDIRECT_URI')
process.env.STREAM_STATUS_HOST || missingEnvs.push('STREAM_STATUS_HOST')
process.env.STREAM_STATUS_PATH || missingEnvs.push('STREAM_STATUS_PATH')
process.env.STREAM_STATUS_HOST_HTTPS_ENABLED || missingEnvs.push('STREAM_STATUS_HOST_HTTPS_ENABLED')
process.env.PG_USER || missingEnvs.push('PG_USER')
process.env.PG_PASS || missingEnvs.push('PG_PASS')

if (missingEnvs.length > 0) {
  console.error('All required environment variables are not available: %s', missingEnvs)
  process.exit(1)
}

export const config = {
  // General application start up configurations.
  APPLICATION_CONFIG: {
    isCloudStorageEnabled: (process.env.CLOUD_STORAGE_ENABLED === '1') as boolean,
    logLevel: process.env.LOG_LEVEL as string,
    nodeEnv: process.env.NODE_ENV as string,
    portListen: parseInt(process.env.PORT_LISTEN as string, 10) as number
  } as const,

  // Cloud storage configurations.
  CLOUD_STORAGE_CONFIG: {
    region: process.env.CLOUD_STORAGE_REGION as string,
    endpoint: process.env.CLOUD_STORAGE_API as string,
    accessKeyId: process.env.CLOUD_STORAGE_ACCESS_KEY as string,
    secretAccessKey: process.env.CLOUD_STORAGE_ACCESS_SECRET as string,
    bucket: process.env.CLOUD_STORAGE_BUCKET as string,
    bucketPDF: process.env.CLOUD_STORAGE_BUCKET_PDF as string,
    bucketThumbnail: process.env.CLOUD_STORAGE_BUCKET_THUMBNAIL as string
  } as const,

  // Media file processing configurations.
  MEDIA_FILE_PROCESS: {
    conversionToPdfApi: process.env.CONVERSION_TO_PDF_API as string,
    conversionToPdfEnabled: (process.env.CONVERSION_TO_PDF_ENABLED === '1') as boolean,
    htmlFolder: process.env.HTML_FOLDER as string,
    localFolder: process.env.MATERIAL_FILE_UPLOAD_FOLDER as string,
    h5pJsonConfiguration: 'dist/services/config/h5p.json',
    h5pPathTemporaryStorage: '/mnt/data/webdata/h5p/temporary-storage',
    h5pPathContent: '/mnt/data/webdata/h5p/content',
    h5pPathLibraries: '/app/h5p/libraries',
    h5pPathCore: '/app/h5p/libraries/h5p-php-library',
    h5pPathEditor: '/app/h5p/libraries/h5p-editor-php-library',
    h5pPlayApi: `${process.env.HTML_BASE_URL as string}/h5p/play/`,
    h5pUserEmail: process.env.H5P_USER_EMAIL as string
  } as const,

  // Configuration for the client of Kafka message queue system.
  MESSAGE_QUEUE_OPTIONS: {
    kafkaExcludedAgentIdentifiers: (process.env.KAFKA_EXCLUDED_AGENT_IDENTIFIERS as string).split(
      ','
    ) as string[],
    kafkaProducerEnabled: (process.env.KAFKA_ENABLED === '1') as boolean,
    brokerServers: process.env.KAFKA_BROKER_SERVERS as string,
    topicMaterialActivity: process.env.KAFKA_BROKER_TOPIC_MATERIAL_ACTIVITY as string,
    topicSearchRequests: process.env.KAFKA_BROKER_TOPIC_SEARCH_REQUESTS as string,
    clientId: process.env.KAFKA_CLIENT_ID as string,
    region: process.env.KAFKA_CLIENT_REGION as string
  } as const,

  // Configuration for PostgreSQL database connections.
  POSTGRESQL_OPTIONS: {
    host: process.env.POSTGRESQL_HOST as string,
    port: process.env.POSTGRESQL_PORT as string,
    user: process.env.PG_USER as string,
    pass: process.env.PG_PASS as string,
    data: process.env.POSTGRESQL_DATA as string
  } as const,

  // Configuration for Redis database connetions.
  REDIS_OPTIONS: {
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT as string, 10) as number,
    username: process.env.REDIS_USERNAME as string,
    pass: process.env.REDIS_PASS as string,
    protocol: process.env.REDIS_USE_TLS !== 'true' ? 'redis' : 'rediss'
  } as const,

  // AOE server and service component general purpose configurations.
  SERVER_CONFIG_OPTIONS: {
    oaipmhAnalyticsURL: process.env.SERVER_CONFIG_OAIPMH_ANALYTICS_URL as string
  } as const,

  // Session management conventions to handle session initialization and persistence.
  SESSION_CONFIG_OPTIONS: {
    proxy: (process.env.SESSION_OPTION_PROXY.toLowerCase() === 'true') as boolean,
    resave: (process.env.SESSION_OPTION_RESAVE.toLowerCase() === 'true') as boolean,
    rolling: (process.env.SESSION_OPTION_ROLLING.toLowerCase() === 'true') as boolean,
    saveUninitialized: (process.env.SESSION_OPTION_SAVE_UNINITIALIZED.toLowerCase() ===
      'true') as boolean,
    secret: process.env.SESSION_SECRET as string
  } as const,

  // Session cookie options to initialize and terminate sessions for a user.
  SESSION_COOKIE_OPTIONS: {
    domain: process.env.SESSION_COOKIE_DOMAIN as string,
    httpOnly: (process.env.SESSION_COOKIE_HTTP_ONLY.toLowerCase() === 'true') as boolean,
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10) as number,
    path: process.env.SESSION_COOKIE_PATH as string,
    sameSite: process.env.SESSION_COOKIE_SAME_SITE as 'lax' | 'strict' | 'none', // boolean | 'lax' | 'strict' | 'none'
    secure: (process.env.SESSION_COOKIE_SECURE.toLowerCase() === 'true') as boolean // boolean | 'auto'
  } as const,

  // Streaming redirect criteria to accept a media file download by streaming.
  STREAM_REDIRECT_CRITERIA: {
    mimeTypeArr: ['audio/mp4', 'audio/mpeg', 'audio/x-m4a', 'video/mp4'] as string[],
    minFileSize: parseInt(process.env.STREAM_FILESIZE_MIN, 10) as number,
    redirectUri: process.env.STREAM_REDIRECT_URI as string,
    streamEnabled: (process.env.STREAM_ENABLED === '1') as boolean
  } as const,

  // Streaming service status request to verify a media file streaming capability.
  STREAM_STATUS_REQUEST: {
    host: process.env.STREAM_STATUS_HOST as string,
    path: process.env.STREAM_STATUS_PATH as string,
    port: process.env.STREAM_STATUS_PORT as string,
    httpsEnabled: (process.env.STREAM_STATUS_HOST_HTTPS_ENABLED === '1') as boolean
  }
}
