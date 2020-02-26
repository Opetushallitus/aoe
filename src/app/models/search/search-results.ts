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
  alignmentObjects?: any;
  educationalLevels: [{
    value: string;
    educationallevelkey: string;
  }];
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
