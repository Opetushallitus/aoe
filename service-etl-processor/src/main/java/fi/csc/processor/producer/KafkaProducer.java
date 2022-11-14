package fi.csc.processor.producer;

import fi.csc.processor.model.SearchRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

@Service
public class KafkaProducer {

    private static final Logger LOG = LoggerFactory.getLogger(KafkaProducer.class.getSimpleName());
    private static final String TOPIC = "search_requests";
    private KafkaTemplate<String, SearchRequest> kafkaTemplate;

    @Autowired
    private KafkaProducer(KafkaTemplate<String, SearchRequest> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendMessage(SearchRequest searchRequest) {
        LOG.info(String.format("Producing message -> %s", searchRequest));

        ListenableFuture<SendResult<String, SearchRequest>> future = this.kafkaTemplate.send(TOPIC, searchRequest);

        future.addCallback(new ListenableFutureCallback<>() {

            @Override
            public void onSuccess(SendResult<String, SearchRequest> result) {
                LOG.info(String.format("Sent message with offset=%s", result.getRecordMetadata().offset()));
            }

            @Override
            public void onFailure(Throwable ex) {
                LOG.error(String.format("Unable to send message \"%s\" due to : ", ex.getMessage()));
            }
        });
    }
}
