import { KeyValue } from '@angular/common';

import { BasicStudyContent, BasicStudySubject } from './basic-study-subject';

export interface EducationalResourceData {
  accessibilityFeature?: KeyValue<string, string>[];
  accessibilityHazard?: KeyValue<string, string>[];
  authors?: Author[];
  basicStudyContents?: KeyValue<string, string>[];
  basicStudyObjectives?: BasicStudyContent[];
  basicStudySubjects?: BasicStudySubject[];
  branchesOfScience?: KeyValue<string, string>[];
  createdAt?: Date;
  description?: I18nString;
  earlyChildhoodEducationSubjects?: string[];
  educationalLevels?: KeyValue<string, string>[];
  educationalRole?: KeyValue<string, string>[];
  educationalUse?: KeyValue<string, string>[];
  expires?: Date;
  files?: File[];
  keywords?: KeyValue<string, string>[];
  learningResourceType?: KeyValue<string, string>[];
  license?: string;
  name?: I18nString;
  prePrimaryEducationSubjects?: string[];
  publisher?: string;
  scienceBranchObjectives?: string[];
  selfMotivatedEducationSubjects?: string[];
  slug?: I18nString;
  thumbnail?: string;
  timeRequired?: string;
  typicalAgeRange?: AgeRange;
  upperSecondarySchoolSubjects?: KeyValue<string, string>[];
  vocationalDegrees?: KeyValue<string, string>[];
}

interface Author {
  author: string;
  organization?: KeyValue<string, string>;
}

interface I18nString {
  fi?: string;
  en?: string;
  sv?: string;
}

interface File {
  displayName?: I18nString;
  file?: string;
  language?: KeyValue<string, string>;
  link?: string;
}

interface AgeRange {
  min?: number;
  max?: number;
}
