package fi.csc.oaipmh.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

@SpringBootTest
class MetadataServiceImplTest {

    @Autowired
    Environment env;

    @Test
    void getMetadata() {
        assertEquals("persistent", env.getProperty("aoe.identify.deleted-record"));
    }
}