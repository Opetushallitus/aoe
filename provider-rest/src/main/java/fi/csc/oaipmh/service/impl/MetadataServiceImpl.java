package fi.csc.oaipmh.service.impl;

import fi.csc.oaipmh.model.xml_oaipmh.OaiPmhFrame;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.Identify;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.ListIdentifiers;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.ListRecords;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.Request;
import fi.csc.oaipmh.service.MetadataService;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import javax.xml.bind.JAXBElement;
import javax.xml.namespace.QName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
public class MetadataServiceImpl implements MetadataService {

    private final DateTimeFormatter CUSTOM_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");
    private Environment env;

    @Autowired
    private void setEnvironment(Environment env) {
        this.env = env;
    }

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
                setStaticProperties(frame, verb);
                break;
            default:
                return null;
        }
        return frame;
    }

    private void setStaticProperties(OaiPmhFrame frame, String verb) {

        // Service identifiers
        frame.setVerb(new JAXBElement<>(new QName(verb), Identify.class, new Identify(
            env.getProperty("aoe.identify.repository-name"),
            env.getProperty("aoe.identify.base-url"),
            env.getProperty("aoe.identify.protocol-version"),
            env.getProperty("aoe.identify.admin-email"),
            env.getProperty("aoe.identify.earliest-datestamp"),
            env.getProperty("aoe.identify.deleted-record"),
            env.getProperty("aoe.identify.granularity"),
            env.getProperty("aoe.identify.compression")
        )));

        // OAI identifiers
        ((Identify) frame.getVerb().getValue()).getOaiIdentifiers().get(0)
            .setScheme(env.getProperty("aoe.oai-identifier.scheme"));
        ((Identify) frame.getVerb().getValue()).getOaiIdentifiers().get(0)
            .setRepositoryIdentifier(env.getProperty("aoe.oai-identifier.repository-identifier"));
        ((Identify) frame.getVerb().getValue()).getOaiIdentifiers().get(0)
            .setDelimeter(env.getProperty("aoe.oai-identifier.delimeter"));
        ((Identify) frame.getVerb().getValue()).getOaiIdentifiers().get(0)
            .setSampleIdentifier(env.getProperty("aoe.oai-identifier.sample-identifier"));
    }
}
