export interface AlignmentObjectExtended {
    key?: string | number;
    parent?: string | number;
    gradeEntity?: number;
    source?: string;
    alignmentType: AlignmentType;
    educationalFramework?: string;
    targetDescription?: string;
    targetName: string;
    targetUrl?: string;
    children?: AlignmentObjectExtended[];
}

export enum AlignmentType {
    assesses = 'assesses',
    teaches = 'teaches',
    requires = 'requires',
    textComplexity = 'textComplexity',
    readingLevel = 'readingLevel',
    educationalSubject = 'educationalSubject',
    educationalLevel = 'educationalLevel',
}
