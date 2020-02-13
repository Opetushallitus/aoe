DROP TABLE IF EXISTS Material;
DROP TABLE IF EXISTS Record;
DROP TABLE IF EXISTS EducationalMaterial;

CREATE TYPE lang AS ENUM ('fi', 'en', 'sv');

CREATE TABLE EducationalMaterial
(
    Id                  BIGSERIAL                                          NOT NULL,
    CreatedAt           timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PublishedAt         timestamp with time zone,
    UpdatedAt           timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ArchivedAt          timestamp with time zone,
    TimeRequired        text                     DEFAULT ''                NOT NULL,
    AgeRangeMin         int4                     DEFAULT -1                NOT NULL,
    AgeRangeMax         int4                     DEFAULT -1                NOT NULL,
    LicenseCode         text                     DEFAULT ''                NOT NULL,
    Obsoleted           int4                     DEFAULT 0                 NOT NULL,
    OriginalPublishedAt timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UsersUserName       text                                               NOT NULL,
    Expires             timestamp with time zone,
    PRIMARY KEY (Id)
);

CREATE TABLE Material
(
    Id                    BIGSERIAL         NOT NULL,
    Link                  text              NOT NULL,
    EducationalMaterialId int8              NOT NULL,
    Obsoleted             int4 DEFAULT 0    NOT NULL,
    Priority              int4 DEFAULT 0    NOT NULL,
    MaterialLanguageKey   lang DEFAULT 'fi' NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE Record
(
    Id               BIGSERIAL NOT NULL,
    FilePath         text      NOT NULL,
    OriginalFileName text      NOT NULL,
    FileSize         int4      NOT NULL,
    MimeType         text      NOT NULL,
    Format           text      NOT NULL,
    MaterialId       int8      NOT NULL,
    FileKey          text      NOT NULL,
    FileBucket       text      NOT NULL,
    PRIMARY KEY (Id)
);

ALTER TABLE Material
    ADD CONSTRAINT FKMaterial FOREIGN KEY (EducationalMaterialId) REFERENCES EducationalMaterial (Id) ON DELETE Restrict;
ALTER TABLE Record
    ADD CONSTRAINT FKRecord FOREIGN KEY (MaterialId) REFERENCES Material (Id) ON DELETE Restrict;


/*INSERT INTO EducationalMaterial (UsersUserName)
VALUES ('admin'),
       ('users');

INSERT INTO Material (Link, EducationalMaterialId)
VALUES ('material-1', 1),
       ('material-2', 2);*/
