export interface StatisticsTimespanPost {
    since: string;
    until: string;
    interaction?: string;
    metadata?: {
        organizations?: string[];
        educationalLevels?: string[];
        educationalSubjects?: string[];
    };
    filters?: {
        organizations?: string[];
        educationalLevels?: string[];
        educationalSubjects?: string[];
    };
}

export interface StatisticsPortionsPost {
    since?: string;
    until?: string;
    expiredBefore?: string;
    organizations?: string[];
    educationalLevels?: string[];
    educationalSubjects?: string[];
}
