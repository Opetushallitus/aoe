package fi.csc.oaipmh.service;

import fi.csc.oaipmh.model.response.AoeMetaFrame;
import fi.csc.oaipmh.model.response.AoeMetadata;

import java.util.List;

public interface RequestService {

    /*List<LrmiMetadata> getMetadata();*/
    AoeMetaFrame<List<AoeMetadata>> getAoeMetadata(Integer resumptionCounter);

}
