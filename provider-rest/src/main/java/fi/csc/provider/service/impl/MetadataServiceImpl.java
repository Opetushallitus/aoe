package fi.csc.provider.service.impl;

import fi.csc.provider.model.aoe_response.AoeMetaFrame;
import fi.csc.provider.model.aoe_response.AoeMetadata;
import fi.csc.provider.model.xml_lrmi.LrmiMetadata;
import fi.csc.provider.model.xml_oaipmh.OaiPmhFrame;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.Identify;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.ListIdentifiers;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.ListRecords;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.Request;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.Record;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.ResumptionToken;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordHeader;
import fi.csc.provider.model.xml_oaipmh.sublevel_1st.sublevel_2nd.sublevel_3rd.RecordMetadata;
import fi.csc.provider.service.MetadataService;
import fi.csc.provider.service.MigrationService;
import fi.csc.provider.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.xml.bind.JAXBElement;
import javax.xml.namespace.QName;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetadataServiceImpl implements MetadataService {

    private final DateTimeFormatter CUSTOM_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

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
    public OaiPmhFrame getMetadata(String verb, String identifier, String metadataPrefix, String fromEncoded, String untilEncoded,
                                   String resumptionToken, String requestUrl) {

        OaiPmhFrame frame = new OaiPmhFrame();
        frame.setResponseDate(CUSTOM_DATETIME.format(LocalDateTime.now(ZoneOffset.UTC)));
        frame.setRequest(new Request(verb, identifier, metadataPrefix, env.getProperty("aoe.identify.base-url")));

        switch (verb.toUpperCase()) {
            case "GETRECORDS":
            case "LISTRECORDS":
                frame.setVerb(new JAXBElement<>(new QName(verb), ListRecords.class, new ListRecords()));
                setLrmiMetadata(frame, fromEncoded, untilEncoded, resumptionToken, false);
                break;
            case "LISTIDENTIFIERS":
                frame.setVerb(new JAXBElement<>(new QName(verb), ListIdentifiers.class, new ListIdentifiers()));
                setLrmiMetadata(frame, fromEncoded, untilEncoded, resumptionToken, true);
                break;
            case "IDENTIFY":
                setServiceInformation(frame, verb);
                break;
            case "LISTMETADATAFORMATS":
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

    /**
     * Fetch, convert and build OAI-PMH metadata for the harvesting response.
     * @param frame           OAI-PMH frame metadata structure {@link fi.csc.provider.model.xml_oaipmh.OaiPmhFrame}.
     * @param from            Format: "2018-09-10 09:11:40" - interval start date.
     * @param until           Format: "2018-09-10 09:11:40" - interval end date.
     * @param resumptionToken Integer number for the next batch.
     * @param identifiersOnly Boolean value for the identifiers (headers) only request.
     */
    private void setLrmiMetadata(OaiPmhFrame frame, String from, String until, String resumptionToken, boolean identifiersOnly) {
        Integer resumptionCounter = resolveResumptionValue(resumptionToken);

        AoeMetaFrame<List<AoeMetadata>> aoeMetaFrame = this.requestService.getAoeMetadata(from, until, resumptionCounter);
        List<AoeMetadata> aoeMetaContent = aoeMetaFrame.getContent();

        if (aoeMetaContent != null && aoeMetaContent.size() > 0) {

            List<LrmiMetadata> migratedMetadata = aoeMetaContent.stream()
                .map(aoe -> this.migrationService.migrateAoeToLrmi(aoe))
                .collect(Collectors.toList());
            List<Record> records = new ArrayList<>();

            migratedMetadata.forEach(meta -> {
                RecordHeader recordHeader = new RecordHeader(
                    (meta.getDeleted() ? "deleted": null),
                    meta.getIdentifier(),
                    (meta.getDateCreated() != null ? CUSTOM_DATETIME.format(meta.getDateCreated()) : ""));

                RecordMetadata recordMetadata = new RecordMetadata();
                recordMetadata.setLrmiMetadata(meta);

                Record record = new Record();
                record.setHeader(recordHeader);
                record.setMetadata(identifiersOnly || meta.getDeleted() ? null : recordMetadata);
                records.add(record);
            });
            
            addResumptionToken(frame, aoeMetaFrame, resumptionCounter, identifiersOnly);

            if (identifiersOnly) {
                ((ListIdentifiers) frame.getVerb().getValue()).setRecords(records);
                return;
            }
            ((ListRecords) frame.getVerb().getValue()).setRecords(records);
        }
    }

    /**
     * Set OAI-PMH resumption token to the end of metadata structure. Resumption token is a number of the next
     * metadata batch. Token is not present in the last batch of OAI-PMH metadata.
     * @param frame             OAI-PMH frame metadata structure {@link fi.csc.provider.model.xml_oaipmh.OaiPmhFrame}.
     * @param aoeMetaFrame      Generic data model for ListIdentifiers and ListRecords requests.
     * @param resumptionCounter Integer helper variable to provide the value of the next batch.
     * @param identifiersOnly   Boolean value to set the resumption token to identifiers data model.
     */
    private void addResumptionToken(OaiPmhFrame frame, AoeMetaFrame<?> aoeMetaFrame, Integer resumptionCounter, boolean identifiersOnly) {
        Integer next = ++resumptionCounter;
        Integer cursor = aoeMetaFrame.getPageNumber() * aoeMetaFrame.getMaterialPerPage();
        String resumptionString;

        if (resumptionCounter < aoeMetaFrame.getPageTotal()) {
            resumptionString = next.toString();
        } else {
            resumptionString = "";
        }
        if (identifiersOnly) {
            ((ListIdentifiers) frame.getVerb().getValue()).setResumptionToken(new ResumptionToken(
                aoeMetaFrame.getCompleteListSize(), cursor, resumptionString));
            return;
        }
        ((ListRecords) frame.getVerb().getValue()).setResumptionToken(new ResumptionToken(
            aoeMetaFrame.getCompleteListSize(), cursor, resumptionString));
    }

    /**
     * Convert String value of the resumption token into an integer.
     * @param resumptionToken String presentation of the numeric resumption token from the request parameters.
     * @return Integer value.
     */
    private Integer resolveResumptionValue(String resumptionToken) {
        if (resumptionToken.isEmpty()) {
            return 0;
        }
        return Integer.parseInt(resumptionToken);
    }
}
