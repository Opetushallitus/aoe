package fi.csc.provider.service;

import fi.csc.provider.model.response.AoeMetadata;
import fi.csc.provider.model.xml_lrmi.LrmiMetadata;

public interface MigrationService {

    LrmiMetadata migrateAoeToLrmi(AoeMetadata aoeMetadata);

}
