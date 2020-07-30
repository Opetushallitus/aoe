import { AlignmentObjectExtended } from '@models/alignment-object-extended';

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
  alignmentObjects: AlignmentObjectExtended[];
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
    }
  ];
  accessibilityFeatures?: [
    {
      key: string;
      value: string;
    }
  ];
  accessibilityHazards?: [
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
}
