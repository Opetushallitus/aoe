import { AlignmentObjectExtended } from '@models/alignment-object-extended';

export interface CollectionForm {
  id: string;
  // basic
  name: string;
  keywords: [
    {
      key: string;
      value: string;
    }
  ];
  languages: string[];
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
  description: string;
  // educational
  educationalLevels: [
    {
      key: string;
      value: string;
    }
  ];
  earlyChildhoodEducationSubjects: AlignmentObjectExtended[];
  earlyChildhoodEducationObjectives: AlignmentObjectExtended[];
  earlyChildhoodEducationFramework?: string;
  prePrimaryEducationSubjects: AlignmentObjectExtended[];
  prePrimaryEducationObjectives: AlignmentObjectExtended[];
  prePrimaryEducationFramework?: string;
  basicStudySubjects: AlignmentObjectExtended[];
  basicStudyObjectives: AlignmentObjectExtended[];
  basicStudyContents: AlignmentObjectExtended[];
  basicStudyFramework?: string;
  currentUpperSecondarySchoolSelected: boolean;
  newUpperSecondarySchoolSelected: boolean;
  upperSecondarySchoolSubjects: AlignmentObjectExtended[];
  upperSecondarySchoolObjectives: AlignmentObjectExtended[];
  upperSecondarySchoolFramework?: string;
  upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[];
  upperSecondarySchoolModulesNew: AlignmentObjectExtended[];
  upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[];
  upperSecondarySchoolContentsNew: AlignmentObjectExtended[];
  vocationalDegrees: AlignmentObjectExtended[];
  vocationalUnits: AlignmentObjectExtended[];
  vocationalEducationObjectives: AlignmentObjectExtended[];
  vocationalEducationFramework?: string;
  selfMotivatedEducationSubjects: AlignmentObjectExtended[];
  selfMotivatedEducationObjectives: AlignmentObjectExtended[];
  scienceBranches: AlignmentObjectExtended[];
  scienceBranchObjectives: AlignmentObjectExtended[];
  higherEducationFramework?: string;
  // materials
  materials: CollectionFormMaterial[];
  materialsAndHeadings: CollectionFormMaterialAndHeading[];
}

export interface CollectionFormMaterial {
  id: string;
  authors: CollectionFormMaterialAuthor[];
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

export interface CollectionFormMaterialAuthor {
  author: string;
  organization: {
    key: string;
    value: string;
  };
}

export interface CollectionFormMaterialAndHeading {
  id?: string;
  heading?: string;
  description?: string;
  priority: number;
}
