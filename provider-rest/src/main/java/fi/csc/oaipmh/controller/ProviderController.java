package fi.csc.oaipmh.controller;

import fi.csc.oaipmh.model.response.AoeMetadata;
import fi.csc.oaipmh.model.xml_oaipmh.OaiPmhFrame;
import fi.csc.oaipmh.service.MetadataService;
import fi.csc.oaipmh.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
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

    @GetMapping(path = "/oaipmh", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<OaiPmhFrame> getMetadata(
            @RequestParam(required = false, defaultValue = "") String verb,
            @RequestParam(required = false, defaultValue = "") String identifier,
            @RequestParam(required = false, defaultValue = "") String metadataPrefix,
            @RequestParam(required = false, defaultValue = "") String resumptionToken,
            HttpServletRequest request) {
        String requestUrl = request.getScheme()
                + "://"
                + request.getServerName()
                + (request.getServerPort() != 0 ? ":" + request.getServerPort() : "")
                + request.getRequestURI();
        return new ResponseEntity<>(
                this.metadataService.getMetadata(verb, identifier, metadataPrefix, resumptionToken, requestUrl),
                HttpStatus.OK);
    }
}
