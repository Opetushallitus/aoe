import { AlignmentObjectExtended } from '@models/alignment-object-extended';

export interface CollectionForm {
  name: string;
  keywords: [
    {
      key: string;
      value: string;
    }
  ];
  languages: string[];
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
  materials: [
    {
      id: string;
      authors: [
        {
          author: string;
          organization: {
            key: string;
            value: string;
          };
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
  description: string;
}
