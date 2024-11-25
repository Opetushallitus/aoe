export interface EducationalLevel {
  key: string;
  value: string;
  children: EducationalLevelChild[];
}

export interface EducationalLevelChild {
  key: string;
  value: string;
  disabled?: boolean;
}
