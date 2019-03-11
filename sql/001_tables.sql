
DROP TABLE IF EXISTS EducationalMaterialCollectionEducationalMaterial CASCADE;
DROP TABLE IF EXISTS UsersEducationalMaterialCollection CASCADE;
DROP TABLE IF EXISTS isBasedOn CASCADE;
DROP TABLE IF EXISTS EducationalUse CASCADE;
DROP TABLE IF EXISTS Record CASCADE;
DROP TABLE IF EXISTS CollectionEducationalUse CASCADE;
DROP TABLE IF EXISTS CollectionAligmentObject CASCADE;
DROP TABLE IF EXISTS CollectionEducationalFramework CASCADE;
DROP TABLE IF EXISTS CollectionTopic CASCADE;
DROP TABLE IF EXISTS CollectionEducationalLevel CASCADE;
DROP TABLE IF EXISTS CollectionEducationalAudience CASCADE;
DROP TABLE IF EXISTS CollectionLanguage CASCADE;
DROP TABLE IF EXISTS CollectionKeyWords CASCADE;
DROP TABLE IF EXISTS EducationalMaterialCollection CASCADE;
DROP TABLE IF EXISTS KeyWords CASCADE;
DROP TABLE IF EXISTS EducationalLevel CASCADE;
DROP TABLE IF EXISTS Accessibility CASCADE;
DROP TABLE IF EXISTS EducationalRole CASCADE;
DROP TABLE IF EXISTS LearningResourceType CASCADE;
DROP TABLE IF EXISTS AligmentObject CASCADE;
DROP TABLE IF EXISTS InLanguage CASCADE;
DROP TABLE IF EXISTS License CASCADE;
DROP TABLE IF EXISTS EducationalAudience CASCADE;
DROP TABLE IF EXISTS Material CASCADE;
DROP TABLE IF EXISTS EducationalMaterial CASCADE;
DROP TABLE IF EXISTS Logins CASCADE;
DROP TABLE IF EXISTS Users CASCADE;


CREATE TABLE Users (
  Id                      BIGSERIAL NOT NULL, 
  FirstName              text NOT NULL, 
  LastName               text NOT NULL, 
  UserName               text NOT NULL, 
  PreferredLanguage      text NOT NULL, 
  PreferredTargetName    text NOT NULL, 
  PreferredAlignmentType text NOT NULL, 
  PRIMARY KEY (Id));

CREATE TABLE EducationalMaterial (
  Id             BIGSERIAL NOT NULL, 
  materialName  text NOT NULL, 
  slug          text NOT NULL, 
  CreatedAt     date NOT NULL, 
  PublishedAt   date NOT NULL, 
  UpdatedAt     date NOT NULL, 
  Description   text NOT NULL, 
  TechnicalName text NOT NULL, 
  author        text NOT NULL, 
  organization  text NOT NULL, 
  publisher     text NOT NULL, 
  timeRequired  text NOT NULL, 
  agerangeMin   int4 DEFAULT 0 NOT NULL, 
  agerangeMax   int4 DEFAULT 99 NOT NULL, 
  UsersId       int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE Material (
  Id                     BIGSERIAL NOT NULL, 
  MaterialName          text NOT NULL, 
  Link                  text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE EducationalAudience (
  Id                     BIGSERIAL NOT NULL, 
  AudienceName          text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE License (
  Id                     BIGSERIAL NOT NULL, 
  permits               text NOT NULL, 
  prohibits             text NOT NULL, 
  requires              text NOT NULL, 
  license               text NOT NULL, 
  licenseUrl            text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE InLanguage (
  Id                     BIGSERIAL NOT NULL, 
  InLanguage            text NOT NULL, 
  Url                   text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE AligmentObject (
  Id                     BIGSERIAL NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  AligmentType          text NOT NULL, 
  educationalFramework  text NOT NULL, 
  targetDescription     text NOT NULL, 
  targetName            text NOT NULL, 
  targetUrl             text NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE LearningResourceType (
  Id                     BIGSERIAL NOT NULL, 
  ResourceType          text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE EducationalRole (
  Id                     BIGSERIAL NOT NULL, 
  value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE Accessibility (
  Id                     BIGSERIAL NOT NULL, 
  Value                 text NOT NULL, 
  Property              int4 NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE EducationalLevel (
  Id                     BIGSERIAL NOT NULL, 
  value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE KeyWords (
  Id                     BIGSERIAL NOT NULL, 
  value                 int4 NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE EducationalMaterialCollection (
  Id             BIGSERIAL NOT NULL, 
  Name          text NOT NULL, 
  Type          text NOT NULL, 
  CreationDate  date NOT NULL, 
  Description   text NOT NULL, 
  CreatedBy     text NOT NULL, 
  TechnicalName text NOT NULL, 
  AgeRangeMin   int4 DEFAULT 0 NOT NULL, 
  AgeRangeMax   int4 DEFAULT 99 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE CollectionKeyWords (
  Id                               BIGSERIAL NOT NULL, 
  term                            text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE CollectionLanguage (
  Id                               BIGSERIAL NOT NULL, 
  Language                        text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE CollectionEducationalAudience (
  Id                               BIGSERIAL NOT NULL, 
  Audience                        text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE CollectionEducationalLevel (
  Id                               BIGSERIAL NOT NULL, 
  EducationalLevel                text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE CollectionTopic (
  Id                               BIGSERIAL NOT NULL, 
  Topic                           text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE CollectionEducationalFramework (
  Id                               BIGSERIAL NOT NULL, 
  Framework                       text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE CollectionAligmentObject (
  Id                               BIGSERIAL NOT NULL, 
  AligmentType                    text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE CollectionEducationalUse (
  Id                               BIGSERIAL NOT NULL, 
  EducationalUse                  text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE Loki (
  );
CREATE TABLE Record (
  Id                BIGSERIAL NOT NULL, 
  FilePath         text NOT NULL, 
  OriginalFileName text NOT NULL, 
  FileSize         int4 NOT NULL, 
  MimeType         text NOT NULL, 
  Format           text NOT NULL, 
  MaterialId       int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE EducationalUse (
  Id                     BIGSERIAL NOT NULL, 
  value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE isBasedOn (
  Id                     BIGSERIAL NOT NULL, 
  Author                text NOT NULL, 
  Url                   text NOT NULL, 
  MaterialName          text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE UsersEducationalMaterialCollection (
  UsersId                         int8 NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (UsersId, 
  EducationalMaterialCollectionId));
CREATE TABLE EducationalMaterialCollectionEducationalMaterial (
  EducationalMaterialCollectionId int8 NOT NULL, 
  EducationalMaterialId           int8 NOT NULL, 
  PRIMARY KEY (EducationalMaterialCollectionId, 
  EducationalMaterialId));

ALTER TABLE AligmentObject ADD CONSTRAINT FKAligmentObject FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE EducationalMaterial ADD CONSTRAINT FKEducationalMaterial FOREIGN KEY (UsersId) REFERENCES Users (Id) ON DELETE Restrict;
ALTER TABLE License ADD CONSTRAINT FKLicense FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE EducationalAudience ADD CONSTRAINT FKEducationalAudience FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE LearningResourceType ADD CONSTRAINT FKLearningResourceType FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE Accessibility ADD CONSTRAINT FKAccessibility FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE KeyWords ADD CONSTRAINT FKKeyWords FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE EducationalUse ADD CONSTRAINT FKEducationalUse FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE isBasedOn ADD CONSTRAINT FKIsBasedOn FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE InLanguage ADD CONSTRAINT FKInLanguage FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE Material ADD CONSTRAINT FKMaterial FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Restrict;
ALTER TABLE Record ADD CONSTRAINT FKRecord FOREIGN KEY (MaterialId) REFERENCES Material (Id) ON DELETE Restrict;
ALTER TABLE CollectionKeyWords ADD CONSTRAINT FKCollectionKeyWords FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionLanguage ADD CONSTRAINT FKCollectionLanguage FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionEducationalAudience ADD CONSTRAINT FKCollectionEducationalAudience FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionEducationalLevel ADD CONSTRAINT FKCollectionEducationalLevel FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionTopic ADD CONSTRAINT FKCollectionTopic FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionEducationalFramework ADD CONSTRAINT FKCollectionEducationalFramework FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionAligmentObject ADD CONSTRAINT FKCollectionAligmentObject FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionEducationalUse ADD CONSTRAINT FKCollectionEducationalUse FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE EducationalRole ADD CONSTRAINT FKEducationalRole FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE UsersEducationalMaterialCollection ADD CONSTRAINT FKUsersEMC FOREIGN KEY (UsersId) REFERENCES Users (Id) ON DELETE Restrict;
ALTER TABLE UsersEducationalMaterialCollection ADD CONSTRAINT FKEMCUsers FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE EducationalMaterialCollectionEducationalMaterial ADD CONSTRAINT FKEMCMaterial FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE EducationalMaterialCollectionEducationalMaterial ADD CONSTRAINT FKMaterialEMC FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Restrict;
ALTER TABLE EducationalLevel ADD CONSTRAINT FKEducationalLevel FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
