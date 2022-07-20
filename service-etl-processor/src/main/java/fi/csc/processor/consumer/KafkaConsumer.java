package fi.csc.processor.consumer;

import fi.csc.processor.model.Person;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.listener.ConsumerSeekAware;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumer implements ConsumerSeekAware {

    private final Logger LOG = LoggerFactory.getLogger(KafkaConsumer.class);

    @KafkaListener(
            topics = "notes",
            groupId = "aoe-analytics",
            containerFactory = "kafkaListener",
            properties = {"enable.auto.commit:false", "auto.offset.reset:latest"})
    public void consume(
            @Payload Person person, // byte[] payload
            @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition,
            @Header(KafkaHeaders.OFFSET) int offset) {
        LOG.info(String.format("Consumed message -> %s [offset=%d, partition=%d]", person, partition, offset));
    }
}
