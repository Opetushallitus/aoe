package fi.csc.processor.configuration;

import com.mongodb.MongoClientSettings;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import fi.csc.processor.converter.TimeFormatConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.ArrayList;
import java.util.List;

import static java.util.Collections.singletonList;

@Configuration
@EnableConfigurationProperties(MongoMultipleProperties.class)
@EnableMongoRepositories(
    basePackages = "fi.csc.processor.repository.primary",
    mongoTemplateRef = "primaryMongoTemplate")
public class MongoPrimaryConfiguration extends AbstractMongoClientConfiguration {
    private final MongoMultipleProperties mongoProperties;

    @Autowired
    MongoPrimaryConfiguration(
        MongoMultipleProperties mongoProperties) {
        this.mongoProperties = mongoProperties;
    }

    @Primary
    @Bean(name = "primaryMongoTemplate")
    public MongoTemplate mongoTemplate(MongoDatabaseFactory databaseFactory, MappingMongoConverter converter) {
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return new MongoTemplate(databaseFactory, converter);
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        builder
            .credential(MongoCredential.createCredential(
                mongoProperties.getPrimary().getUsername(),
                mongoProperties.getPrimary().getDatabase(),
                mongoProperties.getPrimary().getPassword()))
            .applyToClusterSettings(settings -> settings.hosts(singletonList(new ServerAddress(
                mongoProperties.getPrimary().getHost(),
                mongoProperties.getPrimary().getPort()
            ))));
    }

    @Override
    protected String getDatabaseName() {
        return mongoProperties.getPrimary().getDatabase();
    }

    @Bean
    @Override
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converterList = new ArrayList<>(TimeFormatConverter.getConvertersToRegister());
        return new MongoCustomConversions(converterList);
    }
}
