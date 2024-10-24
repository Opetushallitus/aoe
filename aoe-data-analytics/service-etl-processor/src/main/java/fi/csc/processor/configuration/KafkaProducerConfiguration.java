package fi.csc.processor.configuration;

import fi.csc.processor.model.request.MaterialActivity;
import fi.csc.processor.model.request.SearchRequest;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

// @ConditionalOnProperty(value = "kafka.enabled", matchIfMissing = true)
@Configuration
public class KafkaProducerConfiguration {

    @Value(value = "${spring.kafka.producer.bootstrap-servers}")
    private String bootstrapServers;

    @Value(value = "${kafka.topic.prod-material-activity}")
    private String topicMaterialActivityPrimary;

    @Value(value = "${kafka.topic.prod-search-requests}")
    private String topicSearchRequestsPrimary;

    @Value(value = "${kafka.topic.material-activity}")
    private String topicMaterialActivitySecondary;

    @Value(value = "${kafka.topic.search-requests}")
    private String topicSearchRequestsSecondary;

    @Bean
    public ProducerFactory<String, MaterialActivity> producerFactoryMaterialActivity() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        // configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, MaterialActivity> kafkaTemplateMaterialActivity() {
        return new KafkaTemplate<>(producerFactoryMaterialActivity());
    }

    @Bean
    public ProducerFactory<String, SearchRequest> producerFactorySearchRequest() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        // configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, SearchRequest> kafkaTemplateSearchRequest() {
        return new KafkaTemplate<>(producerFactorySearchRequest());
    }

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    @Bean
    public NewTopic topicMaterialActivityPrimary() {
        return TopicBuilder.name(topicMaterialActivityPrimary)
            .partitions(2)
            .replicas(2)
            .build();
    }

    @Bean
    public NewTopic topicSearchRequestsPrimary() {
        return TopicBuilder.name(topicSearchRequestsPrimary)
            .partitions(2)
            .replicas(2)
            .build();
    }

    @Bean
    public NewTopic topicMaterialActivitySecondary() {
        return TopicBuilder.name(topicMaterialActivitySecondary)
            .partitions(2)
            .replicas(2)
            .build();
    }

    @Bean
    public NewTopic topicSearchRequestsSecondary() {
        return TopicBuilder.name(topicSearchRequestsSecondary)
            .partitions(2)
            .replicas(2)
            .build();
    }
}
