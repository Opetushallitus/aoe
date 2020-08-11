export interface Collection {
  collection: {
    id: string;
    publishedat: Date | null;
    updatedat: Date | null;
    createdat: Date | null;
    name: string;
    description: string;
  };
  keywords: [
    {
      key: string;
      value: string;
    }
  ];
  languages: string[];
  alignmentObjects: [
    {
      alignmenttype: 'assesses' | 'teaches' | 'requires' | 'textComplexity' | 'readingLevel' | 'educationalSubject' | 'educationalLevel';
      educationalframework: string;
      objectkey: string;
      source: string;
      targetname: string;
      targeturl: string;
    }
  ];
  educationalRoles: [
    {
      key: string;
      value: string;
    }
  ];
  educationalUses: [
    {
      key: string;
      value: string;
    }
  ];
  educationalmaterials: [
    {
      id: string;
      author: [
        {
          authorname: string;
          organization: string;
          organizationkey: string;
        }
      ];
      license: {
        key: string;
        value: string;
      };
      name: {
        fi: string;
        sv: string;
        en: string;
      };
      priority: number;
      publishedat: Date;
      description: {
        fi: string;
        sv: string;
        en: string;
      };
      thumbnail: {
        thumbnail?: string;
      } | null;
      learningResourceTypes: [
        {
          id: string;
          value: string;
          educationalmaterialid: string;
          learningresourcetypekey: string;
        }
      ];
    }
  ];
  accessibilityFeatures: [
    {
      key: string;
      value: string;
    }
  ];
  accessibilityHazards: [
    {
      key: string;
      value: string;
    }
  ];
  headings: [
    {
      heading: string;
      description: string;
      priority: number;
    }
  ];
  owner: boolean;
  educationalLevels: [
    {
      key: string;
      value: string;
    }
  ];
}
