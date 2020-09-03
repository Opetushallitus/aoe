export interface CollectionSearchResults {
  hits: number;
  results: CollectionSearchResult[];
}

export interface CollectionSearchResult {
  id: string;
  publishedat: Date | null;
  updatedat: Date | null;
  createdat: Date | null;
  name: string;
  description: string;
  keywords: [
    {
      key: string;
      value: string;
    }
  ];
  languages: string[];
  alignmentObjects: any[];
  educationalUses: [
    {
      key: string;
      value: string;
    }
  ];
  educationalRoles: [
    {
      key: string;
      value: string;
    }
  ];
  accessibilityHazards: [
    {
      key: string;
      value: string;
    }
  ];
  accessibilityFeatures: [
    {
      key: string;
      value: string;
    }
  ];
  educationalLevels: [
    {
      key: string;
      value: string;
    }
  ];
  thumbnail?: string;
  authors: string[];
}
