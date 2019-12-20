import { Author } from './author';
import { Keyword } from './keyword';
import { EducationalLevel } from './educational-level';
import { LearningResourceType } from './learning-resource-type';

export interface EducationalMaterialList {
  id: number;
  name: [{
    materialname: string;
    language: string;
  }];
  slug?: string;
  thumbnail?: string;
  learningResourceTypes: LearningResourceType[];
  authors: Author[];
  description?: [{
    description: string;
    language: string;
  }];
  license: string;
  keywords: Keyword[];
  educationalLevels: EducationalLevel[];
}
