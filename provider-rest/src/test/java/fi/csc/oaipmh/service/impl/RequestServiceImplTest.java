package fi.csc.oaipmh.service.impl;

import fi.csc.oaipmh.model.request.MetadataRequest;
import fi.csc.oaipmh.model.xml_lrmi.LrmiMetadata;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@SpringBootTest
@RunWith(SpringRunner.class)
public class RequestServiceImplTest {

    @Mock
    Environment env;

    @Mock
    RestTemplate restTemplate;

    @InjectMocks
    RequestServiceImpl requestService = new RequestServiceImpl(env, restTemplate);

    @Before
    public void setUp() {
        // MockitoAnnotations.initMocks(this);
        when(this.env.getProperty(eq("aoe.request.per-page"), any(String.class))).thenReturn("100");
        when(this.env.getProperty(eq("aoe.request.url"))).thenReturn("https://demo.aoe.fi/api/oajpmh/materialMetaData");
    }

    @Test
    public void getAoeMetadata() {
        List<LrmiMetadata> lrmiMetadata = new ArrayList<>() {{
            add(new LrmiMetadata());
        }};
        ResponseEntity<List<LrmiMetadata>> lrmiResponse = new ResponseEntity<>(lrmiMetadata, HttpStatus.OK);

        when(restTemplate.exchange(
            any(String.class),
            any(HttpMethod.class),
            ArgumentMatchers.<HttpEntity<MetadataRequest>>any(),
            ArgumentMatchers.<ParameterizedTypeReference<List<LrmiMetadata>>>any())
        ).thenReturn(lrmiResponse);

        Assert.assertEquals(1, requestService.getAoeMetadata(0).getContent().size());
    }
}
