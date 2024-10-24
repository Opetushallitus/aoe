export interface EducationalSubject {
  key: number | string;
  value: string;
  children: EducationalSubjectChild[];
}

export interface EducationalSubjectChild {
  key: number | string;
  value: string;
  parent?: string;
}
