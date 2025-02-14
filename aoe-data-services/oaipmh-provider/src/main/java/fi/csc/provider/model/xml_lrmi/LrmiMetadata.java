package fi.csc.provider.model.xml_lrmi;

import fi.csc.provider.adapter.DateTimeAdapter;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.*;
import fi.csc.provider.model.xml_lrmi.sublevel_1st.sublevel_2nd.GeneralType;
import jakarta.xml.bind.JAXBElement;
import jakarta.xml.bind.annotation.*;
import jakarta.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/* @XmlType(propOrder = {"identifier", "title", "creator", "date", "description", "subject", "format", "rights",
    "publisher", "type", "createdat", "updatedat", "publishedat", "archivedat", "typicalAgeRange", "materials"}) */
@Getter
@Setter
@SuppressWarnings("unused")
@XmlSeeAlso({Material.class, Person.class, Organization.class, GeneralType.class, EducationalAlignment.class})
@XmlAccessorType(XmlAccessType.NONE)
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

    // Temporary deleted status based on AOE obsoleted field - dropped out from the final LRMI results.
    private Boolean deleted;

    // DC - Dublin Core

    private String identifier;

    @XmlElement(name = "dc:identifier")
    private String identifierURN;

    @XmlElement(name = "dc:identifier")
    private String identifierUrl;

    @XmlElement(name = "dc:title")
    private List<LangValue> title;

    @XmlElement(name = "dc:date")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime date;

    @XmlElement(name = "dc:description")
    private List<LangValue> description;

    @XmlElement(name = "dc:description")
    private Thumbnail thumbnail;

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

    // LRMI - Learning Resource Metadata Initiative

    @XmlElement(name = "lrmi_fi:dateCreated")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime dateCreated;

    @XmlElement(name = "lrmi_fi:dateModified")
    @XmlJavaTypeAdapter(DateTimeAdapter.class)
    private LocalDateTime dateModified;

    // Invisible field for specifying the attribute status="deleted"
    private LocalDateTime archivedAt;

    @XmlElement(name = "lrmi_fi:timeRequired")
    private String timeRequired;

    @XmlElementWrapper(name = "lrmi_fi:author")
    @XmlAnyElement
    private List<JAXBElement<?>> authors;

    // Descriptive keywords of an educational material (dc:keyword)
    @XmlElement(name = "lrmi_fi:about")
    private List<About> abouts;

    @XmlElement(name = "lrmi_fi:material")
    private List<Material> material;

    // Deserialization fields (from JSON) for typicalAgeRange
    private Integer agerangemin;
    private Integer agerangemax;

    private LocalDateTime publishedAt;

    // Serialization field (to XML) for typicalAgeRange
    // @XmlElement(name = "fi_lrmi:typicalAgeRange")
    private String getTypicalAgeRange() {
        return (agerangemin >= 0 ? agerangemin : "") + "-" + (agerangemax >= 0 ? agerangemax : "");
    }

    @XmlElement(name = "lrmi_fi:educationalAudience")
    private List<EducationalAudience> educationalAudience;

    @XmlElement(name = "lrmi_fi:accessibilityFeature")
    private String[] accessibilityFeature;

    @XmlElement(name = "lrmi_fi:accessibilityHazard")
    private String[] accessibilityHazard;

    @XmlElement(name = "lrmi_fi:isBasedOn")
    private List<IsBasedOn> isBasedOn;

    // Unique collection of language codes used in linked materials - "fi", "en", etc.
    @XmlElement(name = "lrmi_fi:inLanguage")
    private Set<String> inLanguage;

    @XmlElementWrapper(name = "lrmi_fi:learningResource")
    @XmlAnyElement
    private List<JAXBElement<?>> learningResources;

    @XmlElement(name = "lrmi_fi:alignmentObject")
    private List<AlignmentObject> alignmentObject;

    public LrmiMetadata() {}

    public void setPublishedAt(LocalDateTime publishedat) {
        this.publishedAt = publishedat;
    }

    // JAXB event callback
    // void beforeUnmarshal(Unmarshaller m, Object parent)
    // void afterUnmarshal(Unmarshaller m, Object parent)
    // private void beforeMarshal(Marshaller marshaller) {
    //     if (this.author != null && this.author.isEmpty()) {
    //         this.author = null;
    //     }
    // }
}
