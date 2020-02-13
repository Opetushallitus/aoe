package fi.csc.data.service;

import fi.csc.data.entity.Identifier;
import fi.csc.data.model.TimeIntervalRequest;
import org.springframework.data.domain.Page;

public interface ResolverDataService {

    Page<Identifier> getMetadataIdentifiers(TimeIntervalRequest timeIntervalRequest);

}
