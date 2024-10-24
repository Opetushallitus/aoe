package fi.csc.processor.controller;

import fi.csc.processor.model.request.MaterialActivity;
import fi.csc.processor.model.request.SearchRequest;
import fi.csc.processor.producer.KafkaProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

import static fi.csc.processor.utils.AsyncUtil.async;

@RestController
@RequestMapping(value = "/produce")
public class KafkaController {
    private final KafkaProducer kafkaProducer;

    @Autowired
    public KafkaController(KafkaProducer kafkaProducer) {
        this.kafkaProducer = kafkaProducer;
    }

    @PostMapping(path = "/prod/materialactivity", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<Void>> sendMessageToKafkaTopicPrimary(
        @RequestBody MaterialActivity materialActivity) {
        return async(() -> {
            this.kafkaProducer.sendMaterialActivityPrimary(materialActivity);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        });
    }

    @PostMapping(path = "/prod/searchrequests", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<Void>> sendMessageToKafkaTopicPrimary(
        @RequestBody SearchRequest searchRequest) {
        return async(() -> {
            this.kafkaProducer.sendSearchRequestsPrimary(searchRequest);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        });
    }

    @PostMapping(path = "/test/materialactivity", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<Void>> sendMessageToKafkaTopicSecondary(
        @RequestBody MaterialActivity materialActivity) {
        return async(() -> {
            this.kafkaProducer.sendMaterialActivitySecondary(materialActivity);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        });
    }

    @PostMapping(path = "/test/searchrequests", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<Void>> sendMessageToKafkaTopicSecondary(
        @RequestBody SearchRequest searchRequest) {
        return async(() -> {
            this.kafkaProducer.sendSearchRequestsSecondary(searchRequest);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        });
    }
}
