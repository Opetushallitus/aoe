package fi.csc.provider.service;

import fi.csc.provider.model.aoe_response.AoeMetadata;
import fi.csc.provider.model.xml_lrmi.LrmiMetadata;

public interface MigrationService {

    LrmiMetadata migrateAoeToLrmi(AoeMetadata aoeMetadata);

}
