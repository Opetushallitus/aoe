package fi.csc.processor.configuration;

import fi.csc.analytics.configuration.JPAConfigurationPrimary;
import fi.csc.analytics.configuration.JPAConfigurationSecondary;
import fi.csc.analytics.configuration.RDBConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;

@Configuration
@ComponentScan(value = "fi.csc", excludeFilters = @ComponentScan.Filter({ Configuration.class }))
@PropertySource("classpath:rdb.properties")
@EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
@Import({ RDBConfiguration.class, JPAConfigurationPrimary.class, JPAConfigurationSecondary.class })
public class ApplicationConfiguration {

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyConfigInDev() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}
