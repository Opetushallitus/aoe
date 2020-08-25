export interface CollectionSearchResults {
  hits: number;
  results: CollectionSearchResult[];
}

export interface CollectionSearchResult {
  id: string;
  name: string;
  thumbnail: string | null;
  description: string;
  authors: string[];
  keywords: [
    {
      key: string;
      value: string;
    }
  ];
}
