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
    web_backend: ServiceConfig
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
  S3: {
    aoeBucketName: string
    aoePdfBucketName: string
    aoeThumbnailBucketName: string
    uploadedMaterialsBucketName: string
  }
  EFS: {
    throughputMode: 'bursting' | 'elastic' | 'provisioned'
  }
  cloudfront: {
    require_test_authentication: boolean
    waf_mode: 'count' | 'block'
  }
  ses: {
    verified_recipients: string[]
  }
}
