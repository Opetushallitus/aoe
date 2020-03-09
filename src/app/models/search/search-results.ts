export interface SearchResults {
  hits: number;
  results: SearchResult[];
}

export interface SearchResult {
  id: number | string;
  createdAt: Date;
  publishedAt?: Date;
  updatedAt?: Date;
  materialName: [{
    materialname: string;
    language: string;
  }];
  description: [{
    description: string;
    language: string;
  }];
  authors: [{
    authorname?: string;
    organization?: string;
    organizationkey?: string;
  }];
  learningResourceTypes: [{
    value: string;
    learningresourcetypekey: string;
  }];
  license: string;
  educationalLevels: [{
    value: string;
    educationallevelkey: string;
  }];
  educationalRoles?: [{
    value: string;
    educationalrolekey: string;
  }];
  keywords: [{
    value: string;
    keywordkey: string;
  }];
  languages: string[];
  educationalSubjects?: [{
    key: number | string;
    source: string;
    value: string;
  }];
  teaches?: [{
    key: number | string;
    value: string;
  }];
  hasDownloadableFiles: boolean;
  thumbnail?: {
    id: number | string;
    filepath: string;
    mimetype: string;
    educationalmaterialid: number | string;
    filename: string;
    obsoleted: any;
    filekey: string;
    filebucket: string;
  };
}
