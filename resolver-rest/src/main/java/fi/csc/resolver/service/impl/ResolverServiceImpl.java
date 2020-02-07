package fi.csc.resolver.service.impl;

import fi.csc.resolver.model.Identifier;
import fi.csc.resolver.model.Link;
import fi.csc.resolver.repository.LinkRepository;
import fi.csc.resolver.service.ResolverService;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ResolverServiceImpl implements ResolverService {

    private LinkRepository linkRepository;
    private RestTemplate restTemplate;

    @Autowired
    public ResolverServiceImpl(
        LinkRepository linkRepository,
        RestTemplate restTemplate) {
        this.linkRepository = linkRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public void populateLinkResources() {
        ResponseEntity<List<Identifier>> response = restTemplate.exchange(
            "http://localhost:8002/rest/identifiers",
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<>(){});
        Optional<List<Identifier>> identifiersOptional = Optional.ofNullable(response.getBody());
        List<Identifier> identifiers = identifiersOptional.orElse(new ArrayList<>());
        List<Link> links = new ArrayList<>();

        if (!identifiers.isEmpty()) {
            identifiers.forEach(i -> {
                String hash = generateHash(i);
                try {
                    String targetUrl = generateTargetUrl(encodeUrl(i.getOriginalFileName()));
                    Link link = new Link();
                    link.setMetaId(i.getEducationalMaterialId());
                    link.setMaterialId(i.getMaterialId());
                    link.setVersion("latest");
                    link.setLatest((short) 1);
                    link.setHash(hash);
                    link.setTargetUrl(targetUrl);
                    links.add(link);
                } catch (URISyntaxException | UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
            });
        }
        if (!links.isEmpty()) {
            this.linkRepository.saveAll(links);
        }
    }

    @Override
    public List<Link> resolveIdentifier(String hash) {
        return this.linkRepository.findByHash(hash);
    }

    private String generateHash(Identifier identifier) {
        String decoded = identifier.getEducationalMaterialId() + ":" + identifier.getMaterialId() + ":latest:"
            + identifier.getOriginalFileName();
        String encoded = DigestUtils.sha1Hex(decoded);
        System.out.println("HASH: " + encoded);
        return encoded;
    }

    private String generateTargetUrl(String encodedRequestUrl) throws URISyntaxException {
        return new URI("https://demo.aoe.fi/api/download/" + encodedRequestUrl).toString();
    }

    private String encodeUrl(String value) throws UnsupportedEncodingException {
        return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
    }
}
