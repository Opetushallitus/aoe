import { Material } from './material';

export interface EducationalMaterial {
  name: string;
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
}
