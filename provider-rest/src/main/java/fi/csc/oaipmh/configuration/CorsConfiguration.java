package fi.csc.oaipmh.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author mroppone
 */
@Configuration
public class CorsConfiguration implements WebMvcConfigurer {

    // @Value("${access.control.allow.origin}")
    private String[] origins = new String[]{"*"};

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        configurer.enable();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
            .addMapping("/**")
            .allowedOrigins(origins)
            .allowedMethods("POST", "GET", "PUT", "OPTIONS", "DELETE", "X-XSFR-TOKEN")
            .allowCredentials(true)
            .maxAge(3600L)
            .allowedHeaders(
                "Accept",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "Authorization",
                "Cache-Control",
                "Client-Security-Token",
                "Content-Type",
                "Cookie",
                "Origin",
                "Pragma",
                "X-Requested-With");
    }
}
