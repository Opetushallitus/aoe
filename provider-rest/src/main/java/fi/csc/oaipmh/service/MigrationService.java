package fi.csc.oaipmh.service;

import fi.csc.oaipmh.model.response.AoeMetadata;
import fi.csc.oaipmh.model.xml_lrmi.LrmiMetadata;

public interface MigrationService {

    LrmiMetadata migrateAoeToLrmi(AoeMetadata aoeMetadata);

}
