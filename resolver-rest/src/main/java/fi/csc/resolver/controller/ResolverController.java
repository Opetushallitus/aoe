package fi.csc.resolver.controller;

import fi.csc.resolver.model.Link;
import fi.csc.resolver.service.ResolverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@SuppressWarnings("unused")
@RestController
public class ResolverController {

    private ResolverService resolverService;

    @Autowired
    public ResolverController(ResolverService resolverService) {
        this.resolverService = resolverService;
    }

    @GetMapping("/link/{hash}")
    public ResponseEntity<Void> redirectToResource(@PathVariable String hash) throws URISyntaxException {
        List<Link> linkList = this.resolverService.resolveIdentifier(hash);

        if (linkList.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            URI redirectURI = new URI(linkList.get(0).getTargetUrl());
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setLocation(redirectURI);
            return new ResponseEntity<>(httpHeaders, HttpStatus.FOUND);
        }
    }
}
