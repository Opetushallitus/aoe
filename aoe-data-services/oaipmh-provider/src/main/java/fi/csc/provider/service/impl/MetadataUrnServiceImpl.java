package fi.csc.provider.service.impl;

import fi.csc.provider.model.aoe_response.AoeMetaFrame;
import fi.csc.provider.model.aoe_response.AoeMetadata;
import fi.csc.provider.model.xml_lrmi.LrmiMetadata;
import fi.csc.provider.model.xml_oaipmh.OaiPmhFrame;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordHeader;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordMetadata;
import fi.csc.provider.service.MigrationService;
import fi.csc.provider.service.RequestService;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MetadataUrnServiceImpl extends MetadataServiceImpl {

    public MetadataUrnServiceImpl(Environment env, MigrationService migrationService, RequestService requestService) {
        super(env, migrationService, requestService);
    }

    @Override
    public OaiPmhFrame getMetadata(String verb, String identifier, String metadataPrefix, String from, String until, String resumptionToken) {
        return super.getMetadata(verb, identifier, metadataPrefix, from, until, resumptionToken);
    }

    @Override
    RecordHeader getRecordHeader(LrmiMetadata meta) {
        String publishedAt = (meta.getPublishedAt() != null ? CUSTOM_DATETIME.format(meta.getPublishedAt()) : "");
        return new RecordHeader(
                null,
                meta.getIdentifier() + "-" + publishedAt,
                publishedAt);
    }

    @Override
    AoeMetaFrame<List<AoeMetadata>> getAoeMetadata(String from, String until, Integer resumptionCounter) {
        return this.requestService.getAoeMetadata(from, until, resumptionCounter, true);
    }

    @Override
    RecordMetadata getRecordMetadata(boolean identifiersOnly, LrmiMetadata meta, RecordMetadata recordMetadata) {
        return identifiersOnly ? null : recordMetadata;
    }

    @Override
    String getAoeIdentifybaseUrl() {
        return env.getProperty("aoe.identify.v2.base-url");
    }
}
