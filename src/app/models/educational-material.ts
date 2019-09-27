import { Material } from './material';

export interface EducationalMaterial {
  name: string;
  thumbnail?: string;
  learningResourceTypes: string[];
  authors: [{
    authorname: string;
    organization?: string;
  }];
  description?: string;
  materials?: Material[];
  createdAt: Date;
  publishedAt?: Date;
  updatedAt?: Date;
  timeRequired?: string;
  publisher?: any[]; // @todo: key value?
  license: string;
  keywords: [{
    keywordkey: string;
    value: string;
  }];
  educationalLevels: [{
    educationallevelkey: string;
    value: string;
  }];
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
