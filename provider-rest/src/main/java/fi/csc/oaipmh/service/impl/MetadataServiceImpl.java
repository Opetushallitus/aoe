package fi.csc.oaipmh.service.impl;

import fi.csc.oaipmh.model.response.AoeMetadata;
import fi.csc.oaipmh.model.xml_lrmi.LrmiMetadata;
import fi.csc.oaipmh.model.xml_oaipmh.OaiPmhFrame;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.Identify;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.ListRecords;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.Request;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd.Record;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordHeader;
import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordMetadata;
import fi.csc.oaipmh.service.MetadataService;
import fi.csc.oaipmh.service.MigrationService;
import fi.csc.oaipmh.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.xml.bind.JAXBElement;
import javax.xml.namespace.QName;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetadataServiceImpl implements MetadataService {

    private final DateTimeFormatter CUSTOM_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");
    private final DateTimeFormatter AOE_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    private final LocalDateTime NOT_ARCHIVED_VALUE = LocalDateTime
        .parse("9999-01-01T00:00:00.000Z", AOE_DATETIME)
        .atZone(ZoneId.of("UTC"))
        .toLocalDateTime();

    private Environment env;
    private MigrationService migrationService;
    private RequestService requestService;

    @Autowired
    public MetadataServiceImpl(Environment env, MigrationService migrationService, RequestService requestService) {
        this.env = env;
        this.migrationService = migrationService;
        this.requestService = requestService;
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
                setLrmiMetadata(frame);
                break;
            case "LISTIDENTIFIERS":
                /*frame.setVerb(new JAXBElement<>(new QName(verb), ListIdentifiers.class, new ListIdentifiers()));
                setTestMetadata(frame, true);
                break;*/
            case "LISTMETADATAFORMATS":
                return null;
            case "IDENTIFY":
                setServiceInformation(frame, verb);
                break;
            default:
                return null;
        }
        return frame;
    }

    private void setServiceInformation(OaiPmhFrame frame, String verb) {

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

    private void setLrmiMetadata(OaiPmhFrame frame) {
        List<AoeMetadata> aoeMetadata = this.requestService.getAoeMetadata();

        List<LrmiMetadata> migratedMetadata = aoeMetadata.stream()
            .map(aoe -> this.migrationService.migrateAoeToLrmi(aoe))
            .collect(Collectors.toList());
        List<Record> records = new ArrayList<>();

        migratedMetadata.forEach(meta -> {
            RecordHeader recordHeader = new RecordHeader(
                (meta.getArchivedAt().equals(NOT_ARCHIVED_VALUE) ? null : "deleted"),
                meta.getIdentifier(),
                (meta.getDateCreated() != null ? CUSTOM_DATETIME.format(meta.getDateCreated()) : ""));

            RecordMetadata recordMetadata = new RecordMetadata();
            recordMetadata.setLrmiMetadata(meta);

            Record record = new Record();
            record.setHeader(recordHeader);
            record.setMetadata(meta.getArchivedAt().equals(NOT_ARCHIVED_VALUE) ? recordMetadata : null);
            records.add(record);
        });
        ((ListRecords) frame.getVerb().getValue()).setRecords(records);
    }
}
