package fi.csc.processor.producer;

import fi.csc.processor.model.Person;
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

    private static final Logger LOG = LoggerFactory.getLogger(KafkaProducer.class);
    private static final String TOPIC = "notes";
    private KafkaTemplate<String, Person> kafkaTemplate;

    @Autowired
    private KafkaProducer(KafkaTemplate<String, Person> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendMessage(Person person) {
        LOG.info(String.format("Producing message -> %s", person));

        ListenableFuture<SendResult<String, Person>> future = this.kafkaTemplate.send(TOPIC, person);

        future.addCallback(new ListenableFutureCallback<>() {

            @Override
            public void onSuccess(SendResult<String, Person> result) {
                LOG.info(String.format("Sent message with offset=%s", result.getRecordMetadata().offset()));
            }

            @Override
            public void onFailure(Throwable ex) {
                LOG.error(String.format("Unable to send message \"%s\" due to : ", ex.getMessage()));
            }
        });
    }
}
