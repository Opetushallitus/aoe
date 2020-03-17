export interface EducationalMaterialForm {
  // files
  name: {
    fi?: string;
    sv?: string;
    en?: string;
  };
  files: [
    {
      file?: File;
      link?: string;
      language: string;
      displayName: {
        fi?: string;
        sv?: string;
        en?: string;
      };
      subtitles?: [
        {
          file: File;
          default: boolean;
          kind: 'subtitles';
          label: string;
          srclang: string;
        }
      ];
    }
  ];
  // basic details
  keywords: [
    {
      key: string;
      value: string;
    }
  ];
  authors: [
    {
      author?: string;
      organization?: string;
    }
  ];
  learningResourceTypes: [
    {
      key: string;
      value: string;
    }
  ];
  educationalRoles?: [
    {
      key: string;
      value: string;
    }
  ];
  educationalUses?: [
    {
      key: string;
      value: string;
    }
  ];
  description?: {
    fi?: string;
    sv?: string;
    en?: string;
  };
  // educational details
  educationalLevels: [
    {
      key: string;
      value: string;
    }
  ];
  // extended details
  // license
  // references
}
