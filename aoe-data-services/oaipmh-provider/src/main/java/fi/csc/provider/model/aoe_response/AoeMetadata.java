package fi.csc.provider.model.aoe_response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import fi.csc.provider.adapter.LocalDateTimeDeserializer;
import fi.csc.provider.adapter.LocalDateTimeSerializer;
import fi.csc.provider.adapter.NumericBooleanDeserializer;
import fi.csc.provider.adapter.NumericBooleanSerializer;
import fi.csc.provider.model.aoe_response.sublevel_1st.*;

import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("unused")
public class AoeMetadata {

    @JsonProperty
    private Long id;

    @JsonProperty
    private String urn;

    @JsonProperty
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime createdat;

    @JsonProperty
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime updatedat;

    @JsonProperty
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime archivedat;

    @JsonProperty
    private String timerequired;

    @JsonProperty
    private Integer agerangemin;

    @JsonProperty
    private Integer agerangemax;

    @JsonProperty
    private String licensecode;

    @JsonProperty
    @JsonSerialize(using = NumericBooleanSerializer.class)
    @JsonDeserialize(using = NumericBooleanDeserializer.class)
    private Boolean obsoleted;

    @JsonProperty
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime originalpublishedat;

    @JsonProperty
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime expires;

    @JsonProperty
    private List<Material> materials;

    @JsonProperty
    private List<MaterialName> materialname;

    @JsonProperty
    private List<MaterialDescription> materialdescription;

    @JsonProperty
    private List<EducationalAudience> educationalaudience;

    @JsonProperty
    private List<LearningResourceType> learningresourcetype;

    @JsonProperty
    private List<AccessibilityFeature> accessibilityfeature;

    @JsonProperty
    private List<AccessibilityHazard> accessibilityhazard;

    @JsonProperty
    private List<Keyword> keyword;

    @JsonProperty
    private List<EducationalLevel> educationallevel;

    @JsonProperty
    private List<EducationalUse> educationaluse;

    @JsonProperty
    private List<Publisher> publisher;

    @JsonProperty
    private List<Author> author;

    @JsonProperty
    private List<IsBasedOn> isbasedon;

    @JsonProperty
    private List<InLanguage> inlanguage;

    @JsonProperty
    private List<AlignmentObject> alignmentobject;

    @JsonProperty
    private List<Owner> owner;

    @JsonProperty
    private Thumbnail thumbnail;

    @JsonProperty
    private String aoeUrl;

    @JsonProperty
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime urnpublishedat;

    // Getters only
    public Long getId() {
        return id;
    }

    public String getUrn() {
        return urn;
    }

    public String getAoeUrl() {
        return this.aoeUrl;
    }

    public LocalDateTime getUrnPublishedat() {
        return this.urnpublishedat;
    }

    public LocalDateTime getCreatedat() {
        return createdat;
    }

    public LocalDateTime getUpdatedat() {
        return updatedat;
    }

    public LocalDateTime getArchivedat() {
        return archivedat;
    }

    public String getTimerequired() {
        return timerequired;
    }

    public Integer getAgerangemin() {
        return agerangemin;
    }

    public Integer getAgerangemax() {
        return agerangemax;
    }

    public String getLicensecode() {
        return licensecode;
    }

    public Boolean getObsoleted() {
        return obsoleted;
    }

    public LocalDateTime getOriginalpublishedat() {
        return originalpublishedat;
    }

    public LocalDateTime getExpires() {
        return expires;
    }

    public List<Material> getMaterials() {
        return materials;
    }

    public void setMaterials(List<Material> materials) {
        this.materials = materials;
    }

    public List<MaterialName> getMaterialname() {
        return materialname;
    }

    public List<MaterialDescription> getMaterialdescription() {
        return materialdescription;
    }

    public List<EducationalAudience> getEducationalaudience() {
        return educationalaudience;
    }

    public List<LearningResourceType> getLearningresourcetype() {
        return learningresourcetype;
    }

    public List<AccessibilityFeature> getAccessibilityfeature() {
        return accessibilityfeature;
    }

    public List<AccessibilityHazard> getAccessibilityhazard() {
        return accessibilityhazard;
    }

    public List<Keyword> getKeyword() {
        return keyword;
    }

    public List<EducationalLevel> getEducationallevel() {
        return educationallevel;
    }

    public List<EducationalUse> getEducationaluse() {
        return educationaluse;
    }

    public List<Publisher> getPublisher() {
        return publisher;
    }

    public List<Author> getAuthor() {
        return author;
    }

    public List<IsBasedOn> getIsbasedon() {
        return isbasedon;
    }

    public List<InLanguage> getInlanguage() {
        return inlanguage;
    }

    public List<AlignmentObject> getAlignmentobject() {
        return alignmentobject;
    }

    public List<Owner> getOwner() {
        return owner;
    }

    public Thumbnail getThumbnail() {
        return thumbnail;
    }
}
