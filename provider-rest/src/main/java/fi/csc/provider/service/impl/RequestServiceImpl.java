package fi.csc.provider.service.impl;

import fi.csc.provider.adapter.OaiPmhDateFormatter;
import fi.csc.provider.adapter.URLDecoder;
import fi.csc.provider.model.aoe_request.MetadataRequest;
import fi.csc.provider.model.aoe_response.AoeMetaFrame;
import fi.csc.provider.model.aoe_response.AoeMetadata;
import fi.csc.provider.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class RequestServiceImpl implements RequestService {

    private Environment env;
    private RestTemplate restTemplate;

    @Autowired
    public RequestServiceImpl(Environment env, RestTemplate restTemplate) {
        this.env = env;
        this.restTemplate = restTemplate;
    }

    @Override
    public AoeMetaFrame<List<AoeMetadata>> getAoeMetadata(String fromEncoded, String untilEncoded, Integer resumptionCounter) {
        MetadataRequest metadataRequest = new MetadataRequest();

        if (!fromEncoded.isEmpty() && !untilEncoded.isEmpty()) {
            String fromDecoded = URLDecoder.decodeValue(fromEncoded);
            metadataRequest.setDateMin(OaiPmhDateFormatter.convertToIso(fromDecoded));

            String untilDecoded = URLDecoder.decodeValue(untilEncoded);
            metadataRequest.setDateMax(OaiPmhDateFormatter.convertToIso(untilDecoded));
        } else {
            metadataRequest.setDateMin(LocalDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneId.of("UTC")));
            metadataRequest.setDateMax(LocalDateTime.now(ZoneOffset.UTC));
        }
        metadataRequest.setMaterialPerPage(Integer.parseInt(env.getProperty("aoe.request.per-page", "20")));
        metadataRequest.setPageNumber(resumptionCounter);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<MetadataRequest> request = new HttpEntity<>(metadataRequest, headers);

        return restTemplate.exchange(env.getProperty("aoe.request.url"),
            HttpMethod.POST, request, new ParameterizedTypeReference<AoeMetaFrame<List<AoeMetadata>>>(){}).getBody();
    }
}
