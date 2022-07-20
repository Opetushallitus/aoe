package fi.csc.processor.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

import static fi.csc.processor.utils.AsyncUtil.async;

@RestController
public class StatusController {

    @GetMapping(path = "/status", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<String>> getStatus() {
        return async(() -> new ResponseEntity<>("Service operable: true", HttpStatus.OK));
    }
}
