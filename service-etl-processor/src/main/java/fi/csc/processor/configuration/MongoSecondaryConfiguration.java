package fi.csc.processor.configuration;

import com.mongodb.MongoClientSettings;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import static java.util.Collections.singletonList;

@Configuration
@EnableConfigurationProperties(MongoMultipleProperties.class)
@EnableMongoRepositories(
    basePackages = "fi.csc.processor.repository.secondary",
    mongoTemplateRef = "secondaryMongoTemplate")
public class MongoSecondaryConfiguration extends AbstractMongoClientConfiguration {
    private final MongoMultipleProperties mongoProperties;

    @Autowired
    MongoSecondaryConfiguration(
        MongoMultipleProperties mongoProperties) {
        this.mongoProperties = mongoProperties;
    }

    @Bean(name = "secondaryMongoTemplate")
    public MongoTemplate mongoTemplate(MongoDatabaseFactory databaseFactory, MappingMongoConverter converter) {
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return new MongoTemplate(databaseFactory, converter);
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        builder
            .credential(MongoCredential.createCredential(
                mongoProperties.getSecondary().getUsername(),
                mongoProperties.getSecondary().getDatabase(),
                mongoProperties.getSecondary().getPassword()))
            .applyToClusterSettings(settings -> settings.hosts(singletonList(new ServerAddress(
                mongoProperties.getSecondary().getHost(),
                mongoProperties.getSecondary().getPort()
            ))));
    }

    @Override
    protected String getDatabaseName() {
        return mongoProperties.getSecondary().getDatabase();
    }

//    @Bean
//    @Override
//    public MongoCustomConversions customConversions() {
//        List<Converter<?, ?>> converterList = new ArrayList<>(TimeFormatConverter.getConvertersToRegister());
//        return new MongoCustomConversions(converterList);
//    }
}
