import { AlignmentObjectExtended } from '../alignment-object-extended';

export interface UpdateCollectionPut {
  collectionId: string;
  publish: boolean;
  description: string;
  name: string;
  materials: [
    {
      id: string;
      priority: number;
    }
  ];
  headings: [
    {
      heading: string;
      description: string;
      priority: number;
    }
  ];
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
  alignmentObjects: AlignmentObjectExtended[];
  educationalUses: [
    {
      key: string;
      value: string;
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
  educationalLevels: [
    {
      key: string;
      value: string;
    }
  ];
}
