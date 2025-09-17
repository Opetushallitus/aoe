import { AlignmentObjectExtended } from '@models/alignment-object-extended'
import { Author } from '@models/material/author'
import { ExternalReference } from '@models/material/external-reference'
import { Subtitle } from '@models/material/subtitle'

export interface EducationalMaterialForm {
  // files
  name: {
    fi?: string
    sv?: string
    en?: string
  }
  fileDetails?: [
    {
      id: number
      file?: string
      link?: string
      displayName: {
        fi?: string
        sv?: string
        en?: string
      }
      language: string
      priority: number
      mimeType: string
      subtitles?: Subtitle[]
    }
  ]
  videoFiles?: number[]
  // basic details
  thumbnail?: string
  keywords: [
    {
      key: string
      value?: string
    }
  ]
  authors: Author[]
  learningResourceTypes: [
    {
      key: string
      value?: string
    }
  ]
  educationalRoles?: [
    {
      key: string
      value?: string
    }
  ]
  educationalUses?: [
    {
      key: string
      value?: string
    }
  ]
  description?: {
    fi?: string
    sv?: string
    en?: string
  }
  // educational details
  educationalLevels: [
    {
      key: string
      value?: string
    }
  ]
  earlyChildhoodEducationSubjects?: AlignmentObjectExtended[]
  suitsAllEarlyChildhoodSubjects?: boolean
  earlyChildhoodEducationObjectives?: AlignmentObjectExtended[]
  earlyChildhoodEducationFramework?: string
  prePrimaryEducationSubjects?: AlignmentObjectExtended[]
  suitsAllPrePrimarySubjects?: boolean
  prePrimaryEducationObjectives?: AlignmentObjectExtended[]
  prePrimaryEducationFramework?: string
  basicStudySubjects?: AlignmentObjectExtended[]
  suitsAllBasicStudySubjects?: boolean
  basicStudyObjectives?: AlignmentObjectExtended[]
  basicStudyContents?: AlignmentObjectExtended[]
  basicStudyFramework?: string
  preparatoryEducationSubjects?: AlignmentObjectExtended[]
  preparatoryEducationObjectives?: AlignmentObjectExtended[]
  upperSecondarySchoolSubjectsOld?: AlignmentObjectExtended[]
  upperSecondarySchoolCoursesOld?: AlignmentObjectExtended[]
  suitsAllUpperSecondarySubjects?: boolean
  upperSecondarySchoolObjectives?: AlignmentObjectExtended[]
  upperSecondarySchoolFramework?: string
  upperSecondarySchoolSubjectsNew?: AlignmentObjectExtended[]
  suitsAllUpperSecondarySubjectsNew?: boolean
  upperSecondarySchoolModulesNew?: AlignmentObjectExtended[]
  upperSecondarySchoolObjectivesNew?: AlignmentObjectExtended[]
  upperSecondarySchoolContentsNew?: AlignmentObjectExtended[]
  newUpperSecondarySchoolFramework?: string
  vocationalDegrees?: AlignmentObjectExtended[]
  suitsAllVocationalDegrees?: boolean
  vocationalUnits?: AlignmentObjectExtended[]
  vocationalCommonUnits?: AlignmentObjectExtended[]
  vocationalRequirements?: AlignmentObjectExtended[]
  vocationalEducationFramework?: string
  furtherVocationalQualifications: AlignmentObjectExtended[]
  specialistVocationalQualifications: AlignmentObjectExtended[]
  selfMotivatedEducationSubjects?: AlignmentObjectExtended[]
  suitsAllSelfMotivatedSubjects?: boolean
  selfMotivatedEducationObjectives?: AlignmentObjectExtended[]
  branchesOfScience?: AlignmentObjectExtended[]
  suitsAllBranches?: boolean
  scienceBranchObjectives?: AlignmentObjectExtended[]
  higherEducationFramework?: string
  // extended details
  accessibilityFeatures?: [
    {
      key: string
      value?: string
    }
  ]
  accessibilityHazards?: [
    {
      key: string
      value?: string
    }
  ]
  typicalAgeRange?: {
    typicalAgeRangeMin?: number
    typicalAgeRangeMax?: number
  }
  timeRequired?: string
  publisher?: [
    {
      key: string
      value?: string
    }
  ]
  expires?: Date
  prerequisites?: AlignmentObjectExtended[]
  // license
  license: string
  // references
  externals?: ExternalReference[]
  isVersioned?: boolean
  versions: [
    {
      publishedat: Date
    }
  ]
}
