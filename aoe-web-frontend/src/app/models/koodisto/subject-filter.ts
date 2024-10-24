export interface SubjectFilter {
  key: number | string;
  value: string;
  children: SubjectFilterChild[];
}

export interface SubjectFilterChild {
  key: number | string;
  value: string;
  parent?: string;
}
