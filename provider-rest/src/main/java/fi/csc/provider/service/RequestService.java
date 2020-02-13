package fi.csc.provider.service;

import fi.csc.provider.model.aoe_response.AoeMetaFrame;
import fi.csc.provider.model.aoe_response.AoeMetadata;

import java.util.List;

public interface RequestService {

    /*List<LrmiMetadata> getMetadata();*/
    AoeMetaFrame<List<AoeMetadata>> getAoeMetadata(String from, String until, Integer resumptionCounter);

}
