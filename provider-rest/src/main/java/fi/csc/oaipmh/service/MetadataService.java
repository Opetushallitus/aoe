package fi.csc.oaipmh.service;

import fi.csc.oaipmh.model.xml_oaipmh.OaiPmhFrame;

public interface MetadataService {

    OaiPmhFrame getMetadata(String verb, String identifier, String metadataPrefix, String from, String until,
        String resumptionToken, String requestUrl);
}
