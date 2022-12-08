package fi.csc.analytics.configuration;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
@EntityScan(basePackages = "fi.csc.analytics.entity")
public class RDBConfiguration {

    @Bean
    @ConfigurationProperties("spring.datasource.primary")
    public DataSourceProperties dataSourcePropertiesPrimary() {
        return new DataSourceProperties();
    }

    @Bean
    @ConfigurationProperties("spring.datasource.secondary")
    public DataSourceProperties dataSourcePropertiesSecondary() {
        return new DataSourceProperties();
    }

    @Primary
    @Bean(name = "dataSourcePrimary")
    public DataSource dataSourcePrimary() {
        return dataSourcePropertiesPrimary()
            .initializeDataSourceBuilder()
            .build();
    }

    @Bean(name = "dataSourceSecondary")
    public DataSource dataSourceSecondary() {
        return dataSourcePropertiesSecondary()
            .initializeDataSourceBuilder()
            .build();
    }

    @Primary
    @Bean(name = "jdbcTemplatePrimary")
    public JdbcTemplate jdbcTemplatePrimary(@Qualifier("dataSourcePrimary") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean(name = "jdbcTemplateSecondary")
    public JdbcTemplate jdbcTemplateSecondary(@Qualifier("dataSourceSecondary") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
