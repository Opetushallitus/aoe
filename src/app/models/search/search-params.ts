export interface SearchParams {
  keywords: string | null;
  filters: {
    languages?: string[] | null;
    educationalLevels?: string[] | null;
    learningResourceTypes?: string[] | null;
    authors?: string[] | null;
    organizations?: string[] | null;
    educationalRoles?: string[] | null;
    keywords?: string[] | null;
    educationalSubjects?: string[] | null;
    teaches?: string[] | null;
    educationalUse?: string[] | null;
    accessibilityHazards?: string[] | null;
    accessibilityFeatures?: string[] | null;
    license?: string[] | null;
  };
  from?: number;
  size?: number;
  sort?: any;
  sort2?: any;
}
