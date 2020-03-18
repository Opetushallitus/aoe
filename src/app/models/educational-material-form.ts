import { AlignmentObjectExtended } from '@models/alignment-object-extended';

export interface EducationalMaterialForm {
  // files
  name: {
    fi?: string;
    sv?: string;
    en?: string;
  };
  files?: [
    {
      id: string;
      file?: string;
      link?: string;
      language: string;
      displayName: {
        fi?: string;
        sv?: string;
        en?: string;
      };
      priority: number;
      subtitles?: [
        {
          file: string;
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
      organization?: {
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
  earlyChildhoodEducationSubjects?: AlignmentObjectExtended[];
  suitsAllEarlyChildhoodSubjects?: boolean;
  earlyChildhoodEducationObjectives?: AlignmentObjectExtended[];
  earlyChildhoodEducationFramework?: string;
  prePrimaryEducationSubjects?: AlignmentObjectExtended[];
  suitsAllPrePrimarySubjects?: boolean;
  prePrimaryEducationObjectives?: AlignmentObjectExtended[];
  prePrimaryEducationFramework?: string;
  basicStudySubjects?: AlignmentObjectExtended[];
  suitsAllBasicStudySubjects?: boolean;
  basicStudyObjectives?: AlignmentObjectExtended[];
  basicStudyContents?: AlignmentObjectExtended[];
  basicStudyFramework?: string;
  upperSecondarySchoolSubjects?: AlignmentObjectExtended[];
  suitsAllUpperSecondarySubjects?: boolean;
  upperSecondarySchoolObjectives?: AlignmentObjectExtended[];
  upperSecondarySchoolFramework?: string;
  upperSecondarySchoolSubjectsNew?: AlignmentObjectExtended[];
  suitsAllUpperSecondarySubjectsNew?: boolean;
  upperSecondarySchoolModulesNew?: AlignmentObjectExtended[];
  upperSecondarySchoolObjectivesNew?: AlignmentObjectExtended[];
  upperSecondarySchoolContentsNew?: AlignmentObjectExtended[];
  vocationalDegrees?: AlignmentObjectExtended[];
  suitsAllVocationalDegrees?: boolean;
  vocationalUnits?: AlignmentObjectExtended[];
  vocationalEducationObjectives?: AlignmentObjectExtended[];
  vocationalEducationFramework?: string;
  selfMotivatedEducationSubjects?: AlignmentObjectExtended[];
  suitsAllSelfMotivatedSubjects?: boolean;
  selfMotivatedEducationObjectives?: AlignmentObjectExtended[];
  branchesOfScience?: AlignmentObjectExtended[];
  suitsAllBranches?: boolean;
  scienceBranchObjectives?: AlignmentObjectExtended[];
  higherEducationFramework?: string;
  // extended details
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
  typicalAgeRange?: {
    typicalAgeRangeMin?: number;
    typicalAgeRangeMax?: number;
  };
  timeRequired?: string;
  publisher?: [
    {
      key: string;
      value: string;
    }
  ];
  expires?: Date;
  prerequisites?: AlignmentObjectExtended[];
  // license
  license: string;
  // references
  externals?: [
    {
      author: string[];
      url: string;
      name: string;
    }
  ];
}
