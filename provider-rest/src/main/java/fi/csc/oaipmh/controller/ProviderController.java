package fi.csc.oaipmh.controller;

import fi.csc.oaipmh.model.OaiPmhFrame;
import fi.csc.oaipmh.service.MetadataService;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProviderController {

    private MetadataService metadataService;

    @Autowired
    public void setMetadataService(MetadataService metadataService) {
        this.metadataService = metadataService;
    }

    @GetMapping(path = "/oai-pmh", produces={"application/xml", "application/rdf+xml"})
    public ResponseEntity<OaiPmhFrame> getAllMetadata(
        HttpServletRequest request,
        @RequestParam(required = false, defaultValue = "") String verb,
        @RequestParam(required = false, defaultValue = "") String identifier,
        @RequestParam(required = false, defaultValue = "") String metadataPrefix
    ) {
        return new ResponseEntity<>(
            metadataService.getMetadata(verb, identifier, metadataPrefix, request.getRequestURI()),
            HttpStatus.OK);
    }
}
