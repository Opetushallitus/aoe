import { KeyValue } from '@angular/common';

export interface SearchFilters {
  languages?: string[] | null;
  subjects?: SearchFilterEducationalSubject[] | null;
  teaches?: KeyValue<string, string>[] | null;
  authors?: string[] | null;
  organizations?: KeyValue<string, string>[] | null;
  roles?: KeyValue<string, string>[] | null;
  keywords?: KeyValue<string, string>[] | null;
}

export interface SearchFilterEducationalSubject {
  key: string;
  source: string;
  value: string;
}
