package fi.csc.resolver.service.impl;

import fi.csc.resolver.model.Identifier;
import fi.csc.resolver.model.Link;
import fi.csc.resolver.model.RestPageImpl;
import fi.csc.resolver.model.TimeIntervalRequest;
import fi.csc.resolver.repository.LinkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ResolverServiceImplTest {

    @Mock
    private Environment env;

    @Mock
    private LinkRepository linkRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ResolverServiceImpl resolverService = new ResolverServiceImpl(env, linkRepository, restTemplate);

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    @DisplayName("populateLinkResources() - Null Page Failure")
    void populateLinkResources_nullPageFailure() {
        ResolverServiceImpl resolverServiceSpy = spy(new ResolverServiceImpl(env, linkRepository, restTemplate));
        doReturn(null).when(resolverServiceSpy).identifierRequest(anyInt(), anyInt(), any(LocalDateTime.class));
        resolverServiceSpy.populateLinkResources();
    }

    @Test
    @DisplayName("populateLinkResources() - One Identifier Success")
    void populateLinkResources_oneIdentifierSuccess() throws URISyntaxException {
        ResolverServiceImpl resolverServiceSpy = spy(new ResolverServiceImpl(env, linkRepository, restTemplate));
        List<Identifier> identifiers = new ArrayList<>() {{
            add(new Identifier(1L, 1L, "test.png", "test-1234.png"));
        }};
        Pageable pageable = PageRequest.of(0, 1);
        Page<Identifier> page = new PageImpl<>(identifiers, pageable, 1);
        doReturn(page).when(resolverServiceSpy).identifierRequest(anyInt(), anyInt(), any(LocalDateTime.class));
        doReturn("hash").when(resolverServiceSpy).generateHash(any(Identifier.class));
        doReturn("https://test.com/hash").when(resolverServiceSpy).generateTargetUrl(anyString());
        when(this.linkRepository.saveAll(anyList())).thenReturn(null);
        resolverServiceSpy.populateLinkResources();
    }

    @Test
    @DisplayName("populateLinkResources() - Invalid URI Failure")
    void populateLinkResources_invalidUriFailure() throws URISyntaxException {
        ResolverServiceImpl resolverServiceSpy = spy(new ResolverServiceImpl(env, linkRepository, restTemplate));
        List<Identifier> identifiers = new ArrayList<>() {{
            add(new Identifier(1L, 1L, "test.png", "test-1234.png"));
        }};
        Pageable pageable = PageRequest.of(0, 1);
        Page<Identifier> page = new PageImpl<>(identifiers, pageable, 1);
        doReturn(page).when(resolverServiceSpy).identifierRequest(anyInt(), anyInt(), any(LocalDateTime.class));
        doReturn("hash").when(resolverServiceSpy).generateHash(any(Identifier.class));
        doThrow(URISyntaxException.class).when(resolverServiceSpy).generateTargetUrl(anyString());
        resolverServiceSpy.populateLinkResources();
    }

    @Test
    @DisplayName("populateLinkResources() - Complete Success")
    void populateLinkResources_completeSuccess() {
        ResolverServiceImpl resolverServiceSpy = spy(new ResolverServiceImpl(env, linkRepository, restTemplate));
        List<Identifier> identifiers = new ArrayList<>() {{
            add(new Identifier(1L, 1L, "test.png", "test-1234.png"));
        }};
        Pageable pageable = PageRequest.of(0, 1);
        Page<Identifier> page = new PageImpl<>(identifiers, pageable, 1);
        doReturn(page).when(resolverServiceSpy).identifierRequest(anyInt(), anyInt(), any(LocalDateTime.class));
        when(this.linkRepository.saveAll(anyList())).thenReturn(null);
        resolverServiceSpy.populateLinkResources();
    }

    @Test
    @DisplayName("resolveIdentifier() - Find One Success")
    void resolveIdentifier_findOneSuccess() {
        when(this.linkRepository.findByHash(anyString())).thenReturn(new ArrayList<>() {{
            add(new Link());
        }});
        List<Link> links = this.resolverService.resolveIdentifier("test");
        assertEquals(1, links.size());
    }

    @Test
    @DisplayName("identifierRequest() - Execute POST Request Success")
    void identifierRequest_executePostRequestSuccess() {
        when(this.restTemplate.exchange(
            anyString(),
            any(HttpMethod.class),
            any(HttpEntity.class),
            eq(new ParameterizedTypeReference<RestPageImpl<Identifier>>() {})
        )).thenReturn(new ResponseEntity<>(new RestPageImpl<>(), HttpStatus.OK));
        Page<Identifier> page = this.resolverService.identifierRequest(0, 100, LocalDateTime.now());
        assertNotNull(page);
    }

    @Test
    @DisplayName("getRequestEntity() - Create Request Entity Success")
    void getRequestEntity_createRequestEntitySuccess() {
        int currentPage = 0;
        int pageSize = 100;
        LocalDateTime from = LocalDateTime.now().minusDays(1L);
        LocalDateTime until = LocalDateTime.now();
        HttpEntity<TimeIntervalRequest> actual = this.resolverService.getRequestEntity(currentPage, pageSize, from, until);
        assertNotNull(actual);
    }

    @Test
    @DisplayName("generateHash() - Generate Hash Success")
    void generateHash_generateHashSuccess() {
        Identifier identifier = new Identifier();
        identifier.setEducationalMaterialId(1L);
        identifier.setMaterialId(1L);
        identifier.setOriginalFileName("test.png");
        identifier.setFileKey("test-1234.png");
        String hash = this.resolverService.generateHash(identifier);
        assertEquals("3f3ce3f79f44485d890aace11f7d490d5ba5f862", hash);
    }

    @Test
    @DisplayName("generateTargetUrl() - Generate URL Success")
    void generateTargetUrl_generateUrlSuccess() throws URISyntaxException {
        when(this.env.getProperty("aoe.material.target-url")).thenReturn("https://test.com/");
        String uri = this.resolverService.generateTargetUrl("request");
        assertEquals("https://test.com/request", uri);
    }

    @Test
    @DisplayName("generateTargetUrl() - Invalid URL Failure")
    void generateTargetUrl_invalidUrlFailure() {
        when(this.env.getProperty("aoe.material.target-url")).thenReturn("http^test");
        assertThrows(URISyntaxException.class, () ->
            this.resolverService.generateTargetUrl("request"));
    }

    @Test
    @DisplayName("encodeUrl() - Encoding Success")
    void encodeUrl_encodingSuccess() throws UnsupportedEncodingException {
        String encoded = this.resolverService.encodeUrl("2020-01-01T00:00:00.000Z.jpg");
        assertEquals("2020-01-01T00%3A00%3A00.000Z.jpg", encoded);
    }
}
