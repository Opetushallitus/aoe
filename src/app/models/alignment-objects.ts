import { AlignmentObjectExtended } from './alignment-object-extended';

export interface AlignmentObjects {
  earlyChildhoodEducationSubjects: AlignmentObjectExtended[];
  earlyChildhoodEducationObjectives: AlignmentObjectExtended[];
  prePrimaryEducationSubjects: AlignmentObjectExtended[];
  prePrimaryEducationObjectives: AlignmentObjectExtended[];
  basicStudySubjects: AlignmentObjectExtended[];
  basicStudyObjectives: AlignmentObjectExtended[];
  basicStudyContents: AlignmentObjectExtended[];
  upperSecondarySchoolSubjectsOld: AlignmentObjectExtended[];
  upperSecondarySchoolCoursesOld: AlignmentObjectExtended[];
  upperSecondarySchoolObjectives: AlignmentObjectExtended[];
  upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[];
  upperSecondarySchoolModulesNew: AlignmentObjectExtended[];
  upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[];
  upperSecondarySchoolContentsNew: AlignmentObjectExtended[];
  vocationalDegrees: AlignmentObjectExtended[];
  vocationalUnits: AlignmentObjectExtended[];
  vocationalRequirements: AlignmentObjectExtended[];
  selfMotivatedEducationSubjects: AlignmentObjectExtended[];
  selfMotivatedEducationObjectives: AlignmentObjectExtended[];
  scienceBranches: AlignmentObjectExtended[];
  scienceBranchObjectives: AlignmentObjectExtended[];
}
