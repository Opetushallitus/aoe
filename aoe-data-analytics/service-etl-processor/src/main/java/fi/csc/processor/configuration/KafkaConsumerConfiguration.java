package fi.csc.processor.configuration;

import fi.csc.processor.model.request.MaterialActivity;
import fi.csc.processor.model.request.SearchRequest;
import fi.csc.processor.utils.KafkaConfigUtil;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.CooperativeStickyAssignor;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@ConditionalOnProperty(value = "kafka.enabled", matchIfMissing = true)
@EnableKafka
@Configuration
public class KafkaConsumerConfiguration {

    @Value(value = "${spring.kafka.consumer.bootstrap-servers}")
    private String bootstrapServers;

    @Value(value = "${kafka.group-id.prod-material-activity}")
    private String groupMaterialActivityPrimary;

    @Value(value = "${kafka.group-id.prod-search-requests}")
    private String groupSearchRequestsPrimary;

    @Value(value = "${kafka.sasl.enable}")
    private boolean saslEnabled;

    @Value(value = "${trust.store.pass}")
    private String trustStorePassword;

    @Value("${trust.store.location}")
    private String trustStoreLocation;

    @Bean
    public ConsumerFactory<String, MaterialActivity> consumerFactoryMaterialActivityPrimary() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, groupMaterialActivityPrimary);
        config.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, CooperativeStickyAssignor.class.getName());
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        if (saslEnabled) {
            config.putAll(KafkaConfigUtil.saslConfig(trustStorePassword, trustStoreLocation));
        }

        return new DefaultKafkaConsumerFactory<>(config, new StringDeserializer(), new JsonDeserializer<>(MaterialActivity.class));
    }



    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, MaterialActivity> kafkaListenerMaterialActivityPrimary() {
        ConcurrentKafkaListenerContainerFactory<String, MaterialActivity> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactoryMaterialActivityPrimary());
        return factory;
    }

    @Bean
    public ConsumerFactory<String, SearchRequest> consumerFactorySearchRequestsPrimary() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, groupSearchRequestsPrimary);
        config.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, CooperativeStickyAssignor.class.getName());
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        if (saslEnabled) {
            config.putAll(KafkaConfigUtil.saslConfig(trustStorePassword, trustStoreLocation));
        }

        return new DefaultKafkaConsumerFactory<>(config, new StringDeserializer(), new JsonDeserializer<>(SearchRequest.class));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, SearchRequest> kafkaListenerSearchRequestsPrimary() {
        ConcurrentKafkaListenerContainerFactory<String, SearchRequest> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactorySearchRequestsPrimary());
        return factory;
    }

}
