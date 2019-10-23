package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import fi.csc.oaipmh.adapter.NumericBooleanDeserializer;
import fi.csc.oaipmh.adapter.NumericBooleanSerializer;
import fi.csc.oaipmh.model.response.sublevel_1st.sublevel_2nd.MaterialDisplayName;

import java.util.List;

@SuppressWarnings("unused")
public class Material {

    @JsonProperty
    private String id;

    @JsonProperty
    private String language;

    @JsonProperty
    private String key;

    @JsonProperty
    private String link;

    @JsonProperty
    private Integer priority;

    @JsonProperty
    private String filepath;

    @JsonProperty
    private String originalfilename;

    @JsonProperty
    private Integer filesize;

    @JsonProperty
    private String mimetype;

    @JsonProperty
    private String format;

    @JsonProperty
    private String filekey;

    @JsonProperty
    private String filebucket;

    @JsonProperty
    @JsonSerialize(using = NumericBooleanSerializer.class)
    @JsonDeserialize(using = NumericBooleanDeserializer.class)
    private Boolean obsoleted;

    @JsonProperty
    private List<MaterialDisplayName> materialdisplayname;
}
