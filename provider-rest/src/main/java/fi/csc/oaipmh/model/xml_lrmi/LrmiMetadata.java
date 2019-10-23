package fi.csc.oaipmh.model.xml_lrmi;

import fi.csc.oaipmh.adapter.DateTimeAdapter;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.Material;

import javax.xml.bind.annotation.*;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.time.LocalDateTime;
import java.util.List;

// @JsonIgnoreProperties(ignoreUnknown = true)
@SuppressWarnings("unused")
@XmlSeeAlso({Material.class})
@XmlAccessorType(XmlAccessType.NONE)
@XmlType(propOrder = {"id", "createdat", "updatedat", "publishedat", "archivedat", "typicalAgeRange", "materials"})
@XmlRootElement(name = "oai_dc:dc")
public class LrmiMetadata {

    @XmlAttribute(name = "xmlns:oai_dc")
    protected final String xmlns_oai_dc = "http://www.openarchives.org/OAI/2.0/oai_dc/";

    @XmlAttribute(name = "xmlns:dc")
    protected final String xmlns_dc = "http://purl.org/dc/elements/1.1/";

    @XmlAttribute(name = "xmlns:lrmi")
    protected final String xmlns_lrmi = "http://dublincore.org/dcx/lrmi-terms/1.1/";

    @XmlAttribute(name = "xmlns:xsi")
    protected final String xmlns_xsi = "http://www.w3.org/2001/XMLSchema-instance";

    @XmlAttribute(name = "xsi:schemaLocation")
    protected final String xsi_schemaLocation = "http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd";

    @XmlElement(name = "lrmi:id")
    private String id;

    // @JsonFormat(with = JsonFormat.Feature.ACCEPT_CASE_INSENSITIVE_PROPERTIES)
    @XmlElement(name = "lrmi:dateCreated")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime createdat;

    @XmlElement(name = "lrmi:dateModified")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime updatedat;

    @XmlElement(name = "lrmi:datePublished")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime publishedat;

    @XmlElement(name = "lrmi:dateArchived")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime archivedat;

    // Deserialization fields (from JSON) for typicalAgeRange
    private Integer agerangemin;
    private Integer agerangemax;

    // Serialization field (to XML) for typicalAgeRange
    @XmlElement(name = "lrmi:typicalAgeRange")
    private String getTypicalAgeRange() {
        return (agerangemin >= 0 ? agerangemin : "") + "-" + (agerangemax >= 0 ? agerangemax : "");
    }

    @XmlElement(name = "lrmi:materials")
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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
