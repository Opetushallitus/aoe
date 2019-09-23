package fi.csc.oaipmh.service.impl;

import fi.csc.oaipmh.model.OaiPmhFrame;
import fi.csc.oaipmh.model.sublevel_1st.Identify;
import fi.csc.oaipmh.model.sublevel_1st.ListIdentifiers;
import fi.csc.oaipmh.model.sublevel_1st.ListRecords;
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

        switch (verb.toUpperCase()) {
            case "GETRECORDS":
            case "LISTRECORDS":
                frame.setVerb(new JAXBElement<>(new QName(verb), ListRecords.class, new ListRecords()));
                break;
            case "LISTIDENTIFIERS":
                frame.setVerb(new JAXBElement<>(new QName(verb), ListIdentifiers.class, new ListIdentifiers()));
                break;
            case "IDENTIFY":
                frame.setVerb(new JAXBElement<>(new QName(verb), Identify.class, new Identify(
                    "CSC - AOE Open Metadata Interface",
                    "http://aoe.fi/rest/aoe-pmh",
                    "2.0",
                    "mika.ropponen@csc.fi",
                    "2001-07-08T22:00:00Z",
                    "persistent",
                    "YYYY-MM-DDThh:mm:ssZ",
                    ""
                )));
                break;
            default:
                return null;
        }
        // frame.setVerb(new JAXBElement<>(new QName(verb), String.class, ""));
        return frame;
    }
}
