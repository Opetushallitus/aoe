package fi.csc.processor.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
            .antMatchers(HttpMethod.POST, "/produce/*").permitAll()
            .antMatchers(HttpMethod.POST, "/statistics/**").permitAll()
            .antMatchers(HttpMethod.GET, "/status").permitAll()
            .antMatchers("/actuator/**").permitAll()
            .anyRequest().denyAll();
    }

//    @Bean
//    public SecurityWebFilterChain securityWebFilterChain(
//            ServerHttpSecurity http) {
//        return http.authorizeExchange()
//                .pathMatchers("/actuator/**").permitAll()
//                .anyExchange().authenticated()
//                .and().build();
//    }
}
