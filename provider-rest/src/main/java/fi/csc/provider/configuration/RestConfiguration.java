package fi.csc.provider.configuration;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.net.ssl.SSLContext;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;

@Configuration
public class RestConfiguration implements WebMvcConfigurer {

    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        ObjectMapper objectMapper = builder.createXmlMapper(false).build();
        // ObjectMapper objectMapper = Jackson2ObjectMapperBuilder.xml().build();
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // objectMapper.enable(JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER);
        // objectMapper.enable(JsonGenerator.Feature.ESCAPE_NON_ASCII);
        objectMapper.enable(SerializationFeature.WRITE_ENUMS_USING_TO_STRING);
        objectMapper.enable(DeserializationFeature.READ_ENUMS_USING_TO_STRING);
        // objectMapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
        // objectMapper.registerModule(new JsonldModule());
        return objectMapper;
    }

    @Bean
    @Profile("prod")
    public RestTemplate prodRestTemplate() throws KeyStoreException, NoSuchAlgorithmException, KeyManagementException {

        TrustStrategy acceptingTrustStrategy = (X509Certificate[] chain, String authType) -> true;
        SSLContext sslContext = org.apache.http.ssl.SSLContexts.custom()
            .loadTrustMaterial(null, acceptingTrustStrategy)
            .build();
        SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory(sslContext);
        CloseableHttpClient httpClient = HttpClients.custom()
            .setSSLSocketFactory(csf)
            .build();
        HttpComponentsClientHttpRequestFactory requestFactory =
            new HttpComponentsClientHttpRequestFactory();
        requestFactory.setHttpClient(httpClient);

        return new RestTemplate(requestFactory);
    }

    @Bean
    @Profile("dev")
    public RestTemplate devRestTemplate() throws KeyStoreException, NoSuchAlgorithmException, KeyManagementException {

        TrustStrategy acceptingTrustStrategy = (X509Certificate[] chain, String authType) -> true;
        SSLContext sslContext = org.apache.http.ssl.SSLContexts.custom()
            .loadTrustMaterial(null, acceptingTrustStrategy)
            .build();
        SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory(sslContext);
        CloseableHttpClient httpClient = HttpClients.custom()
            .setSSLSocketFactory(csf)
            .build();
        HttpComponentsClientHttpRequestFactory requestFactory =
            new HttpComponentsClientHttpRequestFactory();
        requestFactory.setHttpClient(httpClient);

        return new RestTemplate(requestFactory);
    }
}
