package fi.csc.oaipmh.service;

import fi.csc.oaipmh.model.response.AoeMetadataResponse;
import fi.csc.oaipmh.model.xml_lrmi.LrmiMetadata;

import java.util.List;

public interface RequestService {

    List<LrmiMetadata> getMetadata();
    List<AoeMetadataResponse> getAoeMetadata();

}
