package fi.csc.oaipmh.service;

import fi.csc.oaipmh.model.OaiPmhFrame;

public interface MetadataService {

    OaiPmhFrame getMetadata(String verb, String identifier, String metadataPrefix, String requestUrl);
}
