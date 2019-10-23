package fi.csc.oaipmh.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import fi.csc.oaipmh.adapter.LocalDateTimeDeserializer;
import fi.csc.oaipmh.adapter.LocalDateTimeSerializer;
import fi.csc.oaipmh.adapter.NumericBooleanDeserializer;
import fi.csc.oaipmh.adapter.NumericBooleanSerializer;
import fi.csc.oaipmh.model.response.sublevel_1st.*;

import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("unused")
public class AoeMetadataResponse {

    @JsonProperty
    private String id;

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
    private List<MaterialName> materialName;

    @JsonProperty
    private List<MaterialDescription> materialDescription;

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
    private List<AlignmentObject> aligmentobject;

    @JsonProperty
    private List<Owner> owner;
}
