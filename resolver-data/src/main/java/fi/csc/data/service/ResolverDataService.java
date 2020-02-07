package fi.csc.data.service;

import fi.csc.data.entity.Identifier;

import java.util.List;

public interface ResolverDataService {

    List<Identifier> getMetadataIdentifiers();

}
