package fi.csc.provider.controller;

import fi.csc.provider.model.xml_oaipmh.OaiPmhFrame;
import fi.csc.provider.service.MetadataService;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
@Api(value = "OAI-PMH Harvesting Endpoint")
public class ProviderController {

    private MetadataService metadataService;

    @Autowired
    public ProviderController(MetadataService metadataService) {
        this.metadataService = metadataService;
    }

    @ApiOperation(value = "Retrieve LRMI metadata batch", response = ResponseEntity.class)
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "Successfully retrieved a LRMI metadata batch")
    })
    @GetMapping(path = "/oaipmh", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<OaiPmhFrame> getMetadata(

        @ApiParam(name = "verb", value = "OAI-PMH request method like Identify, ListRecords or ListIdentifiers")
        @RequestParam(required = false, defaultValue = "") String verb,

        @ApiParam(name = "identifier", value = "Identifier")
        @RequestParam(required = false, defaultValue = "") String identifier,

        @ApiParam(name = "metadataPrefix", value = "Provide the prefix value of oai_dc")
        @RequestParam(required = false, defaultValue = "") String metadataPrefix,

        @ApiParam(name = "from", value = "URL encoded sequence start time")
        @RequestParam(required = false, defaultValue = "") String from,

        @ApiParam(name = "until", value = "URL encoded sequence end time")
        @RequestParam(required = false, defaultValue = "") String until,

        @ApiParam(name = "resumtionToken", value = "Batch sequence number starting from 0")
        @RequestParam(required = false, defaultValue = "") String resumptionToken,

        HttpServletRequest request) {
        String requestUrl = request.getScheme()
            + "://"
            + request.getServerName()
            + (request.getServerPort() != 0 ? ":" + request.getServerPort() : "")
            + request.getRequestURI();
        return new ResponseEntity<>(
            this.metadataService.getMetadata(verb, identifier, metadataPrefix, from, until, resumptionToken,
                requestUrl),
            HttpStatus.OK);
    }

    @GetMapping(path = "/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> healthCheck() {
        return new ResponseEntity<>("{\"status\":\"ok\"}", HttpStatus.OK);
    }
}
