import { BuildOptions, Model } from 'sequelize';

/**
 * Global interface and type declarations for the data persistence with Sequelize.
 * Data model structures of AOE domain are listed in alphabetical order below.
 */
declare global {
  // EducationalMaterial
  interface EducationalMaterial extends Model, IEducationalMaterial {
    id: string;
    createdat: Date;
    publishedat?: Date;
    updatedat: Date;
    archivedat?: Date;
    timerequired: string;
    agerangemin?: number;
    agerangemax?: number;
    licensecode: string;
    obsoleted: number;
    originalpublishedat: Date;
    usersusername: string;
    expires?: Date;

    // Educational Suitability
    suitsallearlychildhoodsubjects: boolean;
    suitsallpreprimarysubjects: boolean;
    suitsallbasicstudysubjects: boolean;
    suitsalluppersecondarysubjects: boolean;
    suitsallvocationaldegrees: boolean;
    suitsallselfmotivatedsubjects: boolean;
    suitsallbranches: boolean;
    suitsalluppersecondarysubjectsnew: boolean;

    // Counters
    ratingcontentaverage: number;
    ratingvisualaverage: number;
    viewcounter: string;
    downloadcounter: string;
    counterupdatedat: Date;

    // Reference Information
    materials?: Material[];
  }

  type EducationalMaterialType = typeof Model & {
    new (values?: Record<string, unknown>, options?: BuildOptions): EducationalMaterial;
  };

  // Material
  interface Material extends Model {
    id: string;
    link: string;
    educationalMaterialId: string;
    obsoleted: number;
    priority: number;
    materialLanguageKey: string;

    // Reference Information
    materialDisplayNames: MaterialDisplayName[];
    // records: Record[];

    // Temporary Information
    // temporaryRecords: TemporaryRecord[];
  }

  type MaterialType = typeof Model & {
    new (values?: Record<string, unknown>, options?: BuildOptions): Material;
  };

  // MaterialDisplayName
  interface MaterialDisplayName extends Model {
    id: string;
    displayname: string;
    language: string;
    materialid: number;
  }

  type MaterialDisplayNameType = typeof Model & {
    new (values?: Record<string, unknown>, options?: BuildOptions): MaterialDisplayName;
  };
}
