export interface CollectionCard {
  id: string;
  name: string;
  thumbnail: string | null;
  authors: string[];
  description: string;
  keywords: CollectionCardKeyword[];
  educationalLevels: CollectionCardEducationalLevel[];
  languages: string[];
}

export interface CollectionCardKeyword {
  key: string;
  value: string;
}

export interface CollectionCardEducationalLevel {
  key: string;
  value: string;
}
