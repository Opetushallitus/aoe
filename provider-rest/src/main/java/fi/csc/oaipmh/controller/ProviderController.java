package fi.csc.oaipmh.controller;

import fi.csc.oaipmh.model.xml_lrmi.LrmiMetadata;
import fi.csc.oaipmh.model.xml_oaipmh.OaiPmhFrame;
import fi.csc.oaipmh.service.MetadataService;
import javax.servlet.http.HttpServletRequest;

import fi.csc.oaipmh.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProviderController {

    private MetadataService metadataService;
    private RequestService requestService;

    @Autowired
    public ProviderController(MetadataService metadataService, RequestService requestService) {
        this.metadataService = metadataService;
        this.requestService = requestService;
    }

    @GetMapping(path = "/oaipmh", produces = {"application/xml", "application/rdf+xml"})
    public ResponseEntity<OaiPmhFrame> getAllMetadata(
            @RequestParam(required = false, defaultValue = "") String verb,
            @RequestParam(required = false, defaultValue = "") String identifier,
            @RequestParam(required = false, defaultValue = "") String metadataPrefix,
            HttpServletRequest request) {
        String requestUrl = request.getScheme()
                + "://"
                + request.getServerName()
                + (request.getServerPort() != 0 ? ":" + request.getServerPort() : "")
                + request.getRequestURI();
        return new ResponseEntity<>(
                metadataService.getMetadata(verb, identifier, metadataPrefix, requestUrl),
                HttpStatus.OK);
    }

    @GetMapping(path = "/aoetest", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<List<LrmiMetadata>> executeAoeTest() {
        return new ResponseEntity<>(requestService.getAoeMetadata(), HttpStatus.OK);
    }
}
