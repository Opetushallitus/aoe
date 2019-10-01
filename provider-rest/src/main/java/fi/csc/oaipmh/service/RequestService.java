package fi.csc.oaipmh.service;

import fi.csc.oaipmh.model.xml_lrmi.LrmiMetadata;

import java.util.List;

public interface RequestService {

    List<LrmiMetadata> getAoeMetadata();

}
