import { Author } from './author';
import { Keyword } from './keyword';
import { EducationalLevel } from './educational-level';

export interface EducationalMaterialList {
  id: number;
  name: string;
  thumbnail?: string;
  learningResourceTypes: string[];
  authors: Author[];
  description?: string;
  license: string;
  keywords: Keyword[];
  educationalLevels: EducationalLevel[];
}
