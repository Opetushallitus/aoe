export interface ServiceConfig {
  cpu_limit: string
  memory_limit: string
  min_count: number
  max_count: number
  allow_ecs_exec: boolean
  env_vars?: Record<string, string>
}

export interface EnvironmentConfig {
  aws: {
    vpc_cidr: string
    availability_zones: number
    domain: string
  }
  services: {
    data_analytics: ServiceConfig
    data_services: ServiceConfig
    web_frontend: ServiceConfig
    web_backend: ServiceConfig
    streaming: ServiceConfig
    semantic_apis: ServiceConfig
  }
  msk: {
    clusterName: string
    instanceType: string
    numberOfBrokerNodes: number
    version: string
    volumeSize: number
  }
  open_search: {
    standbyReplicas: 'DISABLED' | 'ENABLED'
    collectionName: string
    collectionDescription: string
  }
  aurora_databases: {
    web_backend: {
      version: string
      min_size_acu: number
      max_size_acu: number
      performance_insights: boolean
    }
  }
  document_db: {
    instances: number
    instanceType: string
    engineVersion: string
  }
  S3: {
    aoeBucketName: string
    aoePdfBucketName: string
    aoeThumbnailBucketName: string
  }
  EFS: {
    throughputMode: 'BURSTING' | 'ELASTIC' | 'PROVISIONED'
  }
  redis_serverless: {
    semantic_apis: {
      major_version: string
      storage_min: number
      storage_max: number
      min_ecpu_per_second: number
      max_ecpu_per_second: number
    }
  }
  cloudfront: {
    require_test_authentication: boolean
  }
}
