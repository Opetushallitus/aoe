package fi.csc.processor.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

@RestController
public class StatusController {

    @GetMapping(path = "/status", produces = MediaType.TEXT_PLAIN_VALUE)
    @Async
    public CompletableFuture<ResponseEntity<String>> getStatus() {
        return CompletableFuture.supplyAsync(() -> new ResponseEntity<>("Service operable: true", HttpStatus.OK));
    }
}
