package fi.csc.processor.configuration;

import com.mongodb.MongoClientSettings;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import fi.csc.processor.converter.TimeFormatConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.ArrayList;
import java.util.List;

import static java.util.Collections.singletonList;

@Configuration
@EnableConfigurationProperties
@EnableMongoRepositories(
    basePackages = "fi.csc.processor.repository.primary",
    mongoTemplateRef = "primaryMongoTemplate")
public class MongoPrimaryConfiguration {

    @Primary
    @Bean(name = "primaryProperties")
    @ConfigurationProperties("mongodb.primary")
    public MongoProperties primaryProperties() {
        return new MongoProperties();
    }

    @Bean(name = "primaryMongoClient")
    public MongoClient mongoClient(@Qualifier("primaryProperties") MongoProperties mongoProperties) {
        return MongoClients.create(MongoClientSettings.builder()
            .credential(MongoCredential.createCredential(
                mongoProperties.getUsername(),
                mongoProperties.getDatabase(),
                mongoProperties.getPassword()))
            .applyToClusterSettings(settings -> settings.hosts(singletonList(new ServerAddress(
                mongoProperties.getHost(),
                mongoProperties.getPort()
            ))))
            .build());
    }

    @Primary
    @Bean(name = "primaryMongoDBFactory")
    public MongoDatabaseFactory mongoDatabaseFactory(
        @Qualifier("primaryMongoClient") MongoClient mongoClient,
        @Qualifier("primaryProperties") MongoProperties mongoProperties) {
        return new SimpleMongoClientDatabaseFactory(mongoClient, mongoProperties.getDatabase());
    }

    @Primary
    @Bean(name = "primaryMongoTemplate")
    public MongoTemplate mongoTemplate(
        @Qualifier("primaryMongoDBFactory") MongoDatabaseFactory databaseFactory,
        MappingMongoConverter converter) {
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return new MongoTemplate(databaseFactory, converter);
    }

    @Bean
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converterList = new ArrayList<>(TimeFormatConverter.getConvertersToRegister());
        return new MongoCustomConversions(converterList);
    }
}
