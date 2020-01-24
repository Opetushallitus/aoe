export interface SearchResults {
  hits: number;
  results: SearchResult[];
}

export interface SearchResult {
  name: string;
  description: string;
  license: string;
}
