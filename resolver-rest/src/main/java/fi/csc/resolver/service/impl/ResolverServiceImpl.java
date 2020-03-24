package fi.csc.resolver.service.impl;

import fi.csc.resolver.model.Identifier;
import fi.csc.resolver.model.Link;
import fi.csc.resolver.model.RestPageImpl;
import fi.csc.resolver.model.TimeIntervalRequest;
import fi.csc.resolver.repository.LinkRepository;
import fi.csc.resolver.service.ResolverService;
import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.net.ConnectException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ResolverServiceImpl implements ResolverService {

    private final Logger LOG = LoggerFactory.getLogger(ResolverServiceImpl.class);

    private Environment env;
    private LinkRepository linkRepository;
    private RestTemplate restTemplate;
    private LocalDateTime syncPoint = Instant.ofEpochMilli(0L).atZone(ZoneId.of("UTC")).toLocalDateTime();

    @Autowired
    public ResolverServiceImpl(
        Environment env,
        LinkRepository linkRepository,
        RestTemplate restTemplate) {
        this.env = env;
        this.linkRepository = linkRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public void populateLinkResources() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("UTC"));
        int currentPage = 0;
        int pageSize = 100;
        int pageTotal = 1;

        while (currentPage < pageTotal) {
            Page<Identifier> page = identifierRequest(currentPage, pageSize, now);

            if (page != null && page.getTotalPages() != 0) {
                pageTotal = page.getTotalPages();
                currentPage++;
            } else {
                return;
            }
            Optional<List<Identifier>> identifiersOptional = Optional.of(page.getContent());
            List<Identifier> identifiers = identifiersOptional.orElse(new ArrayList<>());
            List<Link> links = new ArrayList<>();

            if (!identifiers.isEmpty()) {
                identifiers.forEach(i -> {
                    String hash = generateHash(i);
                    try {
                        String targetUrl = generateTargetUrl(encodeUrl(i.getFileKey()));
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
                if (!links.isEmpty()) {
                    this.linkRepository.saveAll(links);
                }
            }
        }
        this.syncPoint = now;
    }

    @Override
    public List<Link> resolveIdentifier(String hash) {
        return this.linkRepository.findByHash(hash);
    }

    @Retryable(maxAttempts = 5, value = {ConnectException.class, RuntimeException.class}, backoff = @Backoff(delay = 5000))
    Page<Identifier> identifierRequest(int currentPage, int pageSize, LocalDateTime now) {
        ResponseEntity<RestPageImpl<Identifier>> response = restTemplate.exchange(
            env.getProperty("aoe.resolver-data.url") + "/rest/identifiers",
            HttpMethod.POST,
            getRequestEntity(currentPage, pageSize, this.syncPoint, now),
            new ParameterizedTypeReference<>() {});
        return response.getBody();
    }

    HttpEntity<TimeIntervalRequest> getRequestEntity(int currentPage, int pageSize, LocalDateTime from, LocalDateTime until) {
        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Accept", MediaType.APPLICATION_JSON_VALUE);
        TimeIntervalRequest timeIntervalRequest = new TimeIntervalRequest();
        timeIntervalRequest.setFrom(from);
        timeIntervalRequest.setUntil(until);
        timeIntervalRequest.setPage(currentPage);
        timeIntervalRequest.setSize(pageSize);
        return new HttpEntity<>(timeIntervalRequest, requestHeaders);
    }

    String generateHash(Identifier identifier) {
        String decoded = identifier.getEducationalMaterialId() + ":" + identifier.getMaterialId() + ":latest:"
            + identifier.getOriginalFileName();
        String encoded = DigestUtils.sha1Hex(decoded);
        LOG.info("EMID: " + identifier.getEducationalMaterialId()
            + ", MID: " + identifier.getMaterialId()
            + ", FILE: " + identifier.getOriginalFileName()
            + ", HASH: " + encoded);
        return encoded;
    }

    String generateTargetUrl(String encodedRequestUrl) throws URISyntaxException {
        return new URI(env.getProperty("aoe.material.target-url") + encodedRequestUrl).toString();
    }

    String encodeUrl(String value) throws UnsupportedEncodingException {
        return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
    }
}
