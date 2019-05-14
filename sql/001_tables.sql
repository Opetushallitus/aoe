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
DROP TABLE IF EXISTS CollectionKeyWord CASCADE;
DROP TABLE IF EXISTS EducationalMaterialCollection CASCADE;
DROP TABLE IF EXISTS KeyWord CASCADE;
DROP TABLE IF EXISTS EducationalLevel CASCADE;
DROP TABLE IF EXISTS AccessibilityControl CASCADE;
DROP TABLE IF EXISTS AccessibilityAPI CASCADE;
DROP TABLE IF EXISTS AccessibilityHazard CASCADE;
DROP TABLE IF EXISTS AccessibilityFeature CASCADE;
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
DROP TABLE IF EXISTS Publisher CASCADE;
DROP TABLE IF EXISTS MaterialName CASCADE;
DROP TABLE IF EXISTS MaterialDescription CASCADE;

CREATE TABLE Users (
  Id                      BIGSERIAL NOT NULL, 
  FirstName              text NOT NULL, 
  LastName               text NOT NULL, 
  UserName               text NOT NULL UNIQUE, 
  PreferredLanguage      text NOT NULL, 
  PreferredTargetName    text NOT NULL, 
  PreferredAlignmentType text NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE Logins (
  Id            BIGSERIAL NOT NULL, 
  UserName     varchar(255) NOT NULL, 
  PasswordSalt varchar(255) NOT NULL, 
  PasswordHash varchar(255) NOT NULL, 
  UsersId      int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE EducationalMaterial (
  Id                   BIGSERIAL NOT NULL, 
  CreatedAt           date DEFAULT CURRENT_DATE NOT NULL, 
  PublishedAt         date DEFAULT '9999-01-01T00:00:00+03:00' NOT NULL, 
  UpdatedAt           date DEFAULT CURRENT_DATE NOT NULL, 
  ArchivedAt          date DEFAULT '9999-01-01T00:00:00+03:00' NOT NULL, 
  TechnicalName       text NOT NULL, 
  Author              text NOT NULL, 
  Organization        text NOT NULL, 
  TimeRequired        text NOT NULL, 
  AgeRangeMin         int4 DEFAULT 0 NOT NULL, 
  AgeRangeMax         int4 DEFAULT 99 NOT NULL, 
  UsersId             int8 NOT NULL, 
  LicenseCode         text NOT NULL, 
  Obsoleted           int4 DEFAULT 0 NOT NULL, 
  Thumbnail           bytea, 
  OriginalPublishedAt date DEFAULT CURRENT_DATE NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE Material (
  Id                     BIGSERIAL NOT NULL, 
  MaterialName          text NOT NULL, 
  Link                  text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  Obsoleted             int4 DEFAULT 0 NOT NULL, 
  Priority              int4 DEFAULT 0 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE EducationalAudience (
  Id                     BIGSERIAL NOT NULL, 
  EducationalRole       text NOT NULL, 
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
  AlignmentType          text NOT NULL, 
  EducationalFramework  text NOT NULL, 
  TargetDescription     text NOT NULL, 
  TargetName            text NOT NULL, 
  TargetUrl             text NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE LearningResourceType (
  Id                     BIGSERIAL NOT NULL, 
  Value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE AccessibilityControl (
  Id                     BIGSERIAL NOT NULL, 
  Value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE AccessibilityAPI (
  Id                     BIGSERIAL NOT NULL, 
  Value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE AccessibilityHazard (
  Id                     BIGSERIAL NOT NULL, 
  Value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE AccessibilityFeature (
  Id                     BIGSERIAL NOT NULL, 
  Value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));

CREATE TABLE EducationalLevel (
  Id                     BIGSERIAL NOT NULL, 
  Value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE KeyWord (
  Id                     BIGSERIAL NOT NULL, 
  Value                 text NOT NULL, 
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
CREATE TABLE CollectionKeyWord (
  Id                               BIGSERIAL NOT NULL, 
  Value                           text NOT NULL, 
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
  AlignmentType                    text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE CollectionEducationalUse (
  Id                               BIGSERIAL NOT NULL, 
  EducationalUse                  text NOT NULL, 
  EducationalMaterialCollectionId int8 NOT NULL, 
  PRIMARY KEY (Id));
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
  Value                 text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (Id));
CREATE TABLE IsBasedOn (
  Id                     BIGSERIAL NOT NULL, 
  Author                text NOT NULL, 
  Url                   text NOT NULL, 
  MaterialName          text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  aoeid                 text NOT NULL, 
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
CREATE TABLE Publisher (
  id                     BIGSERIAL NOT NULL, 
  name                  text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (id));
CREATE TABLE MaterialDescription (
  id                     BIGSERIAL NOT NULL, 
  Description           text NOT NULL, 
  Language              text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (id));
CREATE TABLE MaterialName (
  id                     BIGSERIAL NOT NULL, 
  MaterialName          text NOT NULL, 
  Language              text NOT NULL, 
  Slug                  text NOT NULL, 
  EducationalMaterialId int8 NOT NULL, 
  PRIMARY KEY (id));
ALTER TABLE Logins ADD CONSTRAINT FKLogins FOREIGN KEY (UsersId) REFERENCES Users (Id) ON DELETE Cascade;
ALTER TABLE AligmentObject ADD CONSTRAINT FKAligmentObject FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE EducationalMaterial ADD CONSTRAINT FKEducationalMaterial FOREIGN KEY (UsersId) REFERENCES Users (Id) ON DELETE Restrict;
ALTER TABLE EducationalAudience ADD CONSTRAINT FKEducationalAudience FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE LearningResourceType ADD CONSTRAINT FKLearningResourceType FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE KeyWord ADD CONSTRAINT FKKeyWord FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE EducationalUse ADD CONSTRAINT FKEducationalUse FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE IsBasedOn ADD CONSTRAINT FKIsBasedOn FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE InLanguage ADD CONSTRAINT FKInLanguage FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE Material ADD CONSTRAINT FKMaterial FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Restrict;
ALTER TABLE Record ADD CONSTRAINT FKRecord FOREIGN KEY (MaterialId) REFERENCES Material (Id) ON DELETE Restrict;
ALTER TABLE CollectionKeyWord ADD CONSTRAINT FKCollectionKeyWord FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionLanguage ADD CONSTRAINT FKCollectionLanguage FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionEducationalAudience ADD CONSTRAINT FKCollectionEducationalAudience FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionEducationalLevel ADD CONSTRAINT FKCollectionEducationalLevel FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionTopic ADD CONSTRAINT FKCollectionTopic FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionEducationalFramework ADD CONSTRAINT FKCollectionEducationalFramework FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionAligmentObject ADD CONSTRAINT FKCollectionAligmentObject FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE CollectionEducationalUse ADD CONSTRAINT FKCollectionEducationalUse FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE UsersEducationalMaterialCollection ADD CONSTRAINT FKUsersEMC FOREIGN KEY (UsersId) REFERENCES Users (Id) ON DELETE Restrict;
ALTER TABLE UsersEducationalMaterialCollection ADD CONSTRAINT FKEMCUsers FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE EducationalMaterialCollectionEducationalMaterial ADD CONSTRAINT FKEMCMaterial FOREIGN KEY (EducationalMaterialCollectionId) REFERENCES EducationalMaterialCollection (Id) ON DELETE Cascade;
ALTER TABLE EducationalMaterialCollectionEducationalMaterial ADD CONSTRAINT FKMaterialEMC FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Restrict;
ALTER TABLE EducationalLevel ADD CONSTRAINT FKEducationalLevel FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE Publisher ADD CONSTRAINT FKPublisher FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
ALTER TABLE MaterialDescription ADD CONSTRAINT FKDescription FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
ALTER TABLE MaterialName ADD CONSTRAINT FKMaterialName FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
ALTER TABLE AccessibilityFeature ADD CONSTRAINT FKAccessibilityFeature FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE AccessibilityHazard ADD CONSTRAINT FKAccessibilityHazard FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
ALTER TABLE AccessibilityAPI ADD CONSTRAINT FKAccessibilityAPI FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
ALTER TABLE AccessibilityControl ADD CONSTRAINT FKAccessibilityControl FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);