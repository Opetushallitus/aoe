package fi.csc.processor.producer;

import fi.csc.processor.model.request.MaterialActivity;
import fi.csc.processor.model.request.SearchRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

@Service
public class KafkaProducer {
    private static final Logger LOG = LoggerFactory.getLogger(KafkaProducer.class.getSimpleName());
    private final KafkaTemplate<String, MaterialActivity> kafkaTemplateMaterialActivity;
    private final KafkaTemplate<String, SearchRequest> kafkaTemplateSearchRequests;

    @Value(value = "${kafka.topic.prod-material-activity}")
    private String topicMaterialActivityPrimary;

    @Value(value = "${kafka.topic.prod-search-requests}")
    private String topicSearchRequestsPrimary;


    @Autowired
    private KafkaProducer(
        KafkaTemplate<String, MaterialActivity> kafkaTemplateMaterialActivity,
        KafkaTemplate<String, SearchRequest> kafkaTemplateSearchRequests) {
        this.kafkaTemplateMaterialActivity = kafkaTemplateMaterialActivity;
        this.kafkaTemplateSearchRequests = kafkaTemplateSearchRequests;
    }

    public void sendMaterialActivityPrimary(MaterialActivity materialActivity) {
        LOG.info(String.format("Producing message -> %s", materialActivity));

        ListenableFuture<SendResult<String, MaterialActivity>> future = this.kafkaTemplateMaterialActivity.send(topicMaterialActivityPrimary, materialActivity);

        future.addCallback(new ListenableFutureCallback<>() {

            @Override
            public void onSuccess(SendResult<String, MaterialActivity> result) {
                LOG.info(String.format("Sent message with offset=%s", result.getRecordMetadata().offset()));
            }

            @Override
            public void onFailure(Throwable ex) {
                LOG.error(String.format("Unable to send message \"%s\" due to : ", ex.getMessage()));
            }
        });
    }

    public void sendSearchRequestsPrimary(SearchRequest searchRequest) {
        LOG.info(String.format("Producing message -> %s", searchRequest));

        ListenableFuture<SendResult<String, SearchRequest>> future = this.kafkaTemplateSearchRequests.send(topicSearchRequestsPrimary, searchRequest);

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
