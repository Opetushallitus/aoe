process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Check that mandatory environment variables are available and report missing ones on exit.
const missingEnvs: string[] = [];
process.env.CLOUD_STORAGE_ENABLED || missingEnvs.push('CLOUD_STORAGE_ENABLED');
process.env.LOG_LEVEL || missingEnvs.push('LOG_LEVEL');
process.env.CLOUD_STORAGE_ACCESS_KEY || missingEnvs.push('CLOUD_STORAGE_ACCESS_KEY');
process.env.CLOUD_STORAGE_ACCESS_SECRET || missingEnvs.push('CLOUD_STORAGE_ACCESS_SECRET');
process.env.CLOUD_STORAGE_API || missingEnvs.push('CLOUD_STORAGE_API');
process.env.CLOUD_STORAGE_REGION || missingEnvs.push('CLOUD_STORAGE_REGION');
process.env.CLOUD_STORAGE_BUCKET || missingEnvs.push('CLOUD_STORAGE_BUCKET');
process.env.CLOUD_STORAGE_BUCKET_PDF || missingEnvs.push('CLOUD_STORAGE_BUCKET_PDF');
process.env.CLOUD_STORAGE_BUCKET_THUMBNAIL || missingEnvs.push('CLOUD_STORAGE_BUCKET_THUMBNAIL');
process.env.HTML_FOLDER || missingEnvs.push('HTML_FOLDER');
process.env.MATERIAL_FILE_UPLOAD_FOLDER || missingEnvs.push('MATERIAL_FILE_UPLOAD_FOLDER');
process.env.KAFKA_ENABLED || missingEnvs.push('KAFKA_ENABLED');
process.env.KAFKA_BROKER_SERVERS || missingEnvs.push('KAFKA_BROKER_SERVERS');
process.env.KAFKA_BROKER_TOPIC_MATERIAL_ACTIVITY || missingEnvs.push('KAFKA_BROKER_TOPIC_MATERIAL_ACTIVITY');
process.env.KAFKA_BROKER_TOPIC_SEARCH_REQUESTS || missingEnvs.push('KAFKA_BROKER_TOPIC_SEARCH_REQUESTS');
process.env.KAFKA_CLIENT_ID || missingEnvs.push('KAFKA_CLIENT_ID');
process.env.SERVER_CONFIG_OAIPMH_ANALYTICS_URL || missingEnvs.push('SERVER_CONFIG_OAIPMH_ANALYTICS_URL');
process.env.PID_API_KEY || missingEnvs.push('PID_API_KEY');
process.env.PID_SERVICE_URL || missingEnvs.push('PID_SERVICE_URL');

export default {
  // General application start up configurations.
  APPLICATION_CONFIG: {
    isCloudStorageEnabled: (process.env.CLOUD_STORAGE_ENABLED === '1') as boolean,
    logLevel: process.env.LOG_LEVEL as string,
  } as const,

  // Cloud storage configurations.
  CLOUD_STORAGE_CONFIG: {
    accessKey: process.env.CLOUD_STORAGE_ACCESS_KEY as string,
    accessSecret: process.env.CLOUD_STORAGE_ACCESS_SECRET as string,
    apiURL: process.env.CLOUD_STORAGE_API as string,
    region: process.env.CLOUD_STORAGE_REGION as string,
    bucket: process.env.CLOUD_STORAGE_BUCKET as string,
    bucketPDF: process.env.CLOUD_STORAGE_BUCKET_PDF as string,
    bucketThumbnail: process.env.CLOUD_STORAGE_BUCKET_THUMBNAIL as string,
  } as const,

  // Media file processing configurations.
  MEDIA_FILE_PROCESS: {
    htmlFolder: process.env.HTML_FOLDER as string,
    localFolder: process.env.MATERIAL_FILE_UPLOAD_FOLDER as string,
  } as const,

  // Configuration for the client of Kafka message queue system.
  MESSAGE_QUEUE_OPTIONS: {
    kafkaProducerEnabled: (process.env.KAFKA_ENABLED === '1') as boolean,
    brokerServers: process.env.KAFKA_BROKER_SERVERS as string,
    topicMaterialActivity: process.env.KAFKA_BROKER_TOPIC_MATERIAL_ACTIVITY as string,
    topicSearchRequests: process.env.KAFKA_BROKER_TOPIC_SEARCH_REQUESTS as string,
    clientId: process.env.KAFKA_CLIENT_ID as string,
  } as const,

  // AOE server and service component general purpose configurations.
  SERVER_CONFIG_OPTIONS: {
    oaipmhAnalyticsURL: process.env.SERVER_CONFIG_OAIPMH_ANALYTICS_URL as string,
    pidApiKey: process.env.PID_API_KEY as string,
    pidServiceURL: process.env.PID_SERVICE_URL as string,
  } as const,

  // Session management conventions to handle session initialization and persistence.
  SESSION_CONFIG_OPTIONS: {
    proxy: (process.env.SESSION_OPTION_PROXY.toLowerCase() === 'true') as boolean,
    resave: (process.env.SESSION_OPTION_RESAVE.toLowerCase() === 'true') as boolean,
    rolling: (process.env.SESSION_OPTION_ROLLING.toLowerCase() === 'true') as boolean,
    saveUninitialized: (process.env.SESSION_OPTION_SAVE_UNINITIALIZED.toLowerCase() === 'true') as boolean,
    secret: process.env.SESSION_SECRET as string,
  } as const,

  // Session cookie options to initialize and terminate sessions for a user.
  SESSION_COOKIE_OPTIONS: {
    domain: process.env.SESSION_COOKIE_DOMAIN as string,
    httpOnly: (process.env.SESSION_COOKIE_HTTP_ONLY.toLowerCase() === 'true') as boolean,
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10) as number,
    path: process.env.SESSION_COOKIE_PATH as string,
    sameSite: process.env.SESSION_COOKIE_SAME_SITE as 'lax' | 'strict' | 'none', // boolean | 'lax' | 'strict' | 'none'
    secure: (process.env.SESSION_COOKIE_SECURE.toLowerCase() === 'true') as boolean, // boolean | 'auto'
  } as const,

  // Streaming redirect criteria to accept a media file download by streaming.
  STREAM_REDIRECT_CRITERIA: {
    mimeTypeArr: ['audio/mp4', 'audio/mpeg', 'audio/x-m4a', 'video/mp4'] as string[],
    minFileSize: parseInt(process.env.STREAM_FILESIZE_MIN, 10) as number,
    redirectUri: process.env.STREAM_REDIRECT_URI as string,
  } as const,

  // Streaming service status request to verify a media file streaming capability.
  STREAM_STATUS_REQUEST: {
    host: process.env.STREAM_STATUS_HOST as string,
    path: process.env.STREAM_STATUS_PATH as string,
  } as const,
} as const;
