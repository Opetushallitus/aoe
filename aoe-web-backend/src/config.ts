import * as logger from '@/util/winstonLogger'
import { z } from 'zod'

const Config = z
  .object({
    AOE_IDENTIFY_REPOSITORY_NAME: z.string().default('OPH - AOE Open Metadata Interface'),
    AOE_IDENTIFY_BASE_URL: z.string().default('https://aoe.fi/meta/oaipmh'),
    AOE_IDENTIFY_BASE_URL_V2: z.string().default('https://aoe.fi/meta/v2/oaipmh'),
    AOE_IDENTIFY_PROTOCOL_VERSION: z.string().default('2.0'),
    AOE_IDENTIFY_ADMIN_EMAIL: z.string().default('oppimateriaalivaranto@aoe.fi'),
    AOE_IDENTIFY_EARLIEST_DATESTAMP: z.string().default('2019-12-11T11:43:18Z'),
    AOE_IDENTIFY_DELETED_RECORD: z.string().default('persistent'),
    AOE_IDENTIFY_GRANULARITY: z.string().default('YYYY-MM-DDThh:mm:ssZ'),
    AOE_IDENTIFY_COMPRESSION: z.string().optional(),
    AOE_OAI_IDENTIFIER_SCHEME: z.string().default('oai'),
    AOE_OAI_IDENTIFIER_REPOSITORY_IDENTIFIER: z.string().default('aoe.fi'),
    AOE_OAI_IDENTIFIER_DELIMITER: z.string().default(':'),
    AOE_OAI_IDENTIFIER_SAMPLE_IDENTIFIER: z.string().default('oai:aoe.fi:1'),
    AOE_REQUEST_PAGE_SIZE: z.number().default(20),
    AOE_METADATA_LRMI_LEARNING_RESOURCE_TYPES: z
      .string()
      .array()
      .default(['educationalSubject', 'educationalLevel', 'educationalUse', 'teaches'])
  })
  .transform((c) => ({
    aoe: {
      identify: {
        repositoryName: c.AOE_IDENTIFY_REPOSITORY_NAME,
        baseUrl: c.AOE_IDENTIFY_BASE_URL,
        baseUrlV2: c.AOE_IDENTIFY_BASE_URL_V2,
        protocolVersion: c.AOE_IDENTIFY_PROTOCOL_VERSION,
        adminEmail: c.AOE_IDENTIFY_ADMIN_EMAIL,
        earliestDatestamp: c.AOE_IDENTIFY_EARLIEST_DATESTAMP,
        deletedRecord: c.AOE_IDENTIFY_DELETED_RECORD,
        granularity: c.AOE_IDENTIFY_GRANULARITY,
        compression: c.AOE_IDENTIFY_COMPRESSION
      },
      oaiIdentifier: {
        scheme: c.AOE_OAI_IDENTIFIER_SCHEME,
        repositoryIdentifier: c.AOE_OAI_IDENTIFIER_REPOSITORY_IDENTIFIER,
        delimeter: c.AOE_OAI_IDENTIFIER_DELIMITER,
        sampleIdentifier: c.AOE_OAI_IDENTIFIER_SAMPLE_IDENTIFIER
      },
      request: {
        pageSize: c.AOE_REQUEST_PAGE_SIZE
      },
      metadata: {
        lrmiLearningResourceTypes: c.AOE_METADATA_LRMI_LEARNING_RESOURCE_TYPES
      }
    }
  }))

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// Check that mandatory environment variables are available and report missing ones on exit.
const missingEnvs: string[] = []
process.env.ENV || missingEnvs.push('ENV')
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
process.env.ANALYTICS_EXCLUDED_AGENT_IDENTIFIERS ||
  missingEnvs.push('ANALYTICS_EXCLUDED_AGENT_IDENTIFIERS')
process.env.CONVERSION_TO_PDF_API || missingEnvs.push('CONVERSION_TO_PDF_API')
process.env.POSTGRESQL_HOST || missingEnvs.push('POSTGRESQL_HOST')
process.env.POSTGRESQL_PORT || missingEnvs.push('POSTGRESQL_PORT')
process.env.POSTGRESQL_DATA || missingEnvs.push('POSTGRESQL_DATA')
process.env.REDIS_HOST || missingEnvs.push('REDIS_HOST')
process.env.REDIS_PORT || missingEnvs.push('REDIS_PORT')
process.env.REDIS_PASS || missingEnvs.push('REDIS_PASS')
process.env.REDIS_USE_TLS || missingEnvs.push('REDIS_USE_TLS')
process.env.STREAM_ENABLED || missingEnvs.push('STREAM_ENABLED')
process.env.STREAM_FILESIZE_MIN || missingEnvs.push('STREAM_FILESIZE_MIN')
process.env.STREAM_REDIRECT_URI || missingEnvs.push('STREAM_REDIRECT_URI')
process.env.STREAM_STATUS_HOST || missingEnvs.push('STREAM_STATUS_HOST')
process.env.STREAM_STATUS_PATH || missingEnvs.push('STREAM_STATUS_PATH')
process.env.STREAM_STATUS_HOST_HTTPS_ENABLED || missingEnvs.push('STREAM_STATUS_HOST_HTTPS_ENABLED')
process.env.PG_USER || missingEnvs.push('PG_USER')
process.env.PG_PASS || missingEnvs.push('PG_PASS')
process.env.EXTERNAL_API_CALLERID_OID || missingEnvs.push('EXTERNAL_API_CALLERID_OID')
process.env.EXTERNAL_API_CALLERID_SERVICE || missingEnvs.push('EXTERNAL_API_CALLERID_SERVICE')
process.env.EXTERNAL_API_OPINTOPOLKU_EPERUSTEET ||
  missingEnvs.push('EXTERNAL_API_OPINTOPOLKU_EPERUSTEET')
process.env.EXTERNAL_API_OPINTOPOLKU_KOODISTOT ||
  missingEnvs.push('EXTERNAL_API_OPINTOPOLKU_KOODISTOT')
process.env.EXTERNAL_API_OPINTOPOLKU_ORGANISAATIOT ||
  missingEnvs.push('EXTERNAL_API_OPINTOPOLKU_ORGANISAATIOT')
process.env.EXTERNAL_API_FINTO_ASIASANAT || missingEnvs.push('EXTERNAL_API_FINTO_ASIASANAT')
process.env.EXTERNAL_API_SUOMI_KOODISTOT || missingEnvs.push('EXTERNAL_API_SUOMI_KOODISTOT')

if (missingEnvs.length > 0) {
  logger.error('All required environment variables are not available: %s', missingEnvs)
  process.exit(1)
}

const environment = process.env.ENV

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
    htmlFolder: process.env.HTML_FOLDER as string,
    localFolder: process.env.MATERIAL_FILE_UPLOAD_FOLDER as string,
    h5pJsonConfiguration: 'dist/services/config/h5p.json',
    h5pPathTemporaryStorage: '/mnt/data/webdata/h5p/temporary-storage',
    h5pPathContent: '/mnt/data/webdata/h5p/content',
    h5pPathLibraries: '/app/h5p/libraries',
    h5pPathCore: '/app/h5p/libraries/h5p-php-library',
    h5pPathEditor: '/app/h5p/libraries/h5p-editor-php-library',
    h5pPlayApi: `${process.env.HTML_BASE_URL as string}/h5p/play/`,
    h5pUserEmail: process.env.H5P_USER_EMAIL as string,
    // Max file size (in bytes) for synchronous ZIP extraction during metadata requests
    // Files larger than this will be skipped to prevent timeout issues
    // Default: 104,857,600 bytes (100 MB)
    maxZipExtractionSize: parseInt(process.env.MAX_ZIP_EXTRACTION_SIZE || '104857600', 10) as number
  } as const,

  ANALYTICS_OPTIONS: {
    excludedAgentIdentifiers: (process.env.ANALYTICS_EXCLUDED_AGENT_IDENTIFIERS as string).split(
      ','
    ) as string[]
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
  },

  // External APIs.
  EXTERNAL_API: {
    oid: process.env.EXTERNAL_API_CALLERID_OID as string,
    service: process.env.EXTERNAL_API_CALLERID_SERVICE as string,
    ePerusteet: process.env.EXTERNAL_API_OPINTOPOLKU_EPERUSTEET as string,
    opintopolkuKoodistot: process.env.EXTERNAL_API_OPINTOPOLKU_KOODISTOT as string,
    organisaatiot: process.env.EXTERNAL_API_OPINTOPOLKU_ORGANISAATIOT as string,
    asiasanat: process.env.EXTERNAL_API_FINTO_ASIASANAT as string,
    suomiKoodistot: process.env.EXTERNAL_API_SUOMI_KOODISTOT as string
  } as const,
  aoe: Config.parse(process.env).aoe
}
