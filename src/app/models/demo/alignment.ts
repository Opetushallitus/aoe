import { EducationalSubject, EducationalTeaches } from './educational';

export interface AlignmentObject {
  alignmentType: AlignmentType;
  educationalFramework: string;
  teaches: EducationalTeaches[];
  complexity: string;
}

export interface AlignmentType {
  id: number;
  value: string;
  educationalSubject: EducationalSubject[];
}
