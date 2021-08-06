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
  archivedAt?: Date | null;
  timeRequired?: string;
  expires?: Date | null;
  publisher?: string[];
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
  earlyChildhoodEducationFrameworks: string[];
  earlyChildhoodEducationObjectives: AlignmentObjectExtended[];
  suitsAllEarlyChildhoodSubjects: boolean;
  prePrimaryEducationSubjects: AlignmentObjectExtended[];
  prePrimaryEducationFrameworks: string[];
  prePrimaryEducationObjectives: AlignmentObjectExtended[];
  suitsAllPrePrimarySubjects: boolean;
  basicStudySubjects: AlignmentObjectExtended[];
  basicStudyFrameworks: string[];
  basicStudyObjectives: AlignmentObjectExtended[];
  basicStudyContents: AlignmentObjectExtended[];
  suitsAllBasicStudySubjects: boolean;
  upperSecondarySchoolSubjectsOld: AlignmentObjectExtended[];
  upperSecondarySchoolFrameworks: string[];
  upperSecondarySchoolCoursesOld: AlignmentObjectExtended[];
  upperSecondarySchoolObjectives: AlignmentObjectExtended[];
  suitsAllUpperSecondarySubjects: boolean;
  upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[];
  upperSecondarySchoolFrameworksNew: string[];
  upperSecondarySchoolModulesNew: AlignmentObjectExtended[];
  upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[];
  upperSecondarySchoolContentsNew: AlignmentObjectExtended[];
  suitsAllUpperSecondarySubjectsNew: boolean;
  vocationalDegrees: AlignmentObjectExtended[];
  vocationalFrameworks: string[];
  vocationalUnits: AlignmentObjectExtended[];
  vocationalRequirements: AlignmentObjectExtended[];
  suitsAllVocationalDegrees: boolean;
  selfMotivatedEducationSubjects: AlignmentObjectExtended[];
  selfMotivatedEducationObjectives: AlignmentObjectExtended[];
  suitsAllSelfMotivatedSubjects: boolean;
  branchesOfScience: AlignmentObjectExtended[];
  higherEducationFrameworks: string[];
  scienceBranchObjectives: AlignmentObjectExtended[];
  suitsAllBranches: boolean;
  prerequisites: AlignmentObjectExtended[];
  references?: [{
    authors: string[];
    url: string;
    name: string;
  }];
  owner: boolean;
  ratingContentAverage: string;
  ratingVisualAverage: string;
  hasDownloadableFiles: boolean;
  versions: Date[];
  viewCounter: number;
  downloadCounter: number;
  typicalAgeRange?: {
    typicalAgeRangeMin: number;
    typicalAgeRangeMax: number;
  };
}
