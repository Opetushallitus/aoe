package fi.csc.processor.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeHttpRequests()
            .requestMatchers(HttpMethod.POST, "/produce/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/statistics/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/statistics/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/status").permitAll()
            .requestMatchers("/actuator/**").permitAll()
            .anyRequest().denyAll();
        return http.build();
    }
}
