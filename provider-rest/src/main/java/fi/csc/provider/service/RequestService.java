package fi.csc.provider.service;

import fi.csc.provider.model.response.AoeMetaFrame;
import fi.csc.provider.model.response.AoeMetadata;

import java.util.List;

public interface RequestService {

    /*List<LrmiMetadata> getMetadata();*/
    AoeMetaFrame<List<AoeMetadata>> getAoeMetadata(String from, String until, Integer resumptionCounter);

}
