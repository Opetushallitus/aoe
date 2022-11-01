import { Author } from './author';
import { Keyword } from './keyword';
import { EducationalLevel } from './educational-level';
import { LearningResourceType } from './learning-resource-type';

export interface EducationalMaterialCard {
    id: number;
    name: {
        fi: string;
        sv: string;
        en: string;
    };
    slug?: string;
    thumbnail?: string;
    learningResourceTypes: LearningResourceType[];
    authors: Author[];
    description?: {
        fi: string;
        sv: string;
        en: string;
    };
    license: {
        key: string;
        value: string;
    };
    keywords: Keyword[];
    educationalLevels: EducationalLevel[];
    publishedAt?: Date;
    expires: Date | null;
    viewCounter?: number;
    downloadCounter?: number;
}
