package fi.csc.data.service;

import fi.csc.data.entity.Identifier;
import fi.csc.data.model.TimeInterval;

import java.util.List;

public interface ResolverDataService {

    List<Identifier> getMetadataIdentifiers(TimeInterval timeInterval);

}
