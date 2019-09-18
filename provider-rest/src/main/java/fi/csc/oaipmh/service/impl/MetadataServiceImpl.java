package fi.csc.oaipmh.service.impl;

import fi.csc.oaipmh.model.OaiPmhFrame;
import fi.csc.oaipmh.model.sublevel_1st.Request;
import fi.csc.oaipmh.service.MetadataService;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import javax.xml.bind.JAXBElement;
import javax.xml.namespace.QName;
import org.springframework.stereotype.Service;

@Service
public class MetadataServiceImpl implements MetadataService {

    private final DateTimeFormatter CUSTOM_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    @Override
    public OaiPmhFrame getMetadata(String verb, String identifier, String metadataPrefix, String requestUrl) {
        OaiPmhFrame frame = new OaiPmhFrame();
        frame.setResponseDate(CUSTOM_DATETIME.format(LocalDateTime.now(ZoneOffset.UTC)));
        frame.setRequest(new Request(verb, identifier, metadataPrefix, requestUrl));
        frame.setVerb(new JAXBElement<>(new QName(verb), String.class, ""));
        return frame;
    }
}
