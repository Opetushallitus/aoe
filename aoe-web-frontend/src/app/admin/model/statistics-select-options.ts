import { ActivityEnum, CategoryEnum, IntervalEnum } from '@admin/model/enumeration/AnalyticsEnums'

export interface OptionActivity {
  key: number
  value: ActivityEnum
  label: {
    fi: string
    sv: string
    en: string
  }
}

export interface OptionCategory {
  key: number
  value: CategoryEnum
  label: {
    fi: string
    sv: string
    en: string
  }
}

export interface OptionInterval {
  key: number
  value: IntervalEnum
  label: {
    fi: string
    sv: string
    en: string
  }
}
