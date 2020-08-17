import { AlignmentObjectExtended } from '@models/alignment-object-extended';
import { CollectionFormMaterialAndHeading } from '@models/collections/collection-form';

export interface Collection {
  id: string;
  publishedAt: Date | null;
  updatedAt: Date | null;
  createdAt: Date | null;
  name: string;
  description: string;
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
  educationalMaterials: [
    {
      id: string;
      author: [
        {
          authorname: string;
          organization: string;
          organizationkey: string;
        }
      ];
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
      publishedat: Date;
      description: {
        fi: string;
        sv: string;
        en: string;
      };
      thumbnail: {
        thumbnail?: string;
      } | null;
      learningResourceTypes: [
        {
          id: string;
          value: string;
          educationalmaterialid: string;
          learningresourcetypekey: string;
        }
      ];
    }
  ];
  materialsAndHeadings: CollectionFormMaterialAndHeading[];
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
  owner: boolean;
  educationalLevels: [
    {
      key: string;
      value: string;
    }
  ];
  earlyChildhoodEducationSubjects: AlignmentObjectExtended[];
  earlyChildhoodEducationObjectives: AlignmentObjectExtended[];
  earlyChildhoodEducationFramework: string;
  prePrimaryEducationSubjects: AlignmentObjectExtended[];
  prePrimaryEducationObjectives: AlignmentObjectExtended[];
  prePrimaryEducationFramework: string;
  basicStudySubjects: AlignmentObjectExtended[];
  basicStudyObjectives: AlignmentObjectExtended[];
  basicStudyContents: AlignmentObjectExtended[];
  basicStudyFramework: string;
  upperSecondarySchoolSubjects: AlignmentObjectExtended[];
  upperSecondarySchoolObjectives: AlignmentObjectExtended[];
  upperSecondarySchoolFramework: string;
  upperSecondarySchoolSubjectsNew: AlignmentObjectExtended[];
  upperSecondarySchoolModulesNew: AlignmentObjectExtended[];
  upperSecondarySchoolObjectivesNew: AlignmentObjectExtended[];
  upperSecondarySchoolContentsNew: AlignmentObjectExtended[];
  vocationalDegrees: AlignmentObjectExtended[];
  vocationalUnits: AlignmentObjectExtended[];
  vocationalEducationObjectives: AlignmentObjectExtended[];
  vocationalEducationFramework: string;
  selfMotivatedEducationSubjects: AlignmentObjectExtended[];
  selfMotivatedEducationObjectives: AlignmentObjectExtended[];
  scienceBranches: AlignmentObjectExtended[];
  scienceBranchObjectives: AlignmentObjectExtended[];
  higherEducationFramework: string;
  authors: string[];
}
