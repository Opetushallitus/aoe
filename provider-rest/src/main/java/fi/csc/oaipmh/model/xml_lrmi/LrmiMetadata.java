package fi.csc.oaipmh.model.xml_lrmi;

import fi.csc.oaipmh.adapter.DateTimeAdapter;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.Author;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.LangValue;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.Material;

import javax.xml.bind.annotation.*;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.time.LocalDateTime;
import java.util.List;

// @JsonIgnoreProperties(ignoreUnknown = true)
@SuppressWarnings("unused")
@XmlSeeAlso({Material.class})
@XmlAccessorType(XmlAccessType.NONE)
/* @XmlType(propOrder = {"identifier", "title", "creator", "date", "description", "subject", "format", "rights",
    "publisher", "type", "createdat", "updatedat", "publishedat", "archivedat", "typicalAgeRange", "materials"}) */
@XmlRootElement(name = "oai_dc:dc")
public class LrmiMetadata {

    @XmlAttribute(name = "xmlns:oai_dc")
    protected final String xmlns_oai_dc = "http://www.openarchives.org/OAI/2.0/oai_dc/";

    @XmlAttribute(name = "xmlns:dc")
    protected final String xmlns_dc = "http://purl.org/dc/elements/1.1/";

    @XmlAttribute(name = "xmlns:fi_lrmi")
    protected final String xmlns_lrmi = "http://dublincore.org/dcx/lrmi-terms/1.1/";

    // @XmlAttribute(name = "xmlns:sawsdl")
    // protected final String xmlns_sawsdl = "http://www.w3.org/ns/sawsdl";

    @XmlAttribute(name = "xmlns:xsi")
    protected final String xmlns_xsi = "http://www.w3.org/2001/XMLSchema-instance";

    @XmlAttribute(name = "xsi:schemaLocation")
    protected final String xsi_schemaLocation = "http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd";

    // DC - Dublin Core
    @XmlElement(name = "dc:id")
    private String identifier;

    @XmlElement(name = "dc:title")
    private List<LangValue> title;

    @XmlElement(name = "dc:date")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime date;

    @XmlElement(name = "dc:description")
    private List<LangValue> description;

    @XmlElementWrapper(name = "fi_lrmi:author", nillable = true, required = false)
    @XmlElement(name = "fi_lrmi:person", nillable = true, required = false)
    private List<Author> author;

    // @XmlElement(name = "dc:subject")
    private String[] subject;

    // @XmlElement(name = "dc:format")
    private String format;

    // @XmlElement(name = "dc:rights")
    private String rights;

    // @XmlElement(name = "dc:publisher")
    private String publisher;

    // @XmlElement(name = "dc:type")
    private String type;

    // FI-LRMI - Learning Resource Metadata Initiative
    // @XmlElement(name = "fi_lrmi:dateCreated")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime createdat;

    // @XmlElement(name = "fi_lrmi:dateModified")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime updatedat;

    // @XmlElement(name = "fi_lrmi:datePublished")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime publishedat;

    // @XmlElement(name = "fi_lrmi:dateArchived")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime archivedat;

    // Deserialization fields (from JSON) for typicalAgeRange
    private Integer agerangemin;
    private Integer agerangemax;

    // Serialization field (to XML) for typicalAgeRange
    // @XmlElement(name = "fi_lrmi:typicalAgeRange")
    private String getTypicalAgeRange() {
        return (agerangemin >= 0 ? agerangemin : "") + "-" + (agerangemax >= 0 ? agerangemax : "");
    }

    // @XmlElement(name = "fi_lrmi:materials")
    private List<Material> materials;

    /*
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
    private String[] educationalRole;
    */

    public LrmiMetadata() {}

    // DC
    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public List<LangValue> getTitle() {
        return title;
    }

    public void setTitle(List<LangValue> title) {
        this.title = title;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public List<LangValue> getDescription() {
        return description;
    }

    public void setDescription(List<LangValue> description) {
        this.description = description;
    }

    public List<Author> getAuthor() {
        return author;
    }

    public void setAuthor(List<Author> author) {
        this.author = author;
    }

    public String[] getSubject() {
        return subject;
    }

    public void setSubject(String[] subject) {
        this.subject = subject;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getRights() {
        return rights;
    }

    public void setRights(String rights) {
        this.rights = rights;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    // LRMI
    public LocalDateTime getCreatedat() {
        return createdat;
    }

    public void setCreatedat(LocalDateTime createdat) {
        this.createdat = createdat;
    }

    public LocalDateTime getUpdatedat() {
        return updatedat;
    }

    public void setUpdatedat(LocalDateTime updatedat) {
        this.updatedat = updatedat;
    }

    public LocalDateTime getPublishedat() {
        return publishedat;
    }

    public void setPublishedat(LocalDateTime publishedat) {
        this.publishedat = publishedat;
    }

    public LocalDateTime getArchivedat() {
        return archivedat;
    }

    public void setArchivedat(LocalDateTime archivedat) {
        this.archivedat = archivedat;
    }

    public List<Material> getMaterials() {
        return materials;
    }

    public void setMaterials(List<Material> materials) {
        this.materials = materials;
    }

    public Integer getAgerangemin() {
        return agerangemin;
    }

    public void setAgerangemin(Integer agerangemin) {
        this.agerangemin = agerangemin;
    }

    public Integer getAgerangemax() {
        return agerangemax;
    }

    public void setAgerangemax(Integer agerangemax) {
        this.agerangemax = agerangemax;
    }
}
