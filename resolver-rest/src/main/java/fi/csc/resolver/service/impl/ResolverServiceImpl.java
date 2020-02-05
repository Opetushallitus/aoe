package fi.csc.resolver.service.impl;

import fi.csc.resolver.model.Link;
import fi.csc.resolver.repository.LinkRepository;
import fi.csc.resolver.service.ResolverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResolverServiceImpl implements ResolverService {

    private LinkRepository linkRepository;

    @Autowired
    public ResolverServiceImpl(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }

    @Override
    public List<Link> resolveIdentifier(String hash) {
        return this.linkRepository.findByHash(hash);
    }
}
