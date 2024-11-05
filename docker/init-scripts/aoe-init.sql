CREATE TYPE lang AS ENUM ('fi', 'en', 'sv');


CREATE TABLE Users
(
    Id                     BIGSERIAL            NOT NULL,
    FirstName              text                 NOT NULL,
    LastName               text                 NOT NULL,
    UserName               text                 NOT NULL,
    PreferredLanguage      lang    DEFAULT 'fi' NOT NULL,
    PreferredTargetName    text                 NOT NULL,
    PreferredAlignmentType text                 NOT NULL,
    TermsOfUsage           bool    DEFAULT '0'  NOT NULL,
    email                  text,
    verifiedemail          BOOLEAN DEFAULT false,
    newratings             BOOLEAN DEFAULT false,
    almostexpired          BOOLEAN DEFAULT false,
    termsupdated           BOOLEAN DEFAULT false,
    allowtransfer          BOOLEAN DEFAULT false,
    PRIMARY KEY (UserName)
);

CREATE TABLE EducationalMaterial
(
    Id                                BIGSERIAL                                          NOT NULL,
    CreatedAt                         timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PublishedAt                       timestamp with time zone,
    UpdatedAt                         timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ArchivedAt                        timestamp with time zone,
    TimeRequired                      text                     DEFAULT ''                NOT NULL,
    AgeRangeMin                       INTEGER,
    AgeRangeMax                       INTEGER,
    LicenseCode                       text                     DEFAULT ''                NOT NULL,
    Obsoleted                         INTEGER                  DEFAULT 0                 NOT NULL,
    OriginalPublishedAt               timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UsersUserName                     text                                               NOT NULL,
    Expires                           timestamp with time zone,
    SuitsAllEarlyChildhoodSubjects    bool                     DEFAULT 'false'           NOT NULL,
    SuitsAllPrePrimarySubjects        bool                     DEFAULT 'false'           NOT NULL,
    SuitsAllBasicStudySubjects        bool                     DEFAULT 'false'           NOT NULL,
    SuitsAllUpperSecondarySubjects    bool                     DEFAULT 'false'           NOT NULL,
    SuitsAllVocationalDegrees         bool                     DEFAULT 'false'           NOT NULL,
    SuitsAllSelfMotivatedSubjects     bool                     DEFAULT 'false'           NOT NULL,
    SuitsAllBranches                  bool                     DEFAULT 'false'           NOT NULL,
    SuitsAllUpperSecondarySubjectsNew bool                     DEFAULT 'false'           NOT NULL,
    RatingContentAverage              NUMERIC(2, 1),
    RatingVisualAverage               NUMERIC(2, 1),
    viewcounter                       BIGINT                   DEFAULT 0,
    downloadcounter                   BIGINT                   DEFAULT 0,
    counterupdatedat                  timestamp with time zone,
    PRIMARY KEY (Id)
);


CREATE TABLE Material
(
    Id                    BIGSERIAL                  NOT NULL,
    Link                  text                       NOT NULL,
    EducationalMaterialId BIGINT                     NOT NULL,
    Obsoleted             INTEGER DEFAULT 0          NOT NULL,
    Priority              INTEGER DEFAULT 0          NOT NULL,
    MaterialLanguageKey   TEXT    DEFAULT 'fi'::lang NOT NULL,
    PRIMARY KEY (Id)
);


CREATE TABLE EducationalAudience
(
    Id                    BIGSERIAL NOT NULL,
    EducationalRole       text      NOT NULL,
    EducationalMaterialId BIGINT    NOT NULL,
    EducationalRoleKey    text      NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE InLanguage
(
    Id                    BIGSERIAL NOT NULL,
    InLanguage            text      NOT NULL,
    Url                   text      NOT NULL,
    EducationalMaterialId BIGINT    NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE AlignmentObject
(
    Id                    BIGSERIAL       NOT NULL,
    EducationalMaterialId BIGINT          NOT NULL,
    AlignmentType         text            NOT NULL,
    TargetName            text            NOT NULL,
    Source                text            NOT NULL,
    EducationalFramework  text DEFAULT '' NOT NULL,
    ObjectKey             text            NOT NULL,
    TargetUrl             text,
    PRIMARY KEY (Id)
);

CREATE TABLE LearningResourceType
(
    Id                      BIGSERIAL NOT NULL,
    Value                   text      NOT NULL,
    EducationalMaterialId   BIGINT    NOT NULL,
    LearningResourceTypeKey text,
    PRIMARY KEY (Id)
);

CREATE TABLE AccessibilityHazard
(
    Id                     BIGSERIAL NOT NULL,
    Value                  text      NOT NULL,
    EducationalMaterialId  BIGINT    NOT NULL,
    AccessibilityHazardKey text      NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE AccessibilityFeature
(
    Id                      BIGSERIAL NOT NULL,
    Value                   text      NOT NULL,
    EducationalMaterialId   BIGINT    NOT NULL,
    AccessibilityFeatureKey text      NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE EducationalLevel
(
    Id                    BIGSERIAL NOT NULL,
    Value                 text      NOT NULL,
    EducationalMaterialId BIGINT    NOT NULL,
    EducationalLevelKey   text      NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE KeyWord
(
    Id                    BIGSERIAL NOT NULL,
    Value                 text      NOT NULL,
    EducationalMaterialId BIGINT    NOT NULL,
    KeywordKey            text      NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE Record
(
    Id               BIGSERIAL NOT NULL,
    FilePath         text,
    OriginalFileName text      NOT NULL,
    FileSize         BIGINT    NOT NULL,
    MimeType         text      NOT NULL,
    Format           text, -- NOT IN SEQUALIZE MODEL
    MaterialId       BIGINT    NOT NULL,
    FileKey          text,
    FileBucket       text,
    pdfkey           text,
    PRIMARY KEY (Id)
);

CREATE TABLE EducationalUse
(
    Id                    BIGSERIAL NOT NULL,
    Value                 text      NOT NULL,
    EducationalMaterialId BIGINT    NOT NULL,
    EducationalUseKey     text      NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE IsBasedOn
(
    Id                    BIGSERIAL NOT NULL,
    Url                   text      NOT NULL,
    MaterialName          text      NOT NULL,
    EducationalMaterialId BIGINT    NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE Publisher
(
    Id                    BIGSERIAL NOT NULL,
    Name                  text      NOT NULL,
    EducationalMaterialId BIGINT    NOT NULL,
    PublisherKey          text      NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE MaterialDescription
(
    Id                    BIGSERIAL NOT NULL,
    Description           text      NOT NULL,
    Language              lang      NOT NULL,
    EducationalMaterialId BIGINT    NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE MaterialName
(
    Id                    BIGSERIAL       NOT NULL,
    MaterialName          text DEFAULT '' NOT NULL,
    Language              lang            NOT NULL,
    Slug                  text DEFAULT '' NOT NULL,
    EducationalMaterialId BIGINT          NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE Author
(
    Id                    BIGSERIAL NOT NULL,
    authorname            text      NOT NULL,
    organization          text      NOT NULL,
    EducationalMaterialId BIGINT    NOT NULL,
    organizationkey       text      NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE MaterialDisplayName
(
    Id          BIGSERIAL NOT NULL,
    DisplayName text      NOT NULL,
    Language    lang      NOT NULL,
    MaterialId  BIGINT    NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE temporaryrecord
(
    Id               BIGSERIAL                                          NOT NULL,
    FilePath         text                                               NOT NULL,
    OriginalFileName text                                               NOT NULL,
    Filesize         INTEGER,
    Mimetype         text                                               NOT NULL,
    Format           text                                               NOT NULL,
    FileName         text                                               NOT NULL,
    MaterialId       BIGINT                                             NOT NULL,
    CreatedAt        timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE Thumbnail
(
    Id                    BIGSERIAL         NOT NULL,
    FilePath              text              NOT NULL,
    MimeType              text              NOT NULL,
    EducationalMaterialId BIGINT            NOT NULL,
    FileName              text              NOT NULL,
    Obsoleted             INTEGER DEFAULT 0 NOT NULL,
    FileKey               text              NOT NULL,
    FileBucket            text              NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE Attachment
(
    Id               BIGSERIAL         NOT NULL,
    FilePath         text,
    OriginalFileName text              NOT NULL,
    FileSize         INTEGER           NOT NULL,
    MimeType         text              NOT NULL,
    Format           text              NOT NULL,
    FileKey          text,
    FileBucket       text,
    DefaultFile      bool              NOT NULL,
    Kind             text              NOT NULL,
    Label            text              NOT NULL,
    Srclang          text              NOT NULL,
    MaterialId       BIGINT            NOT NULL,
    Obsoleted        INTEGER DEFAULT 0 NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE TemporaryAttachment
(
    Id               BIGSERIAL                                          NOT NULL,
    FilePath         text                                               NOT NULL,
    OriginalFileName text                                               NOT NULL,
    Filesize         INTEGER                                            NOT NULL,
    Mimetype         text                                               NOT NULL,
    Format           text                                               NOT NULL,
    FileName         text                                               NOT NULL,
    CreatedAt        timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    DefaultFile      bool                                               NOT NULL,
    Kind             text                                               NOT NULL,
    Label            text                                               NOT NULL,
    Srclang          text                                               NOT NULL,
    AttachmentId     BIGINT                                             NOT NULL,
    PRIMARY KEY (Id)
);


CREATE TABLE IsBasedOnAuthor
(
    Id          BIGSERIAL NOT NULL,
    AuthorName  text      NOT NULL,
    IsBasedOnId BIGINT    NOT NULL,
    PRIMARY KEY (Id)
);
ALTER TABLE IsBasedOnAuthor
    ADD CONSTRAINT FKIsBasedOnAuthor FOREIGN KEY (IsBasedOnId) REFERENCES IsBasedOn (Id);


CREATE TABLE Rating
(
    Id                    BIGSERIAL                           NOT NULL,
    RatingContent         INTEGER,
    RatingVisual          INTEGER,
    FeedbackPositive      varchar(1000),
    FeedbackSuggest       varchar(1000),
    FeedbackPurpose       varchar(1000),
    EducationalMaterialId BIGINT                              NOT NULL,
    UsersUserName         text                                NOT NULL,
    UpdatedAt             timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (Id)
);


CREATE TABLE VersionComposition
(
    EducationalMaterialId int8      NOT NULL,
    MaterialId            int8      NOT NULL,
    PublishedAt           timestamp NOT NULL,
    Priority              int4,
    PRIMARY KEY (EducationalMaterialId,
                 MaterialId,
                 PublishedAt)
);
ALTER TABLE VersionComposition
    ADD CONSTRAINT FKMaterialVersion FOREIGN KEY (MaterialId) REFERENCES Material (Id);
ALTER TABLE VersionComposition
    ADD CONSTRAINT FKEducationalMaterialVersion FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);

CREATE TABLE AttachmentVersionComposition
(
    VersionEducationalMaterialId int8      NOT NULL,
    VersionMaterialId            int8      NOT NULL,
    VersionPublishedAt           timestamp NOT NULL,
    AttachmentId                 int8      NOT NULL,
    PRIMARY KEY (VersionEducationalMaterialId,
                 VersionMaterialId,
                 VersionPublishedAt,
                 AttachmentId)
);
ALTER TABLE AttachmentVersionComposition
    ADD CONSTRAINT FKVersionCompositionAttachment FOREIGN KEY (VersionEducationalMaterialId, VersionMaterialId, VersionPublishedAt) REFERENCES VersionComposition (EducationalMaterialId, MaterialId, PublishedAt);
ALTER TABLE AttachmentVersionComposition
    ADD CONSTRAINT FKAttachmentVersion FOREIGN KEY (AttachmentId) REFERENCES Attachment (Id);

CREATE TABLE LicenseCode
(
    Code    text NOT NULL,
    License text NOT NULL,
    PRIMARY KEY (Code)
);

INSERT INTO LicenseCode (Code, License)
VALUES ('CCBY4.0', 'CC BY 4.0');
INSERT INTO LicenseCode (Code, License)
VALUES ('CCBYNC4.0', 'CC BY-NC 4.0');
INSERT INTO LicenseCode (Code, License)
VALUES ('CCBYNCND4.0', 'CC BY-NC-ND 4.0');
INSERT INTO LicenseCode (Code, License)
VALUES ('CCBYNCSA4.0', 'CC BY-NC-SA 4.0');
INSERT INTO LicenseCode (Code, License)
VALUES ('CCBYND4.0', 'CC BY-ND 4.0');
INSERT INTO LicenseCode (Code, License)
VALUES ('CCBYSA4.0', 'CC BY-SA 4.0');

ALTER TABLE TemporaryAttachment
    ADD CONSTRAINT FKTempAttachment FOREIGN KEY (AttachmentId) REFERENCES Attachment (Id);

CREATE TABLE CollectionEducationalMaterial
(
    CollectionId          int8             NOT NULL,
    EducationalMaterialId int8             NOT NULL,
    Priority              int4 DEFAULT 999 NOT NULL,
    PRIMARY KEY (CollectionId,
                 EducationalMaterialId)
);
CREATE TABLE Collection
(
    Id             BIGSERIAL                NOT NULL,
    CreatedAt      timestamp with time zone NOT NULL,
    UpdatedAt      timestamp with time zone,
    PublishedAt    timestamp with time zone,
    CreatedBy      text                     NOT NULL,
    AgeRangeMin    int4,
    AgeRangeMax    int4,
    CollectionName varchar(255)             NOT NULL,
    Description    varchar(2000),
    PRIMARY KEY (Id)
);
CREATE TABLE UsersCollection
(
    CollectionId  int8 NOT NULL,
    UsersUserName text NOT NULL,
    PRIMARY KEY (CollectionId,
                 UsersUserName)
);
ALTER TABLE CollectionEducationalMaterial
    ADD CONSTRAINT FKMaterialCollection FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Restrict;
ALTER TABLE UsersCollection
    ADD CONSTRAINT FKUsersCollection FOREIGN KEY (UsersUserName) REFERENCES Users (UserName);
ALTER TABLE CollectionEducationalMaterial
    ADD CONSTRAINT FKCollectionMaterial FOREIGN KEY (CollectionId) REFERENCES Collection (Id) ON DELETE Cascade;
ALTER TABLE UsersCollection
    ADD CONSTRAINT FKCollectionUsers FOREIGN KEY (CollectionId) REFERENCES Collection (Id) ON DELETE Cascade;

CREATE TABLE CollectionKeyWord
(
    Id           BIGSERIAL NOT NULL,
    Value        text      NOT NULL,
    CollectionId int8      NOT NULL,
    KeywordKey   text      NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE CollectionAlignmentObject
(
    Id                   BIGSERIAL NOT NULL,
    AlignmentType        text      NOT NULL,
    CollectionId         int8      NOT NULL,
    TargetName           text      NOT NULL,
    Source               text      NOT NULL,
    EducationalFramework text,
    ObjectKey            text      NOT NULL,
    TargetUrl            text,
    PRIMARY KEY (Id)
);
CREATE TABLE CollectionEducationalUse
(
    Id                BIGSERIAL NOT NULL,
    EducationalUseKey text      NOT NULL,
    CollectionId      int8      NOT NULL,
    Value             text      NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE CollectionLanguage
(
    Id           BIGSERIAL NOT NULL,
    Language     text      NOT NULL,
    CollectionId int8      NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE CollectionEducationalAudience
(
    Id                 BIGSERIAL NOT NULL,
    EducationalRole    text      NOT NULL,
    CollectionId       int8      NOT NULL,
    EducationalRoleKey text      NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE CollectionAccessibilityHazard
(
    Id                     BIGSERIAL NOT NULL,
    Value                  text      NOT NULL,
    AccessibilityHazardKey text      NOT NULL,
    CollectionId           int8      NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE CollectionAccessibilityFeature
(
    Id                      SERIAL NOT NULL,
    Value                   text   NOT NULL,
    AccessibilityFeatureKey text   NOT NULL,
    CollectionId            int8   NOT NULL,
    PRIMARY KEY (Id)
);

ALTER TABLE CollectionAccessibilityHazard
    ADD CONSTRAINT FKCollectionAccessibilityHazard FOREIGN KEY (CollectionId) REFERENCES Collection (Id);
ALTER TABLE CollectionAccessibilityFeature
    ADD CONSTRAINT FKCollectionAccessibilityFeature FOREIGN KEY (CollectionId) REFERENCES Collection (Id);
ALTER TABLE CollectionEducationalAudience
    ADD CONSTRAINT FKCollectionEducationalAudience FOREIGN KEY (CollectionId) REFERENCES Collection (Id) ON DELETE Cascade;
ALTER TABLE CollectionEducationalUse
    ADD CONSTRAINT FKCollectionEducationalUse FOREIGN KEY (CollectionId) REFERENCES Collection (Id) ON DELETE Cascade;
ALTER TABLE CollectionAlignmentObject
    ADD CONSTRAINT FKCollectionAligmentObject FOREIGN KEY (CollectionId) REFERENCES Collection (Id) ON DELETE Cascade;
ALTER TABLE CollectionLanguage
    ADD CONSTRAINT FKCollectionLanguage FOREIGN KEY (CollectionId) REFERENCES Collection (Id) ON DELETE Cascade;
ALTER TABLE CollectionKeyWord
    ADD CONSTRAINT FKCollectionKeyWords FOREIGN KEY (CollectionId) REFERENCES Collection (Id) ON DELETE Cascade;

CREATE TABLE CollectionHeading
(
    Id           BIGSERIAL        NOT NULL,
    Heading      varchar(255)     NOT NULL,
    Description  varchar(2000),
    Priority     int4 DEFAULT 999 NOT NULL,
    CollectionId int8             NOT NULL,
    PRIMARY KEY (Id)
);
ALTER TABLE CollectionHeading
    ADD CONSTRAINT FKCollectionHeading FOREIGN KEY (CollectionId) REFERENCES Collection (Id);

CREATE TABLE CollectionEducationalLevel
(
    Id                  BIGSERIAL NOT NULL,
    EducationalLevelKey text      NOT NULL,
    CollectionId        int8      NOT NULL,
    Value               text      NOT NULL,
    PRIMARY KEY (Id)
);
ALTER TABLE CollectionEducationalLevel
    ADD CONSTRAINT FKCollectionEducationalLevel FOREIGN KEY (CollectionId) REFERENCES Collection (Id) ON DELETE Cascade;

CREATE TABLE collectionthumbnail
(
    id           BIGSERIAL      NOT NULL,
    filepath     text           NOT NULL,
    mimetype     text           NOT NULL,
    filename     text           NOT NULL,
    obsoleted    int4 DEFAULT 0 NOT NULL,
    filekey      text           NOT NULL,
    filebucket   text           NOT NULL,
    collectionid int8           NOT NULL,
    PRIMARY KEY (id)
);
ALTER TABLE collectionthumbnail
    ADD CONSTRAINT FKCollectionThumbnail FOREIGN KEY (collectionid) REFERENCES Collection (Id);

CREATE TABLE AccessibilityFeatureExtension
(
    Id                      BIGSERIAL NOT NULL,
    Value                   text      NOT NULL,
    AccessibilityFeatureKey text      NOT NULL,
    EducationalMaterialId   int8      NOT NULL,
    UsersUserName           text      NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE AccessibilityHazardExtension
(
    Id                     BIGSERIAL NOT NULL,
    Value                  text      NOT NULL,
    AccessibilityHazardKey text      NOT NULL,
    EducationalMaterialId  int8      NOT NULL,
    UsersUserName          text      NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE EducationalLevelExtension
(
    Id                    BIGSERIAL NOT NULL,
    Value                 text      NOT NULL,
    EducationalLevelKey   text      NOT NULL,
    EducationalMaterialId int8      NOT NULL,
    UsersUserName         text      NOT NULL,
    PRIMARY KEY (Id)
);
CREATE TABLE KeyWordExtension
(
    Id                    BIGSERIAL NOT NULL,
    Value                 text      NOT NULL,
    EducationalMaterialId int8      NOT NULL,
    KeywordKey            text      NOT NULL,
    UsersUserName         text      NOT NULL,
    PRIMARY KEY (Id)
);
ALTER TABLE AccessibilityFeatureExtension
    ADD CONSTRAINT fkAccessibilityFeatureExtension FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
ALTER TABLE AccessibilityHazardExtension
    ADD CONSTRAINT fkAccessibilityHazardExtension FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
ALTER TABLE EducationalLevelExtension
    ADD CONSTRAINT fkEducationalLevelExtension FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
ALTER TABLE KeyWordExtension
    ADD CONSTRAINT fkKeyWordExtension FOREIGN KEY (UsersUserName) REFERENCES Users (UserName);
ALTER TABLE AccessibilityFeatureExtension
    ADD CONSTRAINT fkUserAccessibilityFeatureExtension FOREIGN KEY (UsersUserName) REFERENCES Users (UserName);
ALTER TABLE AccessibilityHazardExtension
    ADD CONSTRAINT fkUsersAccessibiltyHazardExtension FOREIGN KEY (UsersUserName) REFERENCES Users (UserName);
ALTER TABLE EducationalLevelExtension
    ADD CONSTRAINT fkUsersEducationalLevelExtension FOREIGN KEY (UsersUserName) REFERENCES Users (UserName);
ALTER TABLE KeyWordExtension
    ADD CONSTRAINT fkUsersKeyWordExtension FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);

ALTER TABLE AccessibilityFeatureExtension
    ADD CONSTRAINT constraint_AccessibilityFeatureExtension UNIQUE (accessibilityfeaturekey, educationalmaterialid);
ALTER TABLE AccessibilityHazardExtension
    ADD CONSTRAINT constraint_AccessibilityHazardExtension UNIQUE (accessibilityhazardkey, educationalmaterialid);
ALTER TABLE EducationalLevelExtension
    ADD CONSTRAINT constraint_EducationalLevelExtension UNIQUE (educationallevelkey, educationalmaterialid);
ALTER TABLE KeyWordExtension
    ADD CONSTRAINT constraint_KeyWordExtension UNIQUE (keywordkey, educationalmaterialid);


CREATE TABLE aoeuser
(
    username varchar(255) NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE educationalMaterialVersion
(
    educationalMaterialId int8      NOT NULL,
    publishedAt           timestamp NOT NULL,
    urn                   text,
    PRIMARY KEY (educationalMaterialId,
                 publishedAt)
);

CREATE TABLE notification
(
    nf_id         BIGSERIAL PRIMARY KEY,
    nf_text       VARCHAR(1500) NOT NULL,
    nf_type       VARCHAR(255)  NOT NULL,
    nf_created_at TIMESTAMP with time zone,
    nf_show_since TIMESTAMP with time zone,
    nf_show_until TIMESTAMP with time zone,
    nf_disabled   BOOLEAN,
    nf_username   VARCHAR(255)  NOT NULL
        REFERENCES aoeuser
            ON UPDATE CASCADE
);



ALTER TABLE AlignmentObject
    ADD CONSTRAINT FKAlignmentObject FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE EducationalMaterial
    ADD CONSTRAINT FKEducationalMaterial FOREIGN KEY (UsersUserName) REFERENCES Users (UserName) ON DELETE Restrict;
ALTER TABLE EducationalAudience
    ADD CONSTRAINT FKEducationalAudience FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE LearningResourceType
    ADD CONSTRAINT FKLearningResourceType FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE KeyWord
    ADD CONSTRAINT FKKeyWord FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE EducationalUse
    ADD CONSTRAINT FKEducationalUse FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE IsBasedOn
    ADD CONSTRAINT FKIsBasedOn FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE InLanguage
    ADD CONSTRAINT FKInLanguage FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE Material
    ADD CONSTRAINT FKMaterial FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Restrict;
ALTER TABLE Record
    ADD CONSTRAINT FKRecord FOREIGN KEY (MaterialId) REFERENCES Material (Id) ON DELETE Restrict;
ALTER TABLE EducationalLevel
    ADD CONSTRAINT fk_EducationalLevel FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE Publisher
    ADD CONSTRAINT fk_Publisher FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE MaterialDescription
    ADD CONSTRAINT fk_Description FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE MaterialName
    ADD CONSTRAINT fk_MaterialName FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE AccessibilityFeature
    ADD CONSTRAINT fk_AccessibilityFeature FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE AccessibilityHazard
    ADD CONSTRAINT fk_AccessibilityHazard FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE Author
    ADD CONSTRAINT fk_author FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Cascade;
ALTER TABLE MaterialDisplayName
    ADD CONSTRAINT fk_MaterialDisplayName FOREIGN KEY (MaterialId) REFERENCES Material (Id) ON DELETE Cascade;
ALTER TABLE temporaryrecord
    ADD CONSTRAINT fk_temporaryrecord FOREIGN KEY (MaterialId) REFERENCES Material (Id) ON DELETE Restrict;
ALTER TABLE Thumbnail
    ADD CONSTRAINT fk_thumbnail FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Restrict;

ALTER TABLE materialname
    ADD CONSTRAINT constraint_lang_id UNIQUE (language, educationalmaterialid);
ALTER TABLE materialdescription
    ADD CONSTRAINT constraint_materialdescription_lang_id UNIQUE (language, educationalmaterialid);
ALTER TABLE educationalaudience
    ADD CONSTRAINT constraint_educationalaudience UNIQUE (educationalrolekey, educationalmaterialid);
ALTER TABLE educationaluse
    ADD CONSTRAINT constraint_educationaluse UNIQUE (educationalusekey, educationalmaterialid);
ALTER TABLE learningresourcetype
    ADD CONSTRAINT constraint_learningresourcetype UNIQUE (learningresourcetypekey, educationalmaterialid);
ALTER TABLE inlanguage
    ADD CONSTRAINT constraint_inlanguage UNIQUE (inlanguage, educationalmaterialid);
ALTER TABLE keyword
    ADD CONSTRAINT constraint_keyword UNIQUE (keywordkey, educationalmaterialid);
ALTER TABLE publisher
    ADD CONSTRAINT constraint_publisher UNIQUE (PublisherKey, educationalmaterialid);
ALTER TABLE isbasedon
    ADD CONSTRAINT constraint_isbasedon UNIQUE (materialname, educationalmaterialid);
ALTER TABLE alignmentobject
    ADD CONSTRAINT constraint_alignmentobject UNIQUE (alignmentType, targetName, source, educationalmaterialid);
ALTER TABLE materialdisplayname
    ADD CONSTRAINT constraint_materialdisplayname UNIQUE (language, materialid);
ALTER TABLE accessibilityfeature
    ADD CONSTRAINT constraint_accessibilityfeature UNIQUE (accessibilityfeaturekey, educationalmaterialid);
ALTER TABLE accessibilityhazard
    ADD CONSTRAINT constraint_accessibilityhazard UNIQUE (accessibilityhazardkey, educationalmaterialid);
ALTER TABLE EducationalLevel
    ADD CONSTRAINT constraint_EducationalLevel UNIQUE (EducationalLevelKey, educationalmaterialid);

ALTER TABLE Rating
    ADD CONSTRAINT FKRatingUsers FOREIGN KEY (UsersUserName) REFERENCES Users (UserName);
ALTER TABLE Rating
    ADD CONSTRAINT FKRatingEducationalMaterial FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
ALTER TABLE Rating
    ADD CONSTRAINT constraint_Rating UNIQUE (UsersUserName, educationalmaterialid);



ALTER TABLE alignmentobject
    DROP CONSTRAINT constraint_alignmentobject;
ALTER TABLE alignmentobject
    ADD CONSTRAINT constraint_alignmentobject UNIQUE (alignmentType, objectkey, source, educationalmaterialid);


ALTER TABLE VersionComposition
    ADD CONSTRAINT fkversioncomposition FOREIGN KEY (EducationalMaterialId, PublishedAt) REFERENCES EducationalMaterialVersion (EducationalMaterialId, PublishedAt);

ALTER TABLE EducationalMaterialVersion
    ADD CONSTRAINT FKemversion FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id);
