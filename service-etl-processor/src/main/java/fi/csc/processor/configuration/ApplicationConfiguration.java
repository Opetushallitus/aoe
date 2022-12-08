package fi.csc.processor.configuration;

import fi.csc.analytics.configuration.JPAConfigurationPrimary;
import fi.csc.analytics.configuration.JPAConfigurationSecondary;
import fi.csc.analytics.configuration.RDBConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;

@Configuration
@ComponentScan(value = "fi.csc", excludeFilters = @ComponentScan.Filter({ Configuration.class }))
@PropertySource("classpath:rdb.properties")
@Import({ RDBConfiguration.class, JPAConfigurationPrimary.class, JPAConfigurationSecondary.class })
public class ApplicationConfiguration {

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyConfigInDev() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}
