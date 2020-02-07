package fi.csc.resolver.service;

import fi.csc.resolver.model.Link;

import java.util.List;

public interface ResolverService {

    void populateLinkResources();

    List<Link> resolveIdentifier(String hash);

}
