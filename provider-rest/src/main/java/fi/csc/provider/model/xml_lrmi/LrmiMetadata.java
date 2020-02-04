package fi.csc.provider.model.xml_lrmi;

import fi.csc.provider.adapter.DateTimeAdapter;
import fi.csc.oaipmh.model.xml_lrmi.sublevel_1st.*;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.*;

import javax.xml.bind.Marshaller;
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

    @XmlAttribute(name = "xmlns:lrmi_fi")
    protected final String xmlns_lrmi_fi = "http://dublincore.org/dcx/lrmi-terms/1.1/";

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

    @XmlElement(name = "dc:subject")
    private String[] keyword;

    @XmlElement(name = "dc:rights")
    private String rights;

    @XmlElement(name = "dc:publisher")
    private List<String> publisher;

    @XmlElement(name = "dc:type")
    private List<String> type;

    @XmlElement(name = "dc:valid")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime valid;

    // LRMI

    @XmlElement(name = "lrmi_fi:dateCreated")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime dateCreated;

    @XmlElement(name = "lrmi_fi:dateModified")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime dateModified;

    // Invisible field for specifying the attribute status="deleted"
    private LocalDateTime archivedAt;

    @XmlElementWrapper(name = "lrmi_fi:author") // nillable = false, required = false
    @XmlElement(name = "lrmi_fi:person")
    private List<Author> author;

    @XmlElement(name = "lrmi_fi:material")
    private List<Material> material;

    // Deserialization fields (from JSON) for typicalAgeRange
    private Integer agerangemin;
    private Integer agerangemax;

    // Serialization field (to XML) for typicalAgeRange
    // @XmlElement(name = "fi_lrmi:typicalAgeRange")
    private String getTypicalAgeRange() {
        return (agerangemin >= 0 ? agerangemin : "") + "-" + (agerangemax >= 0 ? agerangemax : "");
    }

    @XmlElement(name = "lrmi_fi:educationalAudience")
    private List<EducationalAudience> educationalAudience;

    // learningResourceType => dc:type

    @XmlElement(name = "lrmi_fi:accessibilityFeature")
    private String[] accessibilityFeature;

    @XmlElement(name = "lrmi_fi:accessibilityHazard")
    private String[] accessibilityHazard;

    // keyword => dc:subject

    @XmlElement(name = "lrmi_fi:educationalAlignment")
    private String[] educationalLevel;

    @XmlElement(name = "lrmi_fi:educationalUse")
    private String[] educationalUse;

    // publisher => dc:publisher

    // author => dc:author

    @XmlElement(name = "lrmi_fi:isBasedOn")
    private List<IsBasedOn> isBasedOn;

    @XmlElement(name = "lrmi_fi:inLanguage")
    private List<InLanguage> inLanguage;

    @XmlElement(name = "lrmi_fi:alignmentObject")
    private List<AlignmentObject> alignmentObject;

    public LrmiMetadata() {}

    // JAXB event callback
    // void beforeUnmarshal(Unmarshaller m, Object parent)
    // void afterUnmarshal(Unmarshaller m, Object parent)
    private void beforeMarshal(Marshaller marshaller) {
        if (this.author != null && this.author.isEmpty()) {
            this.author = null;
        }
    }

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

    public String[] getKeyword() {
        return keyword;
    }

    public void setKeyword(String[] keyword) {
        this.keyword = keyword;
    }

    public String getRights() {
        return rights;
    }

    public void setRights(String rights) {
        this.rights = rights;
    }

    public List<String> getPublisher() {
        return publisher;
    }

    public void setPublisher(List<String> publisher) {
        this.publisher = publisher;
    }

    public List<String> getType() {
        return type;
    }

    public void setType(List<String> type) {
        this.type = type;
    }

    public LocalDateTime getValid() {
        return valid;
    }

    public void setValid(LocalDateTime valid) {
        this.valid = valid;
    }

    public LocalDateTime getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(LocalDateTime dateCreated) {
        this.dateCreated = dateCreated;
    }

    public LocalDateTime getDateModified() {
        return dateModified;
    }

    public void setDateModified(LocalDateTime dateModified) {
        this.dateModified = dateModified;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }

    public List<Author> getAuthor() {
        return author;
    }

    public void setAuthor(List<Author> author) {
        this.author = author;
    }

    public List<Material> getMaterial() {
        return material;
    }

    public void setMaterial(List<Material> material) {
        this.material = material;
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

    public List<EducationalAudience> getEducationalAudience() {
        return educationalAudience;
    }

    public void setEducationalAudience(List<EducationalAudience> educationalAudience) {
        this.educationalAudience = educationalAudience;
    }

    public String[] getEducationalLevel() {
        return educationalLevel;
    }

    public void setEducationalLevel(String[] educationalLevel) {
        this.educationalLevel = educationalLevel;
    }

    public String[] getEducationalUse() {
        return educationalUse;
    }

    public void setEducationalUse(String[] educationalUse) {
        this.educationalUse = educationalUse;
    }

    public List<IsBasedOn> getIsBasedOn() {
        return isBasedOn;
    }

    public void setIsBasedOn(List<IsBasedOn> isBasedOn) {
        this.isBasedOn = isBasedOn;
    }

    public String[] getAccessibilityFeature() {
        return accessibilityFeature;
    }

    public void setAccessibilityFeature(String[] accessibilityFeature) {
        this.accessibilityFeature = accessibilityFeature;
    }

    public String[] getAccessibilityHazard() {
        return accessibilityHazard;
    }

    public void setAccessibilityHazard(String[] accessibilityHazard) {
        this.accessibilityHazard = accessibilityHazard;
    }

    public List<InLanguage> getInLanguage() {
        return inLanguage;
    }

    public void setInLanguage(List<InLanguage> inLanguage) {
        this.inLanguage = inLanguage;
    }

    public List<AlignmentObject> getAlignmentObject() {
        return alignmentObject;
    }

    public void setAlignmentObject(List<AlignmentObject> alignmentObject) {
        this.alignmentObject = alignmentObject;
    }
}
