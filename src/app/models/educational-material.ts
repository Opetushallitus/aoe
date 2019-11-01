import { Material } from './material';
import { Author } from './author';
import { Keyword } from './keyword';
import { EducationalLevel } from './educational-level';
import { LearningResourceType } from './learning-resource-type';

export interface EducationalMaterial {
  name: string;
  thumbnail?: string;
  learningResourceTypes: LearningResourceType[];
  authors: Author[];
  description?: string;
  materials?: Material[];
  createdAt: Date;
  publishedAt?: Date;
  updatedAt?: Date;
  timeRequired?: string;
  publisher?: any[]; // @todo: key value?
  license: string;
  keywords: Keyword[];
  educationalLevels: EducationalLevel[];
  educationalRoles?: [{
    educationalrolekey: string;
    educationalrole: string;
  }];
  educationalUses?: [{
    educationalusekey: string;
    value: string;
  }];
  accessibilityFeatures?: [{
    accessibilityfeaturekey: string;
    value: string;
  }];
  accessibilityHazards?: [{
    accessibilityhazardkey: string;
    value: string;
  }];
}
