package fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st;

import fi.csc.oaipmh.model.xml_oaipmh.sublevel_1st.sublevel_2nd.OaiIdentifier;
import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlSeeAlso;

@XmlSeeAlso({OaiIdentifier.class})
@XmlAccessorType(XmlAccessType.NONE)
public class Identify {

    @XmlElement
    private String repositoryName;

    @XmlElement
    private String baseURL;

    @XmlElement
    private String protocolVersion;

    @XmlElement
    private String adminEmail;

    @XmlElement
    private String earliestDatestamp;

    @XmlElement
    private String deletedRecord;

    @XmlElement
    private String granularity;

    @XmlElement
    private String compression;

    @XmlElementWrapper(name = "description")
    @XmlElement(name = "oai-identifier")
    private List<OaiIdentifier> oaiIdentifiers = new ArrayList<>() {{
        add(new OaiIdentifier());
    }};

    public Identify() {}

    public Identify(String repositoryName, String baseURL, String protocolVersion, String adminEmail,
        String earliestDatestamp, String deletedRecord, String granularity, String compression) {
        this.repositoryName = repositoryName;
        this.baseURL = baseURL;
        this.protocolVersion = protocolVersion;
        this.adminEmail = adminEmail;
        this.earliestDatestamp = earliestDatestamp;
        this.deletedRecord = deletedRecord;
        this.granularity = granularity;
        this.compression = compression;
    }

    public String getRepositoryName() {
        return repositoryName;
    }

    public void setRepositoryName(String repositoryName) {
        this.repositoryName = repositoryName;
    }

    public String getBaseURL() {
        return baseURL;
    }

    public void setBaseURL(String baseURL) {
        this.baseURL = baseURL;
    }

    public String getProtocolVersion() {
        return protocolVersion;
    }

    public void setProtocolVersion(String protocolVersion) {
        this.protocolVersion = protocolVersion;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getEarliestDatestamp() {
        return earliestDatestamp;
    }

    public void setEarliestDatestamp(String earliestDatestamp) {
        this.earliestDatestamp = earliestDatestamp;
    }

    public String getDeletedRecord() {
        return deletedRecord;
    }

    public void setDeletedRecord(String deletedRecord) {
        this.deletedRecord = deletedRecord;
    }

    public String getGranularity() {
        return granularity;
    }

    public void setGranularity(String granularity) {
        this.granularity = granularity;
    }

    public String getCompression() {
        return compression;
    }

    public void setCompression(String compression) {
        this.compression = compression;
    }

    public List<OaiIdentifier> getOaiIdentifiers() {
        return oaiIdentifiers;
    }

    public void setOaiIdentifiers(List<OaiIdentifier> oaiIdentifiers) {
        this.oaiIdentifiers = oaiIdentifiers;
    }
}
