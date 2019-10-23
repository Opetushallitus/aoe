package fi.csc.oaipmh.model.response.sublevel_1st;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("unused")
public class MaterialName {

    @JsonProperty
    private String id;

    @JsonProperty
    private String materialname;

    @JsonProperty
    private String language;

    @JsonProperty
    private String slug;

    @JsonProperty
    private String educationalmaterialid;
}
