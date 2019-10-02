package fi.csc.oaipmh.model.xml_lrmi;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import fi.csc.oaipmh.serialization.XmlDateTimeAdapter;

import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
@JacksonXmlRootElement(localName = "oai_dc:dc")
public class LrmiMetadata {

    @JacksonXmlProperty(localName = "xmlns:oai_dc", isAttribute = true)
    protected final String xmlns_oai_dc = "http://www.openarchives.org/OAI/2.0/oai_dc/";

    @JacksonXmlProperty(localName = "xmlns:dc", isAttribute = true)
    protected final String xmlns_dc = "http://purl.org/dc/elements/1.1/";

    @JacksonXmlProperty(localName = "xmlns:lrmi", isAttribute = true)
    protected final String xmlns_lrmi = "http://dublincore.org/dcx/lrmi-terms/1.1/";

    @JacksonXmlProperty(localName = "xmlns:xsi", isAttribute = true)
    protected final String xmlns_xsi = "http://www.w3.org/2001/XMLSchema-instance";

    @JacksonXmlProperty(localName = "xsi:schemaLocation", isAttribute = true)
    protected final String xsi_schemaLocation = "http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd";

    private Long id;

    // @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    // @XmlJavaTypeAdapter(value = XmlDateTimeAdapter.class, type = LocalDateTime.class)
    private LocalDateTime createdat;

    // @XmlJavaTypeAdapter(value = XmlDateTimeAdapter.class, type = LocalDateTime.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedat;

    // @XmlJavaTypeAdapter(value = XmlDateTimeAdapter.class, type = LocalDateTime.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime publishedat;

    // @XmlJavaTypeAdapter(value = XmlDateTimeAdapter.class, type = LocalDateTime.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime archivedat;

    /*private String[] materials;
    private String[] owner;
    private String[] name;
    private String[] author;
    private String[] publisher;
    private String[] description;
    private String[] keywords;
    private String[] learningResourceType;
    private String[] timeRequired;
    private String expires;
    private Object typicalAgeRange;
    private String[] educationalAlignment;
    private String[] educationalLevel;
    private String[] educationalUse;
    private String[] inLanguage;
    private String[] accessibilityFeatures;
    private String[] accessibilityHazards;
    private String license;
    private String isBAsedOn;
    private String[] materialDisplayName;
    private String[] educationalRole;*/

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @JacksonXmlProperty(localName = "lrmi:createdat")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    public LocalDateTime getCreatedat() {
        return createdat;
    }

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    public void setCreatedat(LocalDateTime createdat) {
        this.createdat = createdat;
    }

    @JacksonXmlProperty(localName = "lrmi:updatedat")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    public LocalDateTime getUpdatedat() {
        return updatedat;
    }

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    public void setUpdatedat(LocalDateTime updatedat) {
        this.updatedat = updatedat;
    }

    @JacksonXmlProperty(localName = "lrmi:publishedat")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    public LocalDateTime getPublishedat() {
        return publishedat;
    }

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    public void setPublishedat(LocalDateTime publishedat) {
        this.publishedat = publishedat;
    }

    @JacksonXmlProperty(localName = "lrmi:archivedat")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    public LocalDateTime getArchivedat() {
        return archivedat;
    }

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    public void setArchivedat(LocalDateTime archivedat) {
        this.archivedat = archivedat;
    }
}
