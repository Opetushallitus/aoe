import { BasicStudyContent, BasicStudySubject } from './basic-study-subject';

export interface EducationalResourceData {
  accessibilityFeature?: KeyValue[];
  accessibilityHazard?: KeyValue[];
  authors?: Author[];
  basicStudyContents?: KeyValue[];
  basicStudyObjectives?: BasicStudyContent[];
  basicStudySubjects?: BasicStudySubject[];
  branchesOfScience?: KeyValue[];
  createdAt?: Date;
  description?: I18nString;
  earlyChildhoodEducationSubjects?: string[];
  educationalLevels?: KeyValue[];
  educationalRole?: KeyValue[];
  educationalUse?: KeyValue[];
  expires?: Date;
  files?: File[];
  keywords?: KeyValue[];
  learningResourceType?: KeyValue[];
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
  upperSecondarySchoolSubjects?: KeyValue[];
  vocationalDegrees?: KeyValue[];
}

interface KeyValue {
  key: string;
  value: string;
}

interface Author {
  author: string;
  organisation?: KeyValue;
}

interface I18nString {
  fi?: string;
  en?: string;
  sv?: string;
}

interface File {
  displayName?: I18nString;
  file?: string;
  language?: KeyValue;
  link?: string;
}

interface AgeRange {
  min?: number;
  max?: number;
}
