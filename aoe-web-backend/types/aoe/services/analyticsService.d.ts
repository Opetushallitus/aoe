interface IMessageBase {
  sessionId: string
  timestamp: string
}

// Search analytics

export interface ISearchKeywords {
  keywords: string
}

export interface ISearchFilters {
  filters: {
    educationalLevels: string[]
    educationalSubjects: string[]
    learningResourceTypes: string[]
  }
}

export type TypeSearchRequest = Partial<IMessageBase> & (ISearchKeywords | ISearchFilters)

// Material activity analytics

interface IActivityMetadata {
  eduMaterialId: string
  interaction: string
  metadata?: {
    created: string
    updated: string
    organizations?: string[]
    educationalLevels?: string[]
    educationalSubjects?: string[]
  }
}

export type TypeMaterialActivity = Partial<IMessageBase> & IActivityMetadata
