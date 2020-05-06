import { Material } from './material';
import { Author } from './author';
import { Keyword } from './keyword';
import { EducationalLevel } from './educational-level';
import { LearningResourceType } from './learning-resource-type';
import { AlignmentObjectExtended } from './alignment-object-extended';

export interface EducationalMaterial {
  name: [{
    materialname: string;
    language: string;
  }];
  thumbnail?: string;
  learningResourceTypes: LearningResourceType[];
  authors: Author[];
  description?: [{
    description: string;
    language: string;
  }];
  materials?: Material[];
  createdAt: Date;
  publishedAt?: Date;
  updatedAt?: Date;
  timeRequired?: string;
  publisher?: any[]; // @todo: key value?
  license: {
    key: string;
    value: string;
  };
  keywords: Keyword[];
  educationalLevels: EducationalLevel[];
  educationalRoles?: [{
    educationalrolekey: string;
    educationalrole: string;
  }];
  educationalUses?: [{
    educationalusekey: string;
    value: string;
  }];
  accessibilityFeatures?: [{
    accessibilityfeaturekey: string;
    value: string;
  }];
  accessibilityHazards?: [{
    accessibilityhazardkey: string;
    value: string;
  }];
  earlyChildhoodEducationSubjects: AlignmentObjectExtended[];
  earlyChildhoodEducationObjectives: AlignmentObjectExtended[];
  prePrimaryEducationSubjects: AlignmentObjectExtended[];
  prePrimaryEducationObjectives: AlignmentObjectExtended[];
  basicStudySubjects: AlignmentObjectExtended[];
  basicStudyObjectives: AlignmentObjectExtended[];
  basicStudyContents: AlignmentObjectExtended[];
  upperSecondarySchoolSubjects: AlignmentObjectExtended[];
  upperSecondarySchoolObjectives: AlignmentObjectExtended[];
  upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[];
  upperSecondarySchoolModulesNew: AlignmentObjectExtended[];
  upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[];
  upperSecondarySchoolContentsNew: AlignmentObjectExtended[];
  vocationalDegrees: AlignmentObjectExtended[];
  vocationalUnits: AlignmentObjectExtended[];
  vocationalEducationObjectives: AlignmentObjectExtended[];
  selfMotivatedEducationSubjects: AlignmentObjectExtended[];
  selfMotivatedEducationObjectives: AlignmentObjectExtended[];
  branchesOfScience: AlignmentObjectExtended[];
  scienceBranchObjectives: AlignmentObjectExtended[];
  prerequisites: AlignmentObjectExtended[];
  references?: [{
    authors: string[];
    url: string;
    name: string;
  }];
  owner: boolean;
}
