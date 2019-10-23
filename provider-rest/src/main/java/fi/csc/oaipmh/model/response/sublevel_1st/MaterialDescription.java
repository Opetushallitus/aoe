package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class MaterialDescription {

    @JsonProperty
    private String id;

    @JsonProperty
    private String description;

    @JsonProperty
    private String language;

    @JsonProperty
    private String educationalmaterialid;
}
