import { ActivityType, IntervalType } from '@admin/model/enumeration/CategoryType';

export interface ActivityOptions {
  key: ActivityType;
  value: 'edit' | 'download' | 'search' | 'view';
  label: {
    fi: string;
    sv: string;
    en: string;
  };
}

export interface Interval {
  key: IntervalType;
  value: 'day' | 'week' | 'month';
  label: {
    fi: string;
    sv: string;
    en: string;
  };
}
