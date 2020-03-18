package fi.csc.resolver.service.impl;

import fi.csc.resolver.repository.LinkRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.core.env.Environment;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class ResolverServiceImplTest {

    @Mock
    private Environment env;

    @Mock
    private LinkRepository linkRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ResolverServiceImpl resolverService = new ResolverServiceImpl(
            env,
            linkRepository,
            restTemplate
    );

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    void populateLinkResources() {
    }

    @Test
    void resolveIdentifier() {
    }

    @Test
    @DisplayName("generateTargetUrl() - URL Generating Success")
    void generateTargetUrl_simpleSuccess() throws URISyntaxException {
        when(this.env.getProperty("aoe.material.target-url")).thenReturn("https://test.com/");
        String uri = this.resolverService.generateTargetUrl("request");
        assertEquals("https://test.com/request", uri);
    }

    @Test
    @DisplayName("generateTargetUrl() - Invalid URL Failure")
    void generateTargetUrl_invalidUrlFailure() {
        when(this.env.getProperty("aoe.material.target-url")).thenReturn("http^test");
        Assertions.assertThrows(URISyntaxException.class, () -> {
            this.resolverService.generateTargetUrl("request");
        });
    }

    @Test
    @DisplayName("encodeUrl() - Encoding Success")
    void encodeUrl_encodingSuccess() throws UnsupportedEncodingException {
        String encoded = this.resolverService.encodeUrl("2020-01-01T00:00:00.000Z.jpg");
        assertEquals("2020-01-01T00%3A00%3A00.000Z.jpg", encoded);
    }
}