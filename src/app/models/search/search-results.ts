import { Author } from '@models/author';
import { EducationalLevel } from '@models/educational-level';
import { LearningResourceType } from '@models/learning-resource-type';

export interface SearchResults {
  hits: number;
  results: SearchResult[];
}

export interface SearchResult {
  id: number | string;
  createdAt: Date;
  publishedAt?: Date;
  updatedAt?: Date;
  name: string;
  description: string;
  authors: Author[];
  learningResourceTypes: LearningResourceType[];
  license: string;
  educationalLevels: EducationalLevel[];
  thumbnail?: string;
}
