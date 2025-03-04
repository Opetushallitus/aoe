package fi.csc.processor.configuration;

import fi.csc.processor.model.request.MaterialActivity;
import fi.csc.processor.model.request.SearchRequest;
import fi.csc.processor.utils.KafkaConfigUtil;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
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

@ConditionalOnProperty(value = "kafka.enabled", matchIfMissing = true)
@Configuration
public class KafkaProducerConfiguration {

    @Value(value = "${spring.kafka.producer.bootstrap-servers}")
    private String bootstrapServers;

    @Value(value = "${kafka.topic.prod-material-activity}")
    private String topicMaterialActivityPrimary;

    @Value(value = "${kafka.topic.prod-search-requests}")
    private String topicSearchRequestsPrimary;

    @Value(value = "${kafka.sasl.enable}")
    private boolean saslEnabled;

    @Value(value = "${trust.store.pass}")
    private String trustStorePassword;

    @Value("${trust.store.location}")
    private String trustStoreLocation;

    @Bean
    public ProducerFactory<String, MaterialActivity> producerFactoryMaterialActivity() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        if (saslEnabled) {
            config.putAll(KafkaConfigUtil.saslConfig(trustStorePassword, trustStoreLocation));
        }

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
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        if (saslEnabled) {
            config.putAll(KafkaConfigUtil.saslConfig(trustStorePassword, trustStoreLocation));
        }

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

        if (saslEnabled) {
            configs.putAll(KafkaConfigUtil.saslConfig(trustStorePassword, trustStoreLocation));
        }

        return createKafkaAdmin(configs);
    }

    private KafkaAdmin createKafkaAdmin(Map<String, Object> configs) {
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

}
