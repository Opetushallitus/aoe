package fi.csc.processor.controller;

import fi.csc.processor.model.MaterialActivity;
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

    @PostMapping(path = "/materialactivity", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<Void>> sendMessageToKafkaTopic(@RequestBody MaterialActivity materialActivity) {
        return async(() -> {
            this.kafkaProducer.sendMaterialActivity(materialActivity);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        });
    }

    @PostMapping(path = "/searchrequests", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<Void>> sendMessageToKafkaTopic(@RequestBody SearchRequest searchRequest) {
        return async(() -> {
            this.kafkaProducer.sendSearchRequests(searchRequest);
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        });
    }
}
