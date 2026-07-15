import { EnvironmentConfig } from './types'

export const qa: EnvironmentConfig = {
  aws: {
    vpc_cidr: '10.5.64.0/18',
    availability_zones: 2,
    domain: 'qa.aoe.fi'
  },
  services: {
    web_frontend: {
      cpu_limit: '512',
      memory_limit: '1024',
      min_count: 1,
      max_count: 1,
      allow_ecs_exec: true
    },
    web_backend: {
      cpu_limit: '2048',
      memory_limit: '6144',
      min_count: 1,
      max_count: 1,
      allow_ecs_exec: true,
      env_vars: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'debug',
        PORT_LISTEN: '8080',
        MATERIAL_VERSION_URL: 'https://qa.aoe.fi/materiaali/',
        HTTP_OPTIONS_TIMEOUT: '5000',
        HTTP_OPTIONS_RETRY: '2',
        HTTP_OPTIONS_CLOCK_TOLERANCE: '5',
        POSTGRESQL_DATA: 'aoe',
        PG_USER: 'aoe_admin',
        ANALYTICS_EXCLUDED_AGENT_IDENTIFIERS: 'oersi',
        SESSION_COOKIE_DOMAIN: '.aoe.fi',
        SESSION_COOKIE_HTTP_ONLY: 'true',
        SESSION_COOKIE_MAX_AGE: '86400000',
        SESSION_COOKIE_PATH: '/',
        SESSION_COOKIE_SAME_SITE: 'lax',
        SESSION_COOKIE_SECURE: 'true',
        SESSION_OPTION_PROXY: 'true',
        SESSION_OPTION_RESAVE: 'false',
        SESSION_OPTION_ROLLING: 'false',
        SESSION_OPTION_SAVE_UNINITIALIZED: 'false',
        CLOUD_STORAGE_REGION: 'eu-west-1',
        CLOUD_STORAGE_BUCKET: 'aoe-qa',
        CLOUD_STORAGE_BUCKET_PDF: 'aoepdf-qa',
        CLOUD_STORAGE_BUCKET_THUMBNAIL: 'aoethumbnail-qa',
        THUMBNAIL_END_POINT: '/app/thumbnail/',
        FILE_SIZE_LIMIT: '5000000000',
        THUMBNAIL_FILE_SIZE_LIMIT: '10485760',
        REDIRECT_URI: 'https://qa.aoe.fi/api/secure/redirect',
        SUCCESS_REDIRECT_URI: '/',
        FAILURE_REDIRECT_URI: '/api/login',
        CREATE_ES_INDEX: '0',
        ES_INDEX: 'aoe',
        ES_MAPPING_FILE: '/app/aoemapping.json',
        ES_COLLECTION_INDEX: 'aoecollection',
        ES_COLLECTION_MAPPING_FILE: '/app/aoecollectionmapping.json',
        ES_SIZE_DEFAULT: '1000',
        ES_FROM_DEFAULT: '0',
        HTML_BASE_URL: 'https://qa.aoe.fi',
        HTML_FOLDER: '/mnt/data/webdata/htmlfolder',
        H5P_USER_EMAIL: 'oppimateriaalivaranto@aoe.fi',
        MATERIAL_FILE_UPLOAD_FOLDER: '/mnt/data/uploads',
        CONVERSION_TO_PDF_API: 'https://qa.aoe.fi/api/v1/pdf/content/',
        FILE_DOWNLOAD_URL: 'https://qa.aoe.fi/api/v1/download/file/',
        THUMBNAIL_DOWNLOAD_URL: 'https://qa.aoe.fi/api/v1/thumbnail/',
        COLLECTION_THUMBNAIL_DOWNLOAD_URL: 'https://qa.aoe.fi/api/v1/collection/thumbnail/',
        REDIS_USERNAME: 'app',
        REDIS_USE_TLS: 'true',
        BASE_URL: 'https://qa.aoe.fi/api/v1/',
        EMAIL_FROM: 'oppimateriaalivaranto@qa.aoe.fi',
        SEND_EXPIRATION_NOTIFICATION_EMAIL: '0',
        SEND_RATING_NOTIFICATION_EMAIL: '0',
        SEND_VERIFICATION_EMAIL: '1',
        VERIFY_EMAIL_REDIRECT_URL: '/',
        CLOUD_STORAGE_ENABLED: '1',
        LOGIN_ENABLED: '1',
        PID_SERVICE_RUN_SCHEDULED: 'true',
        STREAM_ENABLED: '1',
        STREAM_FILESIZE_MIN: '100000',
        STREAM_REDIRECT_URI: 'https://qa.aoe.fi/stream/api/v1/material/',
        STREAM_STATUS_HOST: 'streaming-app.qa.aoe.local',
        STREAM_STATUS_PORT: '8080',
        STREAM_STATUS_PATH: '/stream/api/v1/material/',
        STREAM_STATUS_HOST_HTTPS_ENABLED: '0',
        EXTERNAL_API_CALLERID_OID: '1.2.246.562.10.2013112012294919827487',
        EXTERNAL_API_CALLERID_SERVICE: 'aoe',
        EXTERNAL_API_OPINTOPOLKU_KOODISTOT:
          'https://virkailija.opintopolku.fi/koodisto-service/rest/json',
        EXTERNAL_API_FINTO_ASIASANAT: 'http://api.finto.fi/rest/v1',
        EXTERNAL_API_SUOMI_KOODISTOT:
          'https://koodistot.suomi.fi/codelist-api/api/v1/coderegistries',
        EXTERNAL_API_OPINTOPOLKU_ORGANISAATIOT:
          'https://virkailija.opintopolku.fi/organisaatio-service/rest',
        EXTERNAL_API_OPINTOPOLKU_EPERUSTEET:
          'https://virkailija.opintopolku.fi/eperusteet-service/api'
      }
    },
    streaming: {
      cpu_limit: '512',
      memory_limit: '1024',
      min_count: 1,
      max_count: 1,
      allow_ecs_exec: true,
      env_vars: {
        LOG_LEVEL: 'error',
        PORT: '8080',
        NODE_ENV: 'production',
        STORAGE_BUCKET: 'aoe-qa',
        STORAGE_REGION: 'eu-west-1',
        STORAGE_MAX_RANGE: '10000000'
      }
    }
  },
  features: {},
  open_search: {
    standbyReplicas: 'DISABLED',
    collectionName: 'aoecollection',
    collectionDescription: 'Collection for aoe'
  },
  aurora_databases: {
    web_backend: {
      version: '16.4',
      min_size_acu: 0.5,
      max_size_acu: 2,
      performance_insights: false
    }
  },
  S3: {
    aoeBucketName: 'aoe',
    aoePdfBucketName: 'aoepdf',
    aoeThumbnailBucketName: 'aoethumbnail'
  },
  EFS: {
    throughputMode: 'bursting'
  },
  redis_serverless: {
    semantic_apis: {
      major_version: '7',
      storage_min: 1,
      storage_max: 5,
      min_ecpu_per_second: 1000,
      max_ecpu_per_second: 40000
    }
  },
  cloudfront: {
    require_test_authentication: true
  }
}
