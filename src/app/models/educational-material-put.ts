import { AlignmentObjectExtended } from '@models/alignment-object-extended';

export interface EducationalMaterialPut {
  name: {
    fi: string;
    sv: string;
    en: string;
  };
  description: {
    fi: string;
    sv: string;
    en: string;
  };
  keywords: [
    {
      key: string;
      value: string;
    }
  ];
  authors: [
    {
      author: string;
      organization: {
        key: string;
        value: string;
      };
    }
  ];
  learningResourceTypes: [
    {
      key: string;
      value: string;
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
  educationalLevels: [
    {
      key: string;
      value: string;
    }
  ];
  suitsAllEarlyChildhoodSubjects: boolean;
  suitsAllPrePrimarySubjects: boolean;
  suitsAllBasicStudySubjects: boolean;
  suitsAllUpperSecondarySubjects: boolean;
  suitsAllUpperSecondarySubjectsNew: boolean;
  suitsAllVocationalDegrees: boolean;
  suitsAllSelfMotivatedSubjects: boolean;
  suitsAllBranches: boolean;
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
  typicalAgeRange: {
    typicalAgeRangeMin: number;
    typicalAgeRangeMax: number;
  };
  timeRequired: string;
  publisher: [
    {
      key: string;
      value: string;
    }
  ];
  expires: Date;
  license: string;
  externals: [
    {
      author: string[];
      url: string;
      name: string;
    }
  ];
  isVersioned: boolean;
  materials: Material[];
  fileDetails: FileDetail[];
  attachmentDetails: AttachmentDetail[];
  alignmentObjects: AlignmentObjectExtended[];
}

export interface Material {
  materialId: number | string;
  priority: number;
}

export interface FileDetail {
  id: number;
  displayName: {
    fi: string;
    sv: string;
    en: string;
  };
  language: string;
}

export interface AttachmentDetail {
  id: number;
  default: boolean;
  kind: string;
  label: string;
  lang: string;
}
