package fi.csc.provider.controller;

import fi.csc.provider.model.xml_oaipmh.OaiPmhFrame;
import fi.csc.provider.service.MetadataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProviderController {
    private final MetadataService metadataService;
    private final MetadataService metadataUrnService;

    @Autowired
    public ProviderController(@Qualifier("metadataServiceImpl") MetadataService metadataService,
                              @Qualifier("metadataUrnServiceImpl") MetadataService metadataUrnService) {
        this.metadataService = metadataService;
        this.metadataUrnService = metadataUrnService;
    }

    @GetMapping(path = "/v2/oaipmh", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<OaiPmhFrame> getV2Metadata(
            @RequestParam(required = false, defaultValue = "") String verb,
            @RequestParam(required = false, defaultValue = "") String identifier,
            @RequestParam(required = false, defaultValue = "") String metadataPrefix,
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String until,
            @RequestParam(required = false, defaultValue = "") String resumptionToken) {

        return new ResponseEntity<>(
                this.metadataUrnService.getMetadata(verb, identifier, metadataPrefix, from, until, resumptionToken),
                HttpStatus.OK);
    }

    @GetMapping(path = "/oaipmh", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<OaiPmhFrame> getMetadata(
            @RequestParam(required = false, defaultValue = "") String verb,
            @RequestParam(required = false, defaultValue = "") String identifier,
            @RequestParam(required = false, defaultValue = "") String metadataPrefix,
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String until,
            @RequestParam(required = false, defaultValue = "") String resumptionToken) {

        return new ResponseEntity<>(
                this.metadataService.getMetadata(verb, identifier, metadataPrefix, from, until, resumptionToken),
                HttpStatus.OK);
    }

    @GetMapping(path = "/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> healthCheck() {
        return new ResponseEntity<>("{\"status\":\"ok\"}", HttpStatus.OK);
    }
}
