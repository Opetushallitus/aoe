import { Sequelize, DataTypes } from 'sequelize';
import { ModelAttributes, ModelOptions } from 'sequelize';
import { rdbms } from '../resources';
import { winstonLogger } from '../util';

export const sequelize = new Sequelize(rdbms.pgURL, {
  dialect: 'postgres',
  logging: (sql: string) => {
    winstonLogger.debug(sql);
  },
});

const commonSettings = {
  freezeTableName: true,
  timestamps: false,
};

const EducationalMaterial = <EducationalMaterialType>sequelize.define(
  'educationalmaterial',
  {
    id: {
      field: 'id',
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    createdat: {
      field: 'createdat',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    publishedat: {
      field: 'publishedat',
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedat: {
      field: 'updatedat',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    archivedat: {
      field: 'archivedat',
      type: DataTypes.DATE,
      allowNull: true,
    },
    timerequired: {
      field: 'timerequired',
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    agerangemin: {
      field: 'agerangemin',
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    agerangemax: {
      field: 'agerangemax',
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    licensecode: {
      field: 'licensecode',
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    obsoleted: {
      field: 'obsoleted',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    originalpublishedat: {
      field: 'originalpublishedat',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    usersusername: {
      field: 'usersusername',
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires: {
      field: 'expires',
      type: DataTypes.DATE,
      allowNull: true,
    },
    suitsallearlychildhoodsubjects: {
      field: 'suitsallearlychildhoodsubjects',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    suitsallpreprimarysubjects: {
      field: 'suitsallpreprimarysubjects',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    suitsallbasicstudysubjects: {
      field: 'suitsallbasicstudysubjects',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    suitsalluppersecondarysubjects: {
      field: 'suitsalluppersecondarysubjects',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    suitsallvocationaldegrees: {
      field: 'suitsallvocationaldegrees',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    suitsallselfmotivatedsubjects: {
      field: 'suitsallselfmotivatedsubjects',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    suitsallbranches: {
      field: 'suitsallbranches',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    suitsalluppersecondarysubjectsnew: {
      field: 'suitsalluppersecondarysubjectsnew',
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ratingcontentaverage: {
      field: 'ratingcontentaverage',
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    ratingvisualaverage: {
      field: 'ratingvisualaverage',
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    viewcounter: {
      field: 'viewcounter',
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0,
    },
    downloadcounter: {
      field: 'downloadcounter',
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0,
    },
    counterupdatedat: {
      field: 'counterupdatedat',
      type: DataTypes.DATE,
      allowNull: true,
    },
  } as ModelAttributes<EducationalMaterial, unknown>,
  commonSettings as ModelOptions,
);

const Material = <MaterialType>sequelize.define(
  'material',
  {
    id: {
      field: 'id',
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    link: {
      field: 'link',
      type: DataTypes.TEXT,
      allowNull: false,
    },
    educationalmaterialid: {
      field: 'educationalmaterialid',
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: EducationalMaterial, // Can be the table name 'educationalmaterial' or the Sequelize model Language
        key: 'id',
      },
    },
    obsoleted: {
      field: 'obsoleted',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    priority: {
      field: 'priority',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    materiallanguagekey: {
      field: 'materiallanguagekey',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  } as ModelAttributes<Material, unknown>,
  commonSettings as ModelOptions,
);

const MaterialDisplayName = <MaterialDisplayNameType>sequelize.define(
  'materialdisplayname',
  {
    id: {
      field: 'id',
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    displayname: {
      field: 'displayname',
      type: DataTypes.TEXT,
      allowNull: false,
    },
    language: {
      field: 'language',
      type: DataTypes.TEXT,
      allowNull: false,
    },
    materialid: {
      field: 'materialid',
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Material, // Can be the table name 'material' or the Sequelize model Language
        key: 'id',
      },
    },
  } as ModelAttributes<MaterialDisplayName, unknown>,
  commonSettings as ModelOptions,
);

// EducationalMaterial <=> Material
EducationalMaterial.hasMany(Material, {
  foreignKey: 'educationalmaterialid',
  as: 'materials',
});
Material.belongsTo(EducationalMaterial, {
  foreignKey: 'educationalmaterialid',
});

Material.hasMany(MaterialDisplayName, {
  foreignKey: 'materialid',
  as: 'materialdisplaynames',
});
MaterialDisplayName.belongsTo(Material);

export { EducationalMaterial, Material, MaterialDisplayName };
