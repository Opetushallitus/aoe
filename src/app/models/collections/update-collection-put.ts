import { AlignmentObjectExtended } from '../alignment-object-extended';

export interface UpdateCollectionPut {
  collectionId: string;
  publish: boolean;
  description: string;
  name: string;
  materials: UpdateCollectionPutMaterial[];
  headings: UpdateCollectionPutHeading[];
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

export interface UpdateCollectionPutMaterial {
  id: string;
  priority: number;
}

export interface UpdateCollectionPutHeading {
  heading: string;
  description: string;
  priority: number;
}

