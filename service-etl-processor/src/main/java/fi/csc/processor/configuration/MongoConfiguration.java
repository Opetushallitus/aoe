package fi.csc.processor.configuration;

import com.mongodb.MongoClientSettings;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import fi.csc.processor.converter.TimeFormatConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.core.convert.converter.Converter;
import java.util.ArrayList;
import java.util.List;

import static java.util.Collections.singletonList;

@Configuration
public class MongoConfiguration extends AbstractMongoClientConfiguration {
    private final Environment env;

    @Autowired
    MongoConfiguration(Environment env) {
        this.env = env;
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory databaseFactory, MappingMongoConverter converter) {
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return new MongoTemplate(databaseFactory, converter);
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        builder
            .credential(MongoCredential.createCredential(
                env.getProperty("spring.data.mongodb.username", String.class, ""),
                env.getProperty("spring.data.mongodb.database", String.class, ""),
                env.getProperty("spring.data.mongodb.password", String.class, "").toCharArray()))
            .applyToClusterSettings(settings -> settings.hosts(singletonList(new ServerAddress(
                env.getProperty("spring.data.mongodb.host", String.class, ""),
                env.getProperty("spring.data.mongodb.port", Integer.class, 27017)
            ))));
    }

    @Override
    protected String getDatabaseName() {
        return env.getProperty("spring.data.mongodb.database", String.class, "analytics");
    }

    @Bean
    @Override
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converterList = new ArrayList<>(TimeFormatConverter.getConvertersToRegister());
        return new MongoCustomConversions(converterList);
    }
}
