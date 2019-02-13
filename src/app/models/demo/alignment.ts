import { EducationalSubject, EducationalTeaches } from './educational';

/**
 * Alignment Object model
 */
export interface AlignmentObject {
  alignmentType: AlignmentType;
  educationalFramework: string;
  teaches: EducationalTeaches[];
  complexity: string;
}

/**
 * Alignment Type model
 */
export interface AlignmentType {
  id: number;
  value: string;
  educationalSubject: EducationalSubject[];
}
